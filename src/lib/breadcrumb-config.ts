interface BreadcrumbSegment {
  label: string;
  href?: string;
}

// Map route segments to breadcrumb labels and optional parent links
const segmentLabels: Record<string, string> = {
  // Dashboard
  dashboard: "Tổng Quan",
  // Nhân Sự
  employees: "Nhân Viên",
  departments: "Phòng Ban",
  positions: "Chức Vụ",
  "contract-types": "Loại Hợp Đồng",
  // Đào Tạo
  "training-categories": "Danh Mục Đào Tạo",
  "participation-types": "Loại Tham Gia",
  "training-policies": "Chính Sách Đào Tạo",
  courses: "Khóa Học",
  "course-sessions": "Buổi Học",
  "course-registrations": "Đăng Ký Khóa Học",
  "employee-courses": "Khóa Học Nhân Viên",
  // Giáo Dục Liên Tục
  "ce-entries": "Minh Chứng & Nhập Liệu",
  "completion-evidences": "Minh Chứng & Nhập Liệu",
  "hours-records": "Giờ Đào Tạo",
  "policy-compliance": "Tuân Thủ Đào Tạo",
  // Hệ Thống
  notifications: "Thông Báo",
  attachments: "Tệp Đính Kèm",
  // Hành động
  new: "Thêm Mới",
  edit: "Chỉnh Sửa",
  example: "Ví Dụ",
  // (app) routes
  profile: "Hồ Sơ Cá Nhân",
  "my-training": "Đào Tạo Của Tôi",
  history: "Lịch Sử",
  registrations: "Đăng Ký Khóa Học",
  evidences: "Minh Chứng",
};

// Segments that should be skipped (not shown in breadcrumb)
const skipSegments = new Set(["[locale]"]);

// UUID pattern to detect dynamic segments
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function buildBreadcrumbs(pathname: string): BreadcrumbSegment[] {
  // Remove locale prefix (e.g., /vi/dashboard/employees -> /dashboard/employees)
  const withoutLocale = pathname.replace(/^\/[a-z]{2}(?=\/|$)/, "");
  const segments = withoutLocale.split("/").filter(Boolean);

  const breadcrumbs: BreadcrumbSegment[] = [];
  let currentPath = "";

  for (const segment of segments) {
    if (skipSegments.has(segment)) continue;

    currentPath += `/${segment}`;

    // Skip UUID segments (detail pages) - they don't get breadcrumb text
    if (UUID_PATTERN.test(segment)) {
      breadcrumbs.push({
        label: "Chi Tiết",
        href: currentPath,
      });
      continue;
    }

    const label = segmentLabels[segment] ?? segment;
    breadcrumbs.push({
      label,
      href: currentPath,
    });
  }

  return breadcrumbs;
}

export function getSegmentLabel(segment: string): string {
  return segmentLabels[segment] ?? segment;
}
