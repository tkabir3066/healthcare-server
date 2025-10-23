import { NextFunction, Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { StatusCodes } from "http-status-codes";
import { UserService } from "./user.service";
import { pick } from "../../helper/pick";
import { userFilterableFields } from "./user.constants";

const createPatient = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    // console.log(req.file);
    const user = await UserService.createPatient(req);

    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.CREATED,
      message: "Patient created successfully",
      data: user,
    });
  }
);
const createAdmin = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    // console.log(req.file);
    const user = await UserService.createAdmin(req);

    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.CREATED,
      message: "Admin created successfully",
      data: user,
    });
  }
);
const createDoctor = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    // console.log(req.file);
    const user = await UserService.createDoctor(req);

    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.CREATED,
      message: "Doctor created successfully",
      data: user,
    });
  }
);
const getAllFromDB = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    //page, limit,sortBy, sortOrder --> pagination, sorting
    //fields, searchTerm --> searching, filtering

    // const { page, limit, searchTerm, sortBy, sortOrder, role, status } =
    //   req.query;

    const filters = pick(req.query, userFilterableFields);
    const options = pick(req.query, ["page", "limit", "sortOrder", "sortBy"]);
    // const users = await UserService.getAllFromDB({
    //   page: Number(page),
    //   limit: Number(limit),
    //   searchTerm: searchTerm?.toString() || "",
    //   sortBy: sortBy?.toString() || "",
    //   sortOrder: sortOrder?.toString() || "",
    //   role,
    //   status,
    // });

    const users = await UserService.getAllFromDB(filters, options);

    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message: "All Users retrieved successfully",
      meta: users.meta,
      data: users.data,
    });
  }
);

export const UserController = {
  createPatient,
  createAdmin,
  createDoctor,
  getAllFromDB,
};
