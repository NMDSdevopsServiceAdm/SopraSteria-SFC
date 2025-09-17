import { DateUtil } from './date-util';
import { FormatDate } from './date-util';

describe('DateUtil', () => {
  describe('getDateForOneYearAgo', () => {
    beforeEach(() => {
      jasmine.clock().install();
    });
    afterEach(() => {
      jasmine.clock().uninstall();
    });

    it('returns the date of one year ago as a string', async () => {
      jasmine.clock().mockDate(new Date('2025-04-05'));

      const expected = '5 April 2024';
      const actual = DateUtil.getDateForOneYearAgo();

      expect(actual).toEqual(expected);
    });
  });
});

describe('FormatDate', () => {
  describe('formatUKDate', () => {
    it('should return "-" if input is null', () => {
      expect(FormatDate.formatUKDate(null)).toBe('-');
    });

    it('should return "-" if input is undefined', () => {
      expect(FormatDate.formatUKDate(undefined)).toBe('-');
    });

    it('should return "-" if input is empty string', () => {
      expect(FormatDate.formatUKDate('')).toBe('-');
    });

    it('should format a valid date string into UK format (default options)', () => {
      const result = FormatDate.formatUKDate('2023-12-25');
      // In en-GB with default { day: 'numeric', month: 'short', year: 'numeric' }
      expect(result).toBe('25 Dec 2023');
    });
  });
});
