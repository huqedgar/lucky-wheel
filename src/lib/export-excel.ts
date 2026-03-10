import * as XLSX from "xlsx";

interface DeptRow {
  stt: number;
  code: string;
  name: string;
  cchnCount: number;
  participatingCount: number;
  participatingRate: number;
  meetingThresholdCount: number;
  meetingThresholdRate: number;
}

interface IndividualRow {
  stt: number;
  fullName: string;
  department: string;
  position: string;
  hasCCHN: boolean;
  currentYearHours: number;
  prevYearHours: number;
  totalHours: number;
}

export function exportCEReport(
  deptData: DeptRow[],
  individualData: IndividualRow[],
  detailedData: Record<string, unknown>[],
  year: number,
) {
  const wb = XLSX.utils.book_new();

  // Sheet 1: Department Summary
  const deptHeaders = [
    "STT",
    "Ma",
    "Khoa/Phong",
    "So luong co CCHN",
    "So luong tham gia",
    "Ti le %",
    "So luong dat",
    "Ti le %",
  ];
  const deptRows = deptData.map((d) => [
    d.stt,
    d.code,
    d.name,
    d.cchnCount,
    d.participatingCount,
    d.participatingRate,
    d.meetingThresholdCount,
    d.meetingThresholdRate,
  ]);
  const ws1 = XLSX.utils.aoa_to_sheet([deptHeaders, ...deptRows]);

  // Set column widths
  ws1["!cols"] = [
    { wch: 5 },
    { wch: 10 },
    { wch: 30 },
    { wch: 18 },
    { wch: 18 },
    { wch: 10 },
    { wch: 14 },
    { wch: 10 },
  ];
  XLSX.utils.book_append_sheet(wb, ws1, "Thong ke khoa phong");

  // Sheet 2: Individual Summary
  const indHeaders = [
    "STT",
    "Ho va ten",
    "Khoa/Phong",
    "Chuc danh",
    "Co CCHN",
    `So gio ${year - 1}`,
    `So gio ${year}`,
    "Tong cong",
  ];
  const indRows = individualData.map((d) => [
    d.stt,
    d.fullName,
    d.department,
    d.position,
    d.hasCCHN ? "Co" : "Khong",
    d.prevYearHours,
    d.currentYearHours,
    d.totalHours,
  ]);
  const ws2 = XLSX.utils.aoa_to_sheet([indHeaders, ...indRows]);
  ws2["!cols"] = [
    { wch: 5 },
    { wch: 25 },
    { wch: 25 },
    { wch: 20 },
    { wch: 10 },
    { wch: 12 },
    { wch: 12 },
    { wch: 10 },
  ];
  XLSX.utils.book_append_sheet(wb, ws2, "Tong hop");

  // Sheet 3: Detailed entries
  const detailHeaders = [
    "Nam",
    "STT",
    "Ma NV",
    "Ho va ten",
    "Khoa/Phong",
    "Chuc danh",
    "Noi dung dao tao",
    "Hinh thuc",
    "Ngay bat dau",
    "Ngay ket thuc",
    "So tin chi",
    "So chung chi",
    "Noi cap",
    "Ngay cap CC",
  ];
  const detailRows = detailedData.map((d, i) => {
    const emp = d.employee as {
      employee_code?: string;
      full_name?: string;
    } | null;
    const pt = d.participation_type as { name?: string } | null;
    return [
      d.start_date ? new Date(String(d.start_date)).getFullYear() : year,
      i + 1,
      emp?.employee_code ?? d.snapshot_employee_code ?? "",
      emp?.full_name ?? d.snapshot_full_name ?? "",
      d.snapshot_department ?? "",
      d.snapshot_professional_title ?? "",
      d.training_content ?? "",
      pt?.name ?? "",
      d.start_date ?? "",
      d.end_date ?? "",
      d.credits ?? 0,
      d.certificate_number ?? "",
      d.issuing_organization ?? "",
      d.certificate_date ?? "",
    ];
  });
  const ws3 = XLSX.utils.aoa_to_sheet([detailHeaders, ...detailRows]);
  ws3["!cols"] = [
    { wch: 6 },
    { wch: 5 },
    { wch: 10 },
    { wch: 25 },
    { wch: 25 },
    { wch: 20 },
    { wch: 35 },
    { wch: 15 },
    { wch: 12 },
    { wch: 12 },
    { wch: 10 },
    { wch: 15 },
    { wch: 25 },
    { wch: 12 },
  ];
  XLSX.utils.book_append_sheet(wb, ws3, "Chi tiet GDLT");

  // Download
  XLSX.writeFile(wb, `Thong-ke-GDLT-${year}.xlsx`);
}
