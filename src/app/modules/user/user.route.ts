import { NextFunction, Request, Response, Router } from "express";
import { UserController } from "./user.controller";
import { fileUploader } from "../../helper/fileUploader";
import { validateRequest } from "../../middlewares/validateRequest";
import { UserValidation } from "./user.validation";
import { auth } from "../../middlewares/auth";
import { UserRole } from "@prisma/client";

const router = Router();

router.get("/", auth(UserRole.ADMIN), UserController.getAllFromDB);

router.post(
  "/create-patient",
  fileUploader.upload.single("file"),
  //   (req: Request, res: Response, next: NextFunction) => {
  //     req.body = UserValidation.createPatientValidationSchema.parse(
  //       JSON.parse(req.body.data)
  //     );

  //     return UserController.createPatient(req, res, next);
  //   }

  validateRequest(UserValidation.createPatientValidationSchema),
  UserController.createPatient
);

router.post(
  "/create-admin",
  auth(UserRole.ADMIN),
  fileUploader.upload.single("file"),
  validateRequest(UserValidation.createAdminValidationSchema),
  UserController.createAdmin
);
router.post(
  "/create-doctor",
  auth(UserRole.ADMIN),
  fileUploader.upload.single("file"),
  validateRequest(UserValidation.createDoctorValidationSchema),
  UserController.createDoctor
);
export const UserRoutes = router;
