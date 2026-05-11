import { createClient } from "redis";
import dotenv from "dotenv";
import websocketConnection from "./controller/websocket/users.js";

dotenv.config();

const client = createClient({ url: process.env.REDIS_CONNECTION_URL });

const userClient = createClient({ url: process.env.REDIS_CONNECTION_URL });

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

export const connectRedis = async () => {
  await client
    .on("error", (error) => {
      console.log(error, "Error");
      console.log("Error while connecting to redis");
    })
    .connect();
  await userClient
    .on("error", (error) => {
      console.log(error, "Error");
      console.log("Error while connecting to redis userClient");
    })
    .connect();

  await client.subscribe("websocket_messages", (kafkaMessage) => {
    console.log(kafkaMessage, "Kafka Message");
    const eventJson = JSON.parse(kafkaMessage.toString());

    switch (eventJson.requestType) {
      case "deliver_message":
        handleSendMessage(eventJson.data);
        break;
      case "new_conversation":
        handleNewConversation(eventJson.data);
        break;
      default:
        console.log("Unknown topic");
    }
  });
};

export const addUserInRedis = (key, value) => {
  return userClient.set(key, value, {
    condition: "NX",
    expiration: { type: "EX", value: 600 },
  });
};

export const deleteUserInRedis = (key, uuid) => {
  return userClient.delEx(key, { condition: "IFEQ", matchValue: uuid });
};
