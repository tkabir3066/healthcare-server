import { UserStatus } from "@prisma/client";
import { prisma } from "../../config/db";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import AppError from "../../errorHelpers/AppError";
import { StatusCodes } from "http-status-codes";
import { email } from "zod";
import { generateToken } from "../../utils/jwt";
import { envVars } from "../../config/env";

const credentialsLogin = async (payload: {
  email: string;
  password: string;
}) => {
  const user = await prisma.user.findUniqueOrThrow({
    where: {
      email: payload.email,
      status: UserStatus.ACTIVE,
    },
  });

  const isPasswordCorrect = await bcrypt.compare(
    payload.password,
    user.password
  );

  if (!isPasswordCorrect) {
    throw new AppError(StatusCodes.BAD_REQUEST, "Password is incorrect");
  }

  const jwtPayload = {
    userId: user.id,
    email: user.email,
    role: user.role,
  };
  const accessToken = generateToken(
    jwtPayload,
    envVars.JWT_ACCESS_SECRET,
    envVars.JWT_ACCESS_EXPIRES
  );

  const refreshToken = generateToken(
    jwtPayload,
    envVars.JWT_REFRESH_SECRET,
    envVars.JWT_REFRESH_EXPIRES
  );

  return {
    accessToken,
    refreshToken,
    needPasswordChange: user.needPasswordChange,
  };
};

export const AuthService = {
  credentialsLogin,
};
