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
});
