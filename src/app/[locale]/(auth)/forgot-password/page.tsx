"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { IconArrowLeft, IconMail } from "@tabler/icons-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { LoadingButton } from "@/components/shared/loading-button";
import { resetPasswordForEmail } from "@/actions/auth.actions";
import { Link } from "@/i18n/navigation";

export default function ForgotPasswordPage() {
  const t = useTranslations("Auth");
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return;

    setIsLoading(true);
    try {
      const result = await resetPasswordForEmail(email);
      if (result.error) {
        toast.error(t("resetFailed"));
      } else {
        setSent(true);
        toast.success(t("resetEmailSent"));
      }
    } catch {
      toast.error(t("resetFailed"));
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="mx-auto flex w-full flex-1 flex-col items-center justify-center px-4 sm:w-87.5 sm:px-0">
      <div className="w-full space-y-8">
        <div className="space-y-2 text-center">
          <h1 className="text-3xl font-medium">{t("forgotPasswordTitle")}</h1>
          <p className="text-sm text-muted-foreground">{t("forgotPasswordDescription")}</p>
        </div>

        {sent ? (
          <div className="space-y-4 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
              <IconMail className="h-8 w-8 text-primary" />
            </div>
            <p className="text-sm text-muted-foreground">{t("resetEmailSentDescription")}</p>
            <Button variant="outline" nativeButton={false} render={<Link href="/login" />}>
              <IconArrowLeft className="mr-2 h-4 w-4" />
              {t("backToLogin")}
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <Field>
              <FieldLabel htmlFor="email">{t("emailLabel")}</FieldLabel>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </Field>
            <LoadingButton className="w-full" type="submit" loading={isLoading}>
              {t("sendResetLink")}
            </LoadingButton>
            <div className="text-center">
              <Link href="/login" className="text-sm text-muted-foreground hover:text-foreground">
                <IconArrowLeft className="mr-1 inline h-3 w-3" />
                {t("backToLogin")}
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
