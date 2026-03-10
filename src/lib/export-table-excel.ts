import * as XLSX from "xlsx";

export function exportTableToExcel<T extends Record<string, unknown>>(
  data: T[],
  columnMap: Record<string, string>,
  filename: string,
) {
  const mapped = data.map((row) => {
    const out: Record<string, unknown> = {};
    for (const [key, label] of Object.entries(columnMap)) {
      out[label] = row[key];
    }
    return out;
  });
  const ws = XLSX.utils.json_to_sheet(mapped);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Data");
  XLSX.writeFile(wb, `${filename}.xlsx`);
}
