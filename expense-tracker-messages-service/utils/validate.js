import { UserTable } from "../database_models/index.js";
import { decodeUserId } from "./decode.js";

export const decodeAndValidateUser = async (sessionId) => {
  const userId = decodeUserId(sessionId);

  const user = await UserTable.findByPk(userId, { attributes: ["user_id"] });

  if (!user) return { status: false, userId: null };

  return { status: true, userId: Number(user.dataValues.user_id) };
};
