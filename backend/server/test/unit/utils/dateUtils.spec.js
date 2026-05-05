const { calculateTrainingExpiryDate, formatDateTime } = require('../../../utils/dateUtils');

const expect = require('chai').expect;
const moment = require('moment');

describe('dateUtils', () => {
  describe('calculateTrainingExpiryDate', () => {
    it('should take a completionDate and validityPeriodInMonth and return the expected expiry date in format YYYY-MM-DD', () => {
      const completionDate = '2025-11-01';
      const validityPeriodInMonth = 12;

      const expected = '2026-10-31';
      const actual = calculateTrainingExpiryDate(completionDate, validityPeriodInMonth);

      expect(actual).to.equal(expected);
    });

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
      it(`test case: ${completed} + ${validityPeriodInMonth} months -> ${expected}`, () => {
        const actual = calculateTrainingExpiryDate(completed, validityPeriodInMonth);

        expect(actual).to.equal(expected);
      });
    });

    it('should be able to handle completion date as momentJS object', () => {
      // for backward compatibility, as some legacy code still using the deprecated momentJS
      const completionDate = moment.utc('2025-11-01', 'YYYY-MM-DD');
      const validityPeriodInMonth = 12;

      const expected = '2026-10-31';
      const actual = calculateTrainingExpiryDate(completionDate, validityPeriodInMonth);

      expect(actual).to.equal(expected);
    });

    it('should be able to handle completion date as JS Date() object', () => {
      const completionDate = new Date('2025-11-01Z');
      const validityPeriodInMonth = 12;

      const expected = '2026-10-31';
      const actual = calculateTrainingExpiryDate(completionDate, validityPeriodInMonth);

      expect(actual).to.equal(expected);
    });

    it('should return null if completionDate is invalid', () => {
      const completionDate = 'apple';
      const validityPeriodInMonth = 12;

      const expected = null;
      const actual = calculateTrainingExpiryDate(completionDate, validityPeriodInMonth);

      expect(actual).to.equal(expected);
    });

    it('should return null if validityPeriodInMonth is invalid', () => {
      const completionDate = '2025-11-01';
      const validityPeriodInMonth = -100;

      const expected = null;
      const actual = calculateTrainingExpiryDate(completionDate, validityPeriodInMonth);

      expect(actual).to.equal(expected);
    });
  });

  describe('formatDateTime', () => {
    it('should format the given date with the given format', async () => {
      const mockDateTime = new Date('2025-01-02T12:34:56Z');
      const formatString = 'DD/MMM/YYYY - HH:mm';

      const expected = '02/Jan/2025 - 12:34';
      const actual = formatDateTime(mockDateTime, formatString);

      expect(actual).to.equal(expected);
    });

    describe('timezone issue related to DST', () => {
      it('should use the UK timezone as default', () => {
        const mockDateTime = new Date('2025-04-05T12:34:56Z');
        const formatString = 'DD/MMM/YYYY - HH:mm';

        const expected = '05/Apr/2025 - 13:34';
        const actual = formatDateTime(mockDateTime, formatString);

        expect(actual).to.equal(expected);
      });

      const testCases = [
        { dateTime: '2025-04-05T11:34:56Z', expected: '05/Apr/2025 - 12:34' },
        { dateTime: '2025-04-05T12:34:56+01:00', expected: '05/Apr/2025 - 12:34' },
        { dateTime: '2025-04-05T20:34:56+09:00', expected: '05/Apr/2025 - 12:34' },

        { dateTime: '2025-11-23T12:34:56Z', expected: '23/Nov/2025 - 12:34' },
        { dateTime: '2025-11-23T12:34:56+01:00', expected: '23/Nov/2025 - 11:34' },
        { dateTime: '2025-11-23T21:34:56+09:00', expected: '23/Nov/2025 - 12:34' },
      ];

      testCases.forEach(({ dateTime, expected }) => {
        it(`should handle DST correctly: ${dateTime} --> ${expected}`, () => {
          const mockDateTime = new Date(dateTime);
          const formatString = 'DD/MMM/YYYY - HH:mm';

          const actual = formatDateTime(mockDateTime, formatString);

          expect(actual).to.equal(expected);
        });
      });
    });
  });
});
