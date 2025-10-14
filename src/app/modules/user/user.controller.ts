import { NextFunction, Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { StatusCodes } from "http-status-codes";
import { UserService } from "./user.service";

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

export const UserController = {
  createPatient,
};
