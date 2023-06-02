export class FormatUtil {
  public static formatPercent(data) {
    return Math.round(data * 100) + '%';
  }
  public static formatMoney(data) {
    if (data.toString().length > 4) {
      return '£' + Number(data.toFixed(0)).toLocaleString();
    } else if (data === 0 || !data) {
      '£' + (Number(data) / 100).toFixed(2);
    }
    return '£' + (Number(data) / 100).toFixed(2);
  }

  public static formatSingleDigit(value: number): string {
    return String(value < 10 ? `0${value}` : value);
  }

  public static formatDate(date: { year: number; month: number; day: number }): Date {
    return new Date(
      `${this.formatSingleDigit(date.year)}-${this.formatSingleDigit(date.month)}-${this.formatSingleDigit(date.day)}`,
    );
  }
}
