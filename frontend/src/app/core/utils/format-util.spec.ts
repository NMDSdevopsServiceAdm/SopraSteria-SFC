import { FormatUtil } from './format-util';

describe('FormatUtil', () => {
  describe('formatDate', () => {
    it('should return a date', async () => {
      const date = FormatUtil.formatDate({ year: 2020, month: 12, day: 2 });

      const expectDate = new Date('2020-12-02');

      expect(date).toEqual(expectDate);
    });
  });

  describe('formatDateToLocaleDateString', () => {
    it('should return the given date', async () => {
      const date = new Date('2025-03-31');
      const formattedDate = FormatUtil.formatDateToLocaleDateString(date);

      expect(formattedDate).toEqual('31 March 2025');
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

  describe('formatMoney', () => {
    it('should show decimals for number with less than 4 digits', async () => {
      const formatMoney = FormatUtil.formatMoney(899);

      expect(formatMoney).toEqual('£8.99');
    });

    it('should format longer decimal pay data correctly', () => {
      const paydata = FormatUtil.formatMoney(512.345);
      expect(paydata).toBe('£5.12');
    });

    it('should show decimals for number with less than 4 digits', async () => {
      const formatMoney = FormatUtil.formatMoney(0);

      expect(formatMoney).toEqual('£0.00');
    });
  });

  describe('formatSalary', () => {
    it('should show comma for number with more than 4 digits', async () => {
      const formatMoney = FormatUtil.formatSalary(36500);

      expect(formatMoney).toEqual('£36,500');
    });
  });

  describe('formatPercent', () => {
    it('should show as percentage', async () => {
      expect(FormatUtil.formatPercent(0.04)).toEqual('4%');
      expect(FormatUtil.formatPercent(0.597609562)).toEqual('60%');
      expect(FormatUtil.formatPercent(0.5)).toEqual('50%');
    });
  });

  describe('formatToLowercaseExcludingAcronyms', () => {
    it('should put text with no acronyms to lower case', () => {
      const testCases: { input: string; expected: string }[] = [
        { input: 'Software engineer', expected: 'software engineer' },
        { input: 'Support Worker', expected: 'support worker' },
        { input: 'People and HR manager', expected: 'people and HR manager' },
      ];

      testCases.forEach(({ input, expected }) => {
        expect(FormatUtil.formatToLowercaseExcludingAcronyms(input)).toEqual(expected);
      });
    });

    it('should not put acronyms to lower case', () => {
      const testCases: { input: string; expected: string }[] = [
        { input: 'IT manager', expected: 'IT manager' },
        { input: 'Manager of IT', expected: 'manager of IT' },
        { input: 'People and HR manager', expected: 'people and HR manager' },
        { input: 'ABC Acronym', expected: 'ABC acronym' },
      ];

      testCases.forEach(({ input, expected }) => {
        expect(FormatUtil.formatToLowercaseExcludingAcronyms(input)).toEqual(expected);
      });
    });
  });
});
