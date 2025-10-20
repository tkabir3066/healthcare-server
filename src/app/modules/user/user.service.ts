import { StatusCodes } from "http-status-codes";
import { prisma } from "../../config/db";
import { envVars } from "../../config/env";
import AppError from "../../errorHelpers/AppError";
import bcrypt from "bcryptjs";
import { Request } from "express";
import { fileUploader } from "../../helper/fileUploader";
import { PaginationHelper } from "../../helper/paginationHelper";
import { Prisma } from "@prisma/client";
import { userSearchableFields } from "./user.constants";

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

const getAllFromDB = async (
  //   {
  //   page,
  //   limit,
  //   searchTerm,
  //   sortBy,
  //   sortOrder,
  //   role,
  //   status,
  // }: {
  //   page: number;
  //   limit: number;
  //   searchTerm?: string;
  //   sortBy: string;
  //   sortOrder: string;
  //   role: any;
  //   status: any;
  // }

  params: any,
  options: any
) => {
  // const page = options.page || 1;
  // const limit = options.limit || 10;
  // const skip = (page - 1) * limit;

  const { page, limit, skip, sortBy, sortOrder } =
    PaginationHelper.calculatePagination(options);

  const { searchTerm, ...filerData } = params;

  const andConditions: Prisma.UserWhereInput[] = [];
  if (searchTerm) {
    andConditions.push({
      OR: userSearchableFields.map((field) => ({
        [field]: {
          contains: searchTerm,
          mode: "insensitive",
        },
      })),
    });
  }

  if (Object.keys(filerData).length > 0) {
    andConditions.push({
      AND: Object.keys(filerData).map((key) => ({
        [key]: {
          equals: (filerData as any)[key],
        },
      })),
    });
  }

  const whereConditions: Prisma.UserWhereInput =
    andConditions.length > 0
      ? {
          AND: andConditions,
        }
      : {};
  const result = await prisma.user.findMany({
    skip: skip,
    take: limit,
    where: whereConditions,
    orderBy: {
      [sortBy]: sortOrder, //after optimization
    },
    /*       sortBy && sortOrder
        ? {
            [sortBy]: sortOrder,
          }
        : {
            createdAt: "desc",
          }, */
  });

  const total = await prisma.user.count({
    where: whereConditions,
  });
  return {
    meta: {
      page: page,
      limit: limit,
      total: total,
    },
    data: result,
  };
};
export const UserService = {
  createPatient,
  getAllFromDB,
};
