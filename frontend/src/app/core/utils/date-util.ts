import { FormatUtil } from './format-util';

export class DateUtil {
  public static getDateForOneYearAgo(): string {
    const today = new Date();
    today.setFullYear(today.getFullYear() - 1);
    return FormatUtil.formatDateToLocaleDateString(today);
  }
}

export class FormatDate {
  public static formatUKDate(
    dateStr: string | null | undefined,
    options: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'short', year: 'numeric' },
  ): string {
    if (!dateStr) return '-'; // handle empty/null
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return dateStr; // handle invalid dates
    return date.toLocaleDateString('en-GB', options);
  }
}
