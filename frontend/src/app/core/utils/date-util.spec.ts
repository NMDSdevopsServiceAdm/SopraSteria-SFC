import dayjs from 'dayjs';
import { DateUtil } from './date-util';
import { FormatDate } from './date-util';
import { DATE_PARSE_FORMAT } from '@core/constants/constants';

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

  describe('expectedExpiryDate', () => {
    describe('should calculate the expected expiry date from given completed date and validity months', () => {
      const testCases = [
        { completed: '2025-01-01', validityPeriodInMonth: 1, expected: '2025-01-31' },
        { completed: '2025-01-01', validityPeriodInMonth: 2, expected: '2025-02-28' },
        { completed: '2025-01-01', validityPeriodInMonth: 3, expected: '2025-03-31' },
        { completed: '2025-02-01', validityPeriodInMonth: 1, expected: '2025-02-28' },
        { completed: '2025-02-01', validityPeriodInMonth: 2, expected: '2025-03-31' },
        { completed: '2025-02-01', validityPeriodInMonth: 3, expected: '2025-04-30' },
        { completed: '2025-03-01', validityPeriodInMonth: 1, expected: '2025-03-31' },
        { completed: '2025-03-01', validityPeriodInMonth: 2, expected: '2025-04-30' },
        { completed: '2025-11-15', validityPeriodInMonth: 1, expected: '2025-12-14' },
        { completed: '2025-11-30', validityPeriodInMonth: 1, expected: '2025-12-29' },
        { completed: '2025-12-31', validityPeriodInMonth: 1, expected: '2026-01-30' },
        { completed: '2025-12-31', validityPeriodInMonth: 2, expected: '2026-02-28' },
        { completed: '2024-02-29', validityPeriodInMonth: 12, expected: '2025-02-28' },
      ];

      testCases.forEach(({ completed, validityPeriodInMonth, expected }) => {
        it(`completed: ${completed}, validityPeriodInMonth: ${validityPeriodInMonth}`, () => {
          const completedInDayJs = DateUtil.toDayjs(completed);

          const output = DateUtil.expectedExpiryDate(completedInDayJs, validityPeriodInMonth);
          const outputInStringForm = output.format(DATE_PARSE_FORMAT);

          expect(outputInStringForm).toEqual(expected);
        });
      });
    });

    describe('should return null for invalid input', () => {
      const testCases = [
        { completed: DateUtil.toDayjs('2025-11-01'), validityPeriodInMonth: null },
        { completed: DateUtil.toDayjs('2025-11-01'), validityPeriodInMonth: 0 },
        { completed: DateUtil.toDayjs('2025-11-01'), validityPeriodInMonth: -20 },
        { completed: undefined, validityPeriodInMonth: 12 },
        { completed: null, validityPeriodInMonth: 12 },
        { completed: 'some random string', validityPeriodInMonth: 12 },
        { completed: undefined, validityPeriodInMonth: undefined },
      ];

      testCases.forEach(({ completed, validityPeriodInMonth }) => {
        it(`invalidInput`, () => {
          // @ts-expect-error
          const actual = DateUtil.expectedExpiryDate(completed, validityPeriodInMonth);

          expect(actual).toBeNull();
        });
      });
    });
  });

  describe('expiryDateDoesNotMatch', () => {
    describe('should return true if all inputs have valid values but does not agree with each other', () => {
      const testCases = [
        {
          completed: DateUtil.toDayjs('2025-11-01'),
          expires: DateUtil.toDayjs('2026-11-02'),
          validityPeriodInMonth: 12,
        },
        {
          completed: DateUtil.toDayjs('2025-04-15'),
          expires: DateUtil.toDayjs('2025-06-30'),
          validityPeriodInMonth: 2,
        },
      ];

      testCases.forEach(({ completed, expires, validityPeriodInMonth }) => {
        it(`completed: ${completed}, expires: ${expires}, validityPeriodInMonth: ${validityPeriodInMonth}`, () => {
          const actual = DateUtil.expiryDateDoesNotMatch(completed, expires, validityPeriodInMonth);

          expect(actual).toBeTrue();
        });
      });
    });

    describe('should return false if any of the given inputs are invalid', () => {
      const testCases = [
        {
          completed: undefined,
          expires: DateUtil.toDayjs('2026-11-01'),
          validityPeriodInMonth: 12,
        },
        {
          completed: DateUtil.toDayjs('2025-11-01'),
          expires: undefined,
          validityPeriodInMonth: 12,
        },
        {
          completed: DateUtil.toDayjs('2025-11-01'),
          expires: DateUtil.toDayjs('2026-11-01'),
          validityPeriodInMonth: null,
        },
        {
          completed: DateUtil.toDayjs('2025-11-01'),
          expires: DateUtil.toDayjs('2025-11-01'),
          validityPeriodInMonth: 0,
        },
        {
          completed: DateUtil.toDayjs('2025-11-01'),
          expires: DateUtil.toDayjs('2024-11-01'),
          validityPeriodInMonth: -12,
        },
      ];

      testCases.forEach(({ completed, expires, validityPeriodInMonth }) => {
        it(`completed: ${completed}, expires: ${expires}, validityPeriodInMonth: ${validityPeriodInMonth}`, () => {
          const actual = DateUtil.expiryDateDoesNotMatch(completed, expires, validityPeriodInMonth);

          expect(actual).toBeFalse();
        });
      });
    });

    describe('should return false if all values are valid and the given dates and validity agree with each other', () => {
      const testCases = [
        {
          completed: DateUtil.toDayjs('2025-01-08'),
          expires: DateUtil.toDayjs('2027-01-07'),
          validityPeriodInMonth: 24,
        },
        {
          completed: DateUtil.toDayjs('2025-08-22'),
          expires: DateUtil.toDayjs('2027-08-21'),
          validityPeriodInMonth: 24,
        },
        {
          completed: DateUtil.toDayjs('2025-01-01'),
          expires: DateUtil.toDayjs('2025-12-31'),
          validityPeriodInMonth: 12,
        },
        {
          completed: DateUtil.toDayjs('2025-01-31'),
          expires: DateUtil.toDayjs('2025-04-30'),
          validityPeriodInMonth: 3,
        },
        {
          completed: DateUtil.toDayjs('2024-12-31'),
          expires: DateUtil.toDayjs('2025-02-28'),
          validityPeriodInMonth: 2,
        },
      ];

      testCases.forEach(({ completed, expires, validityPeriodInMonth }) => {
        it(`completed: ${completed}, expires: ${expires}, validityPeriodInMonth: ${validityPeriodInMonth}`, () => {
          const actual = DateUtil.expiryDateDoesNotMatch(completed, expires, validityPeriodInMonth);

          expect(actual).toBeFalse();
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
