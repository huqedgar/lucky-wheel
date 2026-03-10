"use server";

import { revalidatePath } from "next/cache";
import { Locale } from "next-intl";
import { getLocale } from "next-intl/server";
import { createServerValidate, ServerValidateError } from "@tanstack/react-form-nextjs";
import { logAudit } from "@/actions/audit-log.actions";
import { createClient } from "@/supabase/clients/server";
import {
  loginFormOpts,
  loginSchema,
  registerFormOpts,
  registerSchema,
} from "@/validations/auth.schema";
import { redirect } from "@/i18n/navigation";

const serverValidateLogin = createServerValidate({
  ...loginFormOpts,
  onServerValidate: ({ value }) => {
    const result = loginSchema.safeParse(value);
    if (!result.success) {
      return result.error.issues.map((i) => i.message).join(", ");
    }
  },
});

const serverValidateRegister = createServerValidate({
  ...registerFormOpts,
  onServerValidate: ({ value }) => {
    const result = registerSchema.safeParse(value);
    if (!result.success) {
      return result.error.issues.map((i) => i.message).join(", ");
    }
  },
});

export async function signIn(prev: unknown, formData: FormData) {
  try {
    const validatedData = await serverValidateLogin(formData);

    const supabase = await createClient();
    const { error } = await supabase.auth.signInWithPassword({
      email: validatedData.email,
      password: validatedData.password,
    });

    if (error) {
      console.error("Sign in error:", error.message);
      logAudit({
        action: "login_failed",
        module: "auth",
        table_name: "auth.users",
        new_data: { email: validatedData.email, error: error.message },
      });
      return { errorMap: { onServer: "INVALID_CREDENTIALS" } };
    }

    logAudit({
      action: "login",
      module: "auth",
      table_name: "auth.users",
      new_data: { email: validatedData.email },
    });

    revalidatePath("/", "layout");
    const locale = await getLocale();
    redirect({ href: "/", locale: locale as Locale });
  } catch (e) {
    if (e instanceof ServerValidateError) {
      return e.formState;
    }
    throw e;
  }
}

export async function signUp(prev: unknown, formData: FormData) {
  try {
    const validatedData = await serverValidateRegister(formData);

    const supabase = await createClient();
    const { error } = await supabase.auth.signUp({
      email: validatedData.email,
      password: validatedData.password,
    });

    if (error) {
      console.error("Sign up error:", error.message);
      return { errorMap: { onServer: "REGISTRATION_FAILED" } };
    }

    revalidatePath("/", "layout");
    const locale = await getLocale();
    redirect({ href: "/login?registered=true", locale: locale as Locale });
  } catch (e) {
    if (e instanceof ServerValidateError) {
      return e.formState;
    }
    throw e;
  }
}

export async function signOut() {
  const supabase = await createClient();
  const locale = await getLocale();

  logAudit({
    action: "logout",
    module: "auth",
    table_name: "auth.users",
  });

  const { error } = await supabase.auth.signOut();
  if (error) {
    console.error("Sign out failed:", error.message);
  }

  revalidatePath("/", "layout");
  redirect({ href: "/login", locale: locale as Locale });
}

export async function resetPasswordForEmail(email: string) {
  const supabase = await createClient();
  const locale = await getLocale();

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${process.env.NEXT_PUBLIC_SUPABASE_URL ? "" : ""}/${locale}/confirm?next=/${locale}/reset-password`,
  });

  if (error) {
    console.error("Reset password error:", error.message);
    logAudit({
      action: "reset_password_failed",
      module: "auth",
      table_name: "auth.users",
      new_data: { email, error: error.message },
    });
    return { error: "RESET_FAILED" };
  }

  logAudit({
    action: "reset_password",
    module: "auth",
    table_name: "auth.users",
    new_data: { email },
  });

  return { success: true };
}

export async function updatePassword(newPassword: string) {
  const supabase = await createClient();

  const { error } = await supabase.auth.updateUser({ password: newPassword });

  if (error) {
    console.error("Update password error:", error.message);
    logAudit({
      action: "update_password_failed",
      module: "auth",
      table_name: "auth.users",
      new_data: { error: error.message },
    });
    return { error: "UPDATE_FAILED" };
  }

  logAudit({
    action: "update_password",
    module: "auth",
    table_name: "auth.users",
  });

  return { success: true };
}
