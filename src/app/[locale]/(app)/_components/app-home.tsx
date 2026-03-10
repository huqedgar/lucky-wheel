"use client";

import { useTranslations } from "next-intl";
import {
  IconBell,
  IconCertificate,
  IconChevronRight,
  IconFileDescription,
  IconLayoutDashboard,
  IconSchool,
  IconUpload,
} from "@tabler/icons-react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useCurrentEmployee } from "@/hooks/use-current-employee";
import { cn } from "@/lib/utils";
import { getTrainingByCategory, type PolicyProgress } from "@/actions/reports.actions";
import { useCEEntries } from "@/queries/ce-entries.queries";
import { useCompletionEvidences } from "@/queries/completion-evidences.queries";
import { useCourseRegistrations } from "@/queries/course-registrations.queries";
import { useNotifications } from "@/queries/notifications.queries";
import { useComplianceRecords } from "@/queries/policy-compliance.queries";
import { Link } from "@/i18n/navigation";

// =============================================================================
// HOOKS
// =============================================================================

function usePolicyProgress(employeeId: string | undefined) {
  return useQuery({
    queryKey: ["policyProgress", employeeId],
    queryFn: () => getTrainingByCategory(employeeId!),
    enabled: !!employeeId,
    staleTime: 5 * 60 * 1000,
  });
}

const STATUS_COLORS: Record<PolicyProgress["status"], string> = {
  compliant: "bg-emerald-500",
  at_risk: "bg-amber-500",
  in_progress: "bg-blue-500",
  non_compliant: "bg-red-500",
};

// =============================================================================
// QUICK ACTION CARD
// =============================================================================

interface QuickActionProps {
  title: string;
  description: string;
  href: string;
  icon: React.ReactNode;
}

function QuickAction({ title, description, href, icon }: QuickActionProps) {
  return (
    <Link
      href={href}
      className="flex items-center gap-3 rounded-lg border p-3 transition-colors hover:bg-muted/50 active:bg-muted/70"
    >
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm leading-none font-medium">{title}</p>
        <p className="mt-1 text-xs text-muted-foreground">{description}</p>
      </div>
      <IconChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
    </Link>
  );
}

// =============================================================================
// MAIN
// =============================================================================

