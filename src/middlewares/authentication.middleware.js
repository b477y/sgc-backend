import { decodeToken } from "../utils/security/token.security.js";
import asyncHandler from "../utils/response/error.response.js";
import { TokenType } from "../utils/enum/enums.js";

const authentication = () => {
  return asyncHandler(async (req, res, next) => {
    const { authorization } = req.headers;

    if (!authorization) {
      return next(
        new Error("Authorization header is required", { cause: 401 })
      );
    }

    const user = await decodeToken({
      authorization,
      tokenType: TokenType.ACCESS,
    });

    if (!user) {
      return next(new Error("Unauthorized access", { cause: 401 }));
    }

    req.user = user;
    next();
  });
};

export default authentication;
