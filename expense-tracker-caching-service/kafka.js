import { Kafka } from "kafkajs";
import os from "os";
import redis from "./redis.js";
import { REDIS_CACHE_KEYS } from "./enum/redis.js";

console.log(`${process.env.KAFKA_PORT}`, "kafka port");
const kafka = new Kafka({
  clientId: "redis-app",
  brokers: [`${process.env.KAFKA_PORT}`],
});

const consumer = kafka.consumer({
  groupId: `redis-cache-consumer-${os.hostname()}`,
});

export const connectKafka = async () => {
  await consumer.connect();
  await consumer.subscribe({ topics: ["redis_cache_data"] });
  await consumer.run({ eachMessage: handleKafkaEvent });
};

const handleKafkaEvent = async ({ topic, message: kafkaMessage }) => {
  const eventJson = JSON.parse(kafkaMessage.value.toString());

  console.log(topic, "topic,", eventJson);
  switch (eventJson.requestType) {
    case REDIS_CACHE_KEYS.CONVERSATION_PARTICIPANTS:
      handleCreateConversationParticipants(eventJson.data);
      break;
    default:
      console.log("Unknown topic", topic);
  }
};

const handleCreateConversationParticipants = async (eventData) => {
  const { conversationId, participants } = eventData;

  const added = await redis.add(
    `${REDIS_CACHE_KEYS.CONVERSATION_PARTICIPANTS}:${conversationId}`,
    participants
  );
  console.log(added, "added");
};
