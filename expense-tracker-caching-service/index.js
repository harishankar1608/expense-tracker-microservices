import { connectKafka } from "./kafka.js";
import redis from "./redis.js";

// console.log(process.env);
connectKafka();
redis.connect();
