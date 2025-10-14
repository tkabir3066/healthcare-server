import z from "zod";

const createPatientValidationSchema = z.object({
  password: z.string({ error: "Password is required" }),
  patient: z.object({
    name: z.string({ error: "Name is required" }),
    email: z.string({ error: "Email is Required" }),
  }),
  address: z.string().optional(),
});

export const UserValidation = {
  createPatientValidationSchema,
};
