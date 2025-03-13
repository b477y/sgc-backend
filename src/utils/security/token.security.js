import jwt from "jsonwebtoken";
import { TokenType, UserRole } from "../enum/enums.js";
import UserModel from "../../db/models/User.model.js";

export const generateTokens = async ({
  payload,
  accessTokenSK = null, // optional
  refreshTokenSK,
  tokenType = [TokenType.ACCESS, TokenType.REFRESH],
}) => {
  if (!payload || !refreshTokenSK) {
    throw new Error("Payload and refresh token secret key are required.");
  }

  let tokens = {};

  if (tokenType.includes(TokenType.ACCESS) && accessTokenSK) {
    tokens.accessToken = jwt.sign(payload, accessTokenSK, {
      expiresIn: process.env.ACCESS_TOKEN_EXPIRY,
    });
  }

  if (tokenType.includes(TokenType.REFRESH)) {
    tokens.refreshToken = jwt.sign(payload, refreshTokenSK, {
      expiresIn: process.env.REFRESH_TOKEN_EXPIRY,
    });
  }

  return tokens;
};

export const verifyToken = ({ token, secretKey } = {}) => {
  const decoded = jwt.verify(token, secretKey);
  return decoded;
};

export const decodeToken = async ({ authorization, tokenType } = {}) => {
  if (typeof authorization !== "string") {
    throw new Error("Invalid authorization format", { cause: 401 });
  }

  const [bearer, token] = authorization.split(" ");

  if (!bearer || !token) {
    throw new Error("Invalid authorization format", { cause: 401 });
  }

  let accessTokenSK, refreshTokenSK;

  switch (bearer) {
    case "Admin":
      accessTokenSK = process.env.ADMIN_ACCESS_TOKEN_SK;
      refreshTokenSK = process.env.ADMIN_REFRESH_TOKEN_SK;
      break;
    case "Bearer":
      accessTokenSK = process.env.USER_ACCESS_TOKEN_SK;
      refreshTokenSK = process.env.USER_REFRESH_TOKEN_SK;
      break;
    default:
      throw new Error("Invalid token type", { cause: 401 });
  }

  const decoded = verifyToken({
    token,
    secretKey: tokenType === TokenType.ACCESS ? accessTokenSK : refreshTokenSK,
  });

  if (!decoded?.userId) {
    throw new Error("Invalid token payload", { cause: 401 });
  }

  const user = await UserModel.findOne({
    _id: decoded.userId,
    deletedAt: { $exists: false },
  });

  if (!user) {
    throw new Error("Not registered account", { cause: 404 });
  }

  if (user.changeCredentialsTime?.getTime() >= decoded.iat * 1000) {
    throw new Error("Invalid credentials", { cause: 400 });
  }

  return { userId: user._id, role: user.role };
};
