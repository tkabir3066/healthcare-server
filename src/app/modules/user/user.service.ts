import { StatusCodes } from "http-status-codes";
import { prisma } from "../../config/db";
import { envVars } from "../../config/env";
import AppError from "../../errorHelpers/AppError";
import bcrypt from "bcryptjs";
import { Request } from "express";
import { fileUploader } from "../../helper/fileUploader";
import { PaginationHelper } from "../../helper/paginationHelper";
import { Admin, Doctor, Prisma, UserRole } from "@prisma/client";
import { userSearchableFields } from "./user.constants";

const createPatient = async (req: Request) => {
  const file = req.file;
  console.log(file);
  if (file) {
    const uploadedResult = await fileUploader.uploadToCloudinary(file);
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

  const userData = {
    email: req.body.patient.email,
    password: hashedPassword,
    role: UserRole.PATIENT,
  };
  const result = await prisma.$transaction(async (tnx) => {
    await tnx.user.create({
      data: userData,
    });

    return await tnx.patient.create({
      data: req.body.patient,
    });
  });

  return result;
};
const createAdmin = async (req: Request): Promise<Admin> => {
  const file = req.file;

  //Ensure req.body.admin exists to avoid undefined property error
  if (!req.body.admin) {
    req.body.admin = {};
  }
  if (file) {
    const uploadToCloudinary = await fileUploader.uploadToCloudinary(file);
    req.body.admin.profilePhoto = uploadToCloudinary?.secure_url;
  }

  const hashedPassword = await bcrypt.hash(
    req.body.password,
    Number(envVars.BCRYPT_SALT_ROUND)
  );

  const userData = {
    email: req.body.admin.email,
    password: hashedPassword,
    role: UserRole.ADMIN,
  };

  const result = await prisma.$transaction(async (transactionClient) => {
    const createdUser = await transactionClient.user.create({
      data: userData,
    });

    const createdAdminData = await transactionClient.admin.create({
      data: {
        ...req.body.admin,
      },
    });

    return createdAdminData;
  });

  return result;
};

const createDoctor = async (req: Request): Promise<Doctor> => {
  const file = req.file;

  //Ensure req.body.admin exists to avoid undefined property error
  if (!req.body.doctor) {
    req.body.doctor = {};
  }
  if (file) {
    const uploadToCloudinary = await fileUploader.uploadToCloudinary(file);
    req.body.doctor.profilePhoto = uploadToCloudinary?.secure_url;
  }
  const hashedPassword: string = await bcrypt.hash(
    req.body.password,
    Number(envVars.BCRYPT_SALT_ROUND)
  );

  const userData = {
    email: req.body.doctor.email,
    password: hashedPassword,
    role: UserRole.DOCTOR,
  };

  const result = await prisma.$transaction(async (transactionClient) => {
    await transactionClient.user.create({
      data: userData,
    });

    const createdDoctorData = await transactionClient.doctor.create({
      data: req.body.doctor,
    });

    return createdDoctorData;
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
  createAdmin,
  createDoctor,
  getAllFromDB,
};
