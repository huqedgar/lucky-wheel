import { formOptions } from "@tanstack/react-form-nextjs";
import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export const loginClientSchema = z.object({
  email: z.string().email({ message: "Validation.emailInvalid" }),
  password: z.string().min(6, { message: "Validation.passwordMinLength" }),
});

export const registerClientSchema = z
  .object({
    email: z.string().email({ message: "Validation.emailInvalid" }),
    password: z.string().min(6, { message: "Validation.passwordMinLength" }),
    confirmPassword: z.string().min(6, { message: "Validation.confirmPasswordMinLength" }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Validation.passwordsNotMatch",
    path: ["confirmPassword"],
  });

type LoginFormValues = z.infer<typeof loginClientSchema>;

type RegisterFormValues = z.infer<typeof registerClientSchema>;

interface AuthError {
  errorMap: {
    onServer: string;
  };
}

// --- Form Options ---

export const loginFormOpts = formOptions({
  defaultValues: {
    email: "",
    password: "",
  },
});

export const registerFormOpts = formOptions({
  defaultValues: {
    email: "",
    password: "",
    confirmPassword: "",
  },
});
