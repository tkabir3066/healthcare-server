import { NextFunction, Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { StatusCodes } from "http-status-codes";
import { AuthService } from "./auth.service";

const credentialsLogin = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const loginInfo = await AuthService.credentialsLogin(req.body);

    res.cookie("accessToken", loginInfo.accessToken, {
      secure: true,
      httpOnly: true,
      sameSite: "none",
      maxAge: 1000 * 60 * 60,
    });
    res.cookie("refreshToken", loginInfo.refreshToken, {
      secure: true,
      httpOnly: true,
      sameSite: "none",
      maxAge: 1000 * 60 * 60 * 90,
    });
    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.CREATED,
      message: "User Logged In successfully",
      data: loginInfo,
      // {
      //   needPasswordChange: loginInfo.needPasswordChange,
      // },
    });
  }
);

export const AuthController = {
  credentialsLogin,
};
