import {
  IconCertificate,
  IconChartBar,
  IconClipboardCheck,
  IconHome,
  IconLifebuoy,
  IconReportAnalytics,
  IconSchool,
  IconSend,
  IconUsersGroup,
  type TablerIcon,
} from "@tabler/icons-react";

// =============================================================================
// TYPES
// =============================================================================

export type SystemRole = "SUPERADMIN" | "ADMIN" | "MANAGER" | "STAFF";

export interface NavSubItem {
  title: string;
  url: string;
  minRole?: SystemRole;
}

export interface NavMainItem {
  title: string;
  url: string;
  icon: TablerIcon;
  isActive?: boolean;
  items?: NavSubItem[];
  minRole?: SystemRole;
}

export interface NavSecondaryItem {
  title: string;
  url: string;
  icon: TablerIcon;
}

export interface SidebarDataType {
  navMain: NavMainItem[];
  navSecondary: NavSecondaryItem[];
}

// =============================================================================
// ROLE HELPERS
// =============================================================================

const ROLE_LEVEL: Record<SystemRole, number> = {
  STAFF: 0,
  MANAGER: 1,
  ADMIN: 2,
  SUPERADMIN: 3,
};

export function hasMinRole(userRole: SystemRole, minRole: SystemRole): boolean {
  return ROLE_LEVEL[userRole] >= ROLE_LEVEL[minRole];
}

// =============================================================================
// DATA
// =============================================================================

export const SidebarData: SidebarDataType = {
  navMain: [
    {
      title: "Tổng Quan",
      url: "/dashboard",
      icon: IconChartBar,
    },
    {
      title: "Nhân Sự",
      url: "#",
      icon: IconUsersGroup,
      isActive: true,
      minRole: "MANAGER",
      items: [
        { title: "Nhân Viên", url: "/dashboard/employees" },
        { title: "Phòng Ban", url: "/dashboard/departments", minRole: "ADMIN" },
        { title: "Chức Vụ", url: "/dashboard/positions", minRole: "ADMIN" },
        { title: "Loại Hợp Đồng", url: "/dashboard/contract-types", minRole: "ADMIN" },
      ],
    },
    {
      title: "Đào Tạo",
      url: "#",
      icon: IconSchool,
      items: [
        { title: "Danh Mục Đào Tạo", url: "/dashboard/training-categories", minRole: "ADMIN" },
        { title: "Loại Tham Gia", url: "/dashboard/participation-types", minRole: "ADMIN" },
        { title: "Chính Sách Đào Tạo", url: "/dashboard/training-policies", minRole: "ADMIN" },
        { title: "Khóa Học", url: "/dashboard/courses" },
        { title: "Buổi Học", url: "/dashboard/course-sessions" },
        { title: "Đăng Ký Khóa Học", url: "/dashboard/course-registrations" },
        { title: "Khóa Học Nhân Viên", url: "/dashboard/employee-courses" },
      ],
    },
    {
      title: "Giáo Dục Liên Tục",
      url: "#",
      icon: IconCertificate,
      items: [
        { title: "Minh Chứng & Nhập Liệu", url: "/dashboard/completion-evidences" },
        { title: "Giờ Đào Tạo", url: "/dashboard/hours-records" },
        { title: "Tuân Thủ Đào Tạo", url: "/dashboard/policy-compliance", minRole: "MANAGER" },
      ],
    },
    {
      title: "Báo Cáo",
      url: "#",
      icon: IconReportAnalytics,
      minRole: "MANAGER",
      items: [{ title: "Thống Kê GDLT", url: "/dashboard/reports" }],
    },
    {
      title: "Hệ Thống",
      url: "#",
      icon: IconClipboardCheck,
      items: [
        { title: "Thông Báo", url: "/dashboard/notifications" },
        { title: "Mẫu Thông Báo", url: "/dashboard/notification-templates", minRole: "ADMIN" },
        { title: "Tệp Đính Kèm", url: "/dashboard/attachments", minRole: "ADMIN" },
        { title: "Nhật Ký Hệ Thống", url: "/dashboard/audit-logs", minRole: "SUPERADMIN" },
        {
          title: "Cấu Hình Hệ Thống",
          url: "/dashboard/system-settings",
          minRole: "SUPERADMIN",
        },
      ],
    },
  ],
  navSecondary: [
    { title: "Về Trang Chính", url: "/", icon: IconHome },
    { title: "Hỗ Trợ", url: "#", icon: IconLifebuoy },
    { title: "Phản Hồi", url: "#", icon: IconSend },
  ],
};
