import { Kafka } from "kafkajs";
import os from "os";
import websocketConnection from "./controller/websocket/users.js";

const kafka = new Kafka({
  clientId: "message-app",
  brokers: [`${process.env.KAFKA_PORT}`],
});

const consumer = kafka.consumer({
  groupId: `deliver-message-consumer-${os.hostname()}`,
});

export const connectKafka = async () => {
  await consumer.connect();
  await consumer.subscribe({ topics: ["websocket_messages"] });
  await consumer.run({ eachMessage: handleKafkaEvent });
};

const handleSendMessage = (eventData) => {
  const { message, participants } = eventData;
  console.log(eventData, message, participants);

  const messageJson = {
    requestType: "deliver_message",
    data: {
      id: message.id,
      conversationId: message.conversationId,
      content: message.content,
      type: message.type,
      edited: message.edited,
      unRead: message.unRead,
      isDeleted: message.isDeleted,
      senderId: message.senderId,
      sentAt: message.sentAt,
    },
  };

  participants.forEach((participant) => {
    websocketConnection.sendMessageToUser(Number(participant), messageJson);
  });
};

const handleNewConversation = (eventData) => {
  const { to, message } = eventData;

  const messageJson = {
    requestType: "new_conversation",
    data: {
      friend: {
        userId: message.friend.userId,
        email: message.friend.email,
        name: message.friend.name,
      },
      conversation: {
        conversationId: message.conversation.conversationId,
        type: message.conversation.type,
        participantId: message.conversation.participantId,
        lastMessage: message.conversation.lastMessage,
      },
      messageId: message.messageId,
    },
  };

  websocketConnection.sendMessageToUser(Number(to), messageJson);
};

const handleKafkaEvent = async ({ topic, message: kafkaMessage }) => {
  const eventJson = JSON.parse(kafkaMessage.value.toString());

  switch (eventJson.requestType) {
    case "deliver_message":
      handleSendMessage(eventJson.data);
      break;
    case "new_conversation":
      handleNewConversation(eventJson.data);
      break;
    default:
      console.log("Unknown topic", topic);
  }
};
