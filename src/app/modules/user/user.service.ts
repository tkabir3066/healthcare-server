import { StatusCodes } from "http-status-codes";
import { prisma } from "../../config/db";
import { envVars } from "../../config/env";
import AppError from "../../errorHelpers/AppError";
import bcrypt from "bcryptjs";
import { Request } from "express";
import { fileUploader } from "../../helper/fileUploader";

const createPatient = async (req: Request) => {
  if (req.file) {
    const uploadedResult = await fileUploader.uploadToCloudinary(req.file);
    req.body.patient.profilePhoto = uploadedResult?.secure_url;
  }

  if (!req.body.password) {
    throw new AppError(
      StatusCodes.BAD_REQUEST,
      "Password is required for user creation"
    );
  }
  const hashedPassword = await bcrypt.hash(
    req.body.password,
    Number(envVars.BCRYPT_SALT_ROUND)
  );

  const result = await prisma.$transaction(async (tnx) => {
    await prisma.user.create({
      data: {
        email: req.body.patient.email,
        password: hashedPassword,
      },
    });

    return await prisma.patient.create({
      data: req.body.patient,
    });
  });

  return result;
};

export const UserService = {
  createPatient,
};