export function AppHome() {
  const t = useTranslations();
  const { data: employee, isLoading } = useCurrentEmployee();
  const isManagerOrAbove =
    employee?.system_role === "MANAGER" ||
    employee?.system_role === "ADMIN" ||
    employee?.system_role === "SUPERADMIN";

  // Real data queries
  const { data: policyProgress, isLoading: catLoading } = usePolicyProgress(employee?.id);
  const { data: pendingRegs, isLoading: regsLoading } = useCourseRegistrations({
    employee_id: employee?.id,
    status: "pending",
    pageSize: 0,
  });
  const { data: pendingEvs } = useCompletionEvidences({
    employee_id: employee?.id,
    status: "pending",
    pageSize: 0,
  });
  const { data: pendingCEs } = useCEEntries({
    employee_id: employee?.id,
    status: "pending_review",
    pageSize: 0,
  });
  const { data: complianceData, isLoading: compLoading } = useComplianceRecords({
    employee_id: employee?.id,
    evaluation_year: new Date().getFullYear(),
    pageSize: 50,
  });
  const { data: notifData, isLoading: notifLoading } = useNotifications({
    recipientId: employee?.id,
    pageSize: 5,
  });

  const totalPending =
    (pendingRegs?.count ?? 0) + (pendingEvs?.count ?? 0) + (pendingCEs?.count ?? 0);

  // Training hours from policy progress (cycle-aware)
  // Only count non-tracking-only policies for the summary
  const compliancePolicies = (policyProgress ?? []).filter((p) => !p.isTrackingOnly);
  const trackingOnlyPolicies = (policyProgress ?? []).filter((p) => p.isTrackingOnly);
  const totalCycleHours = compliancePolicies.reduce((sum, p) => sum + p.achievedHours, 0);
  const totalRequiredHours = compliancePolicies.reduce((sum, p) => sum + p.requiredHours, 0);

  // Compliance summary
  const complianceRecords = complianceData?.data ?? [];
  const compliantCount = complianceRecords.filter(
    (r) => r.compliance_status === "compliant",
  ).length;
  const complianceLabel =
    complianceRecords.length > 0 ? `${compliantCount}/${complianceRecords.length}` : "—";

  // Upcoming approved registrations
  const { data: upcomingRegs, isLoading: upcomingLoading } = useCourseRegistrations({
    employee_id: employee?.id,
    status: "approved",
    pageSize: 3,
  });

  // Recent notifications
  const recentNotifications = notifData?.data ?? [];

  return (
    <div className="container-wrapper px-4 py-6 md:px-6">
      <div className="container flex flex-col gap-6">
        {/* Greeting */}
        <div>
          {isLoading ? (
            <Skeleton className="h-8 w-48" />
          ) : (
            <h1 className="text-2xl font-bold tracking-tight">
              {t("AppHome.greeting", { name: employee?.full_name?.split(" ").pop() ?? "" })}
            </h1>
          )}
          <p className="mt-1 text-sm text-muted-foreground">{t("AppHome.subtitle")}</p>
        </div>

        {/* Summary Cards */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>{t("AppHome.myTrainingHours")}</CardDescription>
            </CardHeader>
            <CardContent>
              {catLoading ? (
                <Skeleton className="h-8 w-16" />
              ) : (
                <div className="text-2xl font-bold">
                  {totalRequiredHours > 0
                    ? `${totalCycleHours}/${totalRequiredHours}h`
                    : `${totalCycleHours}h`}
                </div>
              )}
              <p className="text-xs text-muted-foreground">{t("AppHome.hoursThisCycle")}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>{t("AppHome.pendingItems")}</CardDescription>
            </CardHeader>
            <CardContent>
              {regsLoading ? (
                <Skeleton className="h-8 w-16" />
              ) : (
                <div className="text-2xl font-bold">{totalPending}</div>
              )}
              <p className="text-xs text-muted-foreground">{t("AppHome.awaitingAction")}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>{t("AppHome.complianceStatus")}</CardDescription>
            </CardHeader>
            <CardContent>
              {compLoading ? (
                <Skeleton className="h-8 w-16" />
              ) : (
                <div className="text-2xl font-bold">{complianceLabel}</div>
              )}
              <p className="text-xs text-muted-foreground">{t("AppHome.overallCompliance")}</p>
            </CardContent>
          </Card>
        </div>

        {/* Policy Progress */}
        {catLoading ? (
          <Card>
            <CardHeader>
              <Skeleton className="h-5 w-48" />
              <Skeleton className="mt-1 h-4 w-64" />
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-4 w-12" />
                    </div>
                    <Skeleton className="h-2 w-full rounded-full" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ) : compliancePolicies.length > 0 || trackingOnlyPolicies.length > 0 ? (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">{t("AppHome.categoryProgress")}</CardTitle>
              <CardDescription>{t("AppHome.categoryProgressDesc")}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {compliancePolicies.map((policy) => (
                  <div key={policy.policyId} className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <div className="min-w-0">
                        <span className="font-medium">{policy.policyLabel}</span>
                      </div>
                      <span className="shrink-0 text-muted-foreground">
                        {policy.achievedHours}/{policy.requiredHours}h
                      </span>
                    </div>
                    <div className="relative h-2 w-full overflow-hidden rounded-full bg-muted">
                      <div
                        className={`absolute top-0 left-0 h-full rounded-full transition-all ${STATUS_COLORS[policy.status]}`}
                        style={{ width: `${Math.min(policy.ratio * 100, 100)}%` }}
                      />
                    </div>
                  </div>
                ))}
                {trackingOnlyPolicies.length > 0 && (
                  <>
                    <div className="border-t pt-2">
                      <p className="text-xs font-medium text-muted-foreground">
                        {t("AppHome.trackingOnly")}
                      </p>
                    </div>
                    {trackingOnlyPolicies.map((policy) => (
                      <div key={policy.policyId} className="space-y-1">
                        <div className="flex items-center justify-between text-sm">
                          <div className="min-w-0">
                            <span className="font-medium text-muted-foreground">
                              {policy.policyLabel}
                            </span>
                          </div>
                          <span className="shrink-0 text-muted-foreground">
                            {policy.achievedHours}h
                          </span>
                        </div>
                      </div>
                    ))}
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        ) : null}

        {/* Quick Actions */}
        <div>
          <h2 className="text-lg font-semibold">{t("AppHome.quickActions")}</h2>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <QuickAction
              title={t("AppHome.browseCourses")}
              description={t("AppHome.browseCoursesDesc")}
              href="/courses"
              icon={<IconSchool className="h-5 w-5" />}
            />
            <QuickAction
              title={t("AppHome.myTraining")}
              description={t("AppHome.myTrainingDesc")}
              href="/my-training"
              icon={<IconCertificate className="h-5 w-5" />}
            />
            <QuickAction
              title={t("AppHome.newCEEntry")}
              description={t("AppHome.newCEEntryDesc")}
              href="/ce-entries/new"
              icon={<IconFileDescription className="h-5 w-5" />}
            />
            <QuickAction
              title={t("AppHome.submitEvidence")}
              description={t("AppHome.submitEvidenceDesc")}
              href="/evidences/new"
              icon={<IconUpload className="h-5 w-5" />}
            />
            {isManagerOrAbove && (
              <QuickAction
                title={t("AppHome.management")}
                description={t("AppHome.managementDesc")}
                href="/dashboard"
                icon={<IconLayoutDashboard className="h-5 w-5" />}
              />
            )}
          </div>
        </div>

        {/* Upcoming Training */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">{t("AppHome.upcomingTraining")}</CardTitle>
            <CardDescription>{t("AppHome.upcomingTrainingDesc")}</CardDescription>
          </CardHeader>
          <CardContent>
            {upcomingLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 2 }).map((_, i) => (
                  <Skeleton key={i} className="h-10 w-full rounded-md" />
                ))}
              </div>
            ) : (upcomingRegs?.data ?? []).length > 0 ? (
              <div className="space-y-3">
                {upcomingRegs!.data.map((reg) => (
                  <div key={reg.id} className="flex items-center gap-3 rounded-md border p-2">
                    <IconSchool className="h-4 w-4 text-primary" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">
                        {reg.course?.name ?? reg.external_course_name ?? "—"}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex items-center justify-center py-8 text-sm text-muted-foreground">
                {t("Common.noData")}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Notifications */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-base">{t("AppHome.recentNotifications")}</CardTitle>
              <CardDescription>{t("AppHome.recentNotificationsDesc")}</CardDescription>
            </div>
            <Link href="/notifications" className="text-sm text-primary hover:underline">
              {t("AppHome.viewAll")}
            </Link>
          </CardHeader>
          <CardContent>
            {notifLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className="h-12 w-full rounded-md" />
                ))}
              </div>
            ) : recentNotifications.length > 0 ? (
              <div className="space-y-2">
                {recentNotifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={cn(
                      "flex items-start gap-3 rounded-lg border p-2.5",
                      !notification.is_read && "border-primary/20 bg-primary/5",
                    )}
                  >
                    <div
                      className={cn(
                        "mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full",
                        !notification.is_read
                          ? "bg-primary/10 text-primary"
                          : "bg-muted text-muted-foreground",
                      )}
                    >
                      <IconBell className="h-3.5 w-3.5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p
                        className={cn(
                          "truncate text-sm",
                          !notification.is_read ? "font-medium" : "text-muted-foreground",
                        )}
                      >
                        {notification.title}
                      </p>
                      <p className="mt-0.5 text-[10px] text-muted-foreground">
                        {new Date(notification.created_at).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex items-center justify-center py-8 text-sm text-muted-foreground">
                {t("AppHome.noNotifications")}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
