export class XMLFormatter {
  /**
   * Format decimal numbers with specific precision
   */
  formatDecimal(value: number, decimals: number): string {
    return value.toFixed(decimals);
  }

  /**
   * Format dates to DD/MM/YYYY_HH:MM:SS
   */
  formatTimestamp(date: Date): string {
    const dd = date.getDate().toString().padStart(2, "0");
    const mm = (date.getMonth() + 1).toString().padStart(2, "0");
    const yyyy = date.getFullYear();
    const hh = date.getHours().toString().padStart(2, "0");
    const min = date.getMinutes().toString().padStart(2, "0");
    const ss = date.getSeconds().toString().padStart(2, "0");

    return `${dd}/${mm}/${yyyy}_${hh}:${min}:${ss}`;
  }

  /**
   * Format month/year to MM/YYYY
   */
  formatMonthYear(month: number, year: number): string {
    const mm = month.toString().padStart(2, "0");
    return `${mm}/${year}`;
  }

  /**
   * Escape special XML characters
   */
  escapeXML(text: string): string {
    return text
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&apos;");
  }

  /**
   * Clean and validate description for file naming
   */
  cleanDescription(description: string): string {
    return description
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, "") // Remove non-alphanumeric
      .substring(0, 25); // Max 25 chars
  }

  /**
   * Validate PIVA format
   */
  validatePIVA(piva: string): boolean {
    return /^[A-Z0-9]{16}$/.test(piva);
  }
} 