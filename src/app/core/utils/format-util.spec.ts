import { FormatUtil } from './format-util';

describe('FormatUtil', () => {
  describe('formatDate', () => {
    it('should return a date', async () => {
      const date = FormatUtil.formatDate({ year: 2020, month: 12, day: 2 });

      const expectDate = new Date('2020-12-02');

      expect(date).toEqual(expectDate);
    });
  });

  describe('formatSingleDigit', () => {
    it('should a string of number', async () => {
      const formatSingleDigit = FormatUtil.formatSingleDigit(10);

      expect(formatSingleDigit).toEqual('10');
    });

    it('should a string of number prefixed with a 0', async () => {
      const formatSingleDigit = FormatUtil.formatSingleDigit(9);

      expect(formatSingleDigit).toEqual('09');
    });
  });

  fdescribe('formatMoney', () => {
    it('should show decimals for number with less than 4 digits', async () => {
      const formatMoney = FormatUtil.formatMoney(899);

      expect(formatMoney).toEqual('£8.99');
    });
    it('should show comma for number with more than 4 digits', async () => {
      const formatMoney = FormatUtil.formatMoney(30000);

      expect(formatMoney).toEqual('£30,000');
    });
    it('should show decimals for number with less than 4 digits', async () => {
      const formatMoney = FormatUtil.formatMoney(0);

      expect(formatMoney).toEqual('£0.00');
    });
  });
});
