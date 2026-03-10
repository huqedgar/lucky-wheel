"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { LoadingButton } from "@/components/shared/loading-button";
import PasswordInput from "@/components/shared/password-input";
import { updatePassword } from "@/actions/auth.actions";
import { useRouter } from "@/i18n/navigation";

export default function ResetPasswordPage() {
  const t = useTranslations("Auth");
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrors([]);

    if (password.length < 6) {
      setErrors([t("passwordMinLength")]);
      return;
    }

    if (password !== confirmPassword) {
      setErrors([t("passwordMismatch")]);
      return;
    }

    setIsLoading(true);
    try {
      const result = await updatePassword(password);
      if (result.error) {
        toast.error(t("updatePasswordFailed"));
      } else {
        toast.success(t("passwordUpdated"));
        router.push("/");
      }
    } catch {
      toast.error(t("updatePasswordFailed"));
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="mx-auto flex w-full flex-1 flex-col items-center justify-center px-4 sm:w-87.5 sm:px-0">
      <div className="w-full space-y-8">
        <div className="space-y-2 text-center">
          <h1 className="text-3xl font-medium">{t("resetPasswordTitle")}</h1>
          <p className="text-sm text-muted-foreground">{t("resetPasswordDescription")}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Field data-invalid={errors.length > 0}>
            <FieldLabel htmlFor="password">{t("newPasswordLabel")}</FieldLabel>
            <PasswordInput
              id="password"
              placeholder="••••••••"
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </Field>
          <Field data-invalid={errors.length > 0}>
            <FieldLabel htmlFor="confirmPassword">{t("confirmPasswordLabel")}</FieldLabel>
            <PasswordInput
              id="confirmPassword"
              placeholder="••••••••"
              autoComplete="new-password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
            {errors.length > 0 && <FieldError errors={errors.map((msg) => ({ message: msg }))} />}
          </Field>
          <LoadingButton className="w-full" type="submit" loading={isLoading}>
            {t("updatePassword")}
          </LoadingButton>
        </form>
      </div>
    </div>
  );
}
