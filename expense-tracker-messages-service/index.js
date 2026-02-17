import { WebSocketServer } from "ws";
import websocketConnections from "./controller/websocket/users.js";
import { decodeAndValidateUser } from "./utils/validate.js";
import dotenv from "dotenv";
import { connectKafka } from "./kafka.js";
import express from "express";

const app = express();

app.get("/", (req, res) => {
  return res.status(200).send({ message: "Websocket server is running" });
});

const server = app.listen(process.env.PORT, () =>
  console.log(`Server is running on port ${process.env.PORT}`)
);

dotenv.config();

const wss = new WebSocketServer({ server, path: "/messages" });

wss.on("connection", async (ws, req) => {
  const headerCookies = req.headers.cookie || "";
  const cookies = headerCookies.split(";") || [];
  const sessionIdCookie = cookies.find(
    (cookie) => cookie.trim().split("=")[0] === "session_id"
  );

  if (!sessionIdCookie) {
    console.log("No session id found for user");
    ws.close(3003, { message: "Not authorized" });
    return;
  }

  const sessionId = sessionIdCookie.split("=")[1];

  const isValid = await decodeAndValidateUser(sessionId);

  if (!isValid.status) {
    ws.close(3003, { message: "No user found" });
    return;
  }

  websocketConnections.addUser(isValid.userId, ws);

  ws.on("close", () => {
    websocketConnections.removeUser(isValid.userId);
  });
});

connectKafka();
