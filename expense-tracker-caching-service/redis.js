import { createClient } from "redis";
import dotenv from "dotenv";

dotenv.config();

const client = createClient({ url: process.env.REDIS_CONNECTION_URL });

const connect = async () => {
  await client
    .on("error", (err) => console.log("Redis Client Error", err))
    .connect();

  console.log(client, "Client");
};

const add = async (key, value) => {
  console.log(key, value);
  return client.set(key, JSON.stringify(value));
};

// docker run --name expense_tracker_redis -p 6379:6379 -d redis:latest --requirepass "9535"
export default {
  connect,
  add,
};
