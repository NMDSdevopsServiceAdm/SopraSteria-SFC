import dayjs from 'dayjs';
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

  describe('toDayjs', () => {
    describe('should parse a valid date string of "YYYY-MM-DD" to dayjs object', () => {
      const testCases = [
        { input: '2020-01-01', expected: dayjs('2020-01-01T00:00:00Z') },
        { input: '2025-12-31', expected: dayjs('2025-12-31T00:00:00Z') },
        { input: '2023-07-01', expected: dayjs('2023-07-01T00:00:00Z') },
      ];

      testCases.forEach(({ input, expected }) => {
        it(`input: ${input}`, () => {
          const actual = DateUtil.toDayjs(input);
          const isSameDay = actual.isSame(expected, 'day');
          expect(isSameDay).toBeTrue();
        });
      });
    });

    describe('should parse a valid FormGroup date representation string to dayjs object', () => {
      const testCases = [
        { input: { day: 1, month: 1, year: 2020 }, expected: dayjs('2020-01-01T00:00:00Z') },
        { input: { day: 29, month: 2, year: 2020 }, expected: dayjs('2020-02-29T00:00:00Z') },
        { input: { day: 1, month: 4, year: 2025 }, expected: dayjs('2025-04-01T00:00:00Z') },
        { input: { day: 15, month: 7, year: 2027 }, expected: dayjs('2027-07-15T00:00:00Z') },
        { input: { day: 31, month: 12, year: 2026 }, expected: dayjs('2026-12-31T00:00:00Z') },
      ];

      testCases.forEach(({ input, expected }) => {
        it(`input: ${input}`, () => {
          const actual = DateUtil.toDayjs(input);
          const isSameDay = actual.isSame(expected, 'day');
          expect(isSameDay).toBeTrue();
        });
      });
    });

    describe('should parse any invalid input to null', () => {
      const testCases = [
        'random string',
        '2021-13-31',
        '2020-05-33',
        undefined,
        null,
        false,
        NaN,
        {},
        123,
        { day: 32, month: 5, year: 2026 },
        { day: 15, month: 13, year: 2026 },
        { day: 1, month: 1, year: 999 },
      ];

      testCases.forEach((invalidInput) => {
        it(`invalidInput: ${invalidInput}`, () => {
          // @ts-expect-error
          const actual = DateUtil.toDayjs(invalidInput);

          expect(actual).toBeNull();
        });
      });
    });
  });

  describe('toFormDate', () => {
    describe('should parse a valid dayjs object to FormGroup date format', () => {
      const testCases = [
        { input: dayjs('2020-01-01T00:00:00Z'), expected: { day: 1, month: 1, year: 2020 } },
        { input: dayjs('2020-02-29T00:00:00Z'), expected: { day: 29, month: 2, year: 2020 } },
        { input: dayjs('2025-04-01T00:00:00Z'), expected: { day: 1, month: 4, year: 2025 } },
        { input: dayjs('2027-07-15T00:00:00Z'), expected: { day: 15, month: 7, year: 2027 } },
        { input: dayjs('2026-12-31T00:00:00Z'), expected: { day: 31, month: 12, year: 2026 } },
      ];

      testCases.forEach(({ input, expected }) => {
        it(`input: ${input}`, () => {
          const actual = DateUtil.toFormDate(input);

          expect(actual).toEqual(expected);
        });
      });
    });

    describe('should parse a valid date string of "YYYY-MM-DD" to FormGroup date format', () => {
      const testCases = [
        { input: '2020-01-01', expected: { day: 1, month: 1, year: 2020 } },
        { input: '2020-02-29', expected: { day: 29, month: 2, year: 2020 } },
        { input: '2025-04-01', expected: { day: 1, month: 4, year: 2025 } },
        { input: '2027-07-15', expected: { day: 15, month: 7, year: 2027 } },
        { input: '2026-12-31', expected: { day: 31, month: 12, year: 2026 } },
      ];

      testCases.forEach(({ input, expected }) => {
        it(`input: ${input}`, () => {
          const actual = DateUtil.toFormDate(input);

          expect(actual).toEqual(expected);
        });
      });
    });

    describe('should parse any invalid input to null', () => {
      const testCases = ['not dayjs object', '2023-12-99', '2020-13-05', undefined, null, {}, 123];

      testCases.forEach((invalidInput) => {
        it(`invalidInput: ${invalidInput}`, () => {
          // @ts-expect-error
          const actual = DateUtil.toFormDate(invalidInput);

          expect(actual).toBeNull();
        });
      });
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
