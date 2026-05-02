import { addUserInRedis, deleteUserInRedis } from "../../redis.js";
const connectionPrefix = "WS_CONNECTION_";
const users = new Map(); // {user_id: socket}

const addUser = async (userId, socketObject, uuid) => {
  const userKey = `${connectionPrefix}${userId}`;
  const connection = await addUserInRedis(userKey, uuid);

  //Reject connection if already exist
  if (!connection)
    return socketObject.close(4000, { message: "Connection Already Exist" });

  users.set(userId, socketObject);
};

const removeUser = async (userId, uuid) => {
  const userKey = `${connectionPrefix}${userId}`;
  const deleted = await deleteUserInRedis(userKey, uuid);

  if (!deleted) return;

  users.delete(userId);
};

const hasUser = (userId) => users.has(userId);

const sendMessageToUser = (userId, messagePayload) => {
  if (users.has(userId)) users.get(userId).send(JSON.stringify(messagePayload));
};

export default { addUser, hasUser, sendMessageToUser, removeUser };
