/**
 * Formats an ISO-8601 date string to the localized Chinese format: YYYY年M月D日
 * @param isoString An ISO-8601 formatted date string (e.g., '2026-04-12T00:00:00Z')
 * @returns Formatted string (e.g., '2026年4月12日')
 */
export const formatDateToChinese = (isoString: string): string => {
  const date = new Date(isoString);
  if (isNaN(date.getTime())) {
    return isoString; // fallback to original if invalid
  }
  return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`;
};
