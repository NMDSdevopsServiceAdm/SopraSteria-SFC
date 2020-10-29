export class FormatUtil {
  public static formatPercent(data) {
    return Math.round(data * 100) + '%';
  }
  public static formatMoney(data) {
    return '£' + (Number(data) / 100).toFixed(2);
  }
}
