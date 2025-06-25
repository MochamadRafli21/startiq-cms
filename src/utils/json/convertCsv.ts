export function convertToCSV(records: Record<string, string>[]) {
  if (records.length === 0) return "";

  const keys = Array.from(
    records.reduce((keySet, record) => {
      Object.keys(record).forEach((k) => keySet.add(k));
      return keySet;
    }, new Set<string>()),
  );

  const csv = [
    keys.join(","), // Header row
    ...records.map((row) =>
      keys
        .map((key) => `"${(row[key] ?? "").toString().replace(/"/g, '""')}"`)
        .join(","),
    ),
  ].join("\n");

  return csv;
}
