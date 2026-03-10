import { z } from "zod";

const configSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string(),
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY: z.string(),
  SUPABASE_SERVICE_ROLE_KEY: z.string().optional(),
});

const configProject = configSchema.safeParse({
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY:
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY,
  SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
});

if (!configProject.success) {
  console.error(configProject.error.issues);
  throw new Error("Các khai báo biến môi trường không hợp lệ");
}

const envConfig = configProject.data;
export default envConfig;

export const locales = ["en", "vi"] as const;
export const defaultLocale: (typeof locales)[number] = "vi";
