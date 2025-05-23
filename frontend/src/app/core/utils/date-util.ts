import { FormatUtil } from './format-util';

export class DateUtil {
  public static getDateForOneYearAgo(): string {
    const today = new Date();
    today.setFullYear(today.getFullYear() - 1);
    return FormatUtil.formatDateToLocaleDateString(today);
  }
}
