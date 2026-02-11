import { WebSocketServer } from "ws";
import websocketConnections from "./controller/websocket/users.js";
import { decodeAndValidateUser } from "./utils/validate.js";
import dotenv from "dotenv";
import { connectKafka } from "./kafka.js";

dotenv.config();

const wss = new WebSocketServer({ port: process.env.PORT || 8000 });

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
