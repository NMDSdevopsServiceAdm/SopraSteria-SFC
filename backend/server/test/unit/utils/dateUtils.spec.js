const { calculateTrainingExpiryDate } = require('../../../utils/dateUtils');

const expect = require('chai').expect;

describe.only('dateUtils', () => {
  describe('calculateTrainingExpiryDate', () => {
    it('should take a completionDate and validityPeriodInMonth and return the expected expiry date in format YYYY-MM-DD', () => {
      const completionDate = '2025-11-01';
      const validityPeriodInMonth = 12;

      const expected = '2026-10-31';
      const actual = calculateTrainingExpiryDate(completionDate, validityPeriodInMonth);

      expect(actual).to.equal(expected);
    });

    const testCases = [
      { completionDate: '2025-11-01', validityPeriodInMonth: 1, expected: '2025-11-30' },
      { completionDate: '2025-11-15', validityPeriodInMonth: 1, expected: '2025-12-14' },
      { completionDate: '2025-11-30', validityPeriodInMonth: 1, expected: '2025-12-29' },
      { completionDate: '2025-12-31', validityPeriodInMonth: 1, expected: '2026-01-30' },
      { completionDate: '2025-12-31', validityPeriodInMonth: 2, expected: '2026-02-28' },
      { completionDate: '2024-02-29', validityPeriodInMonth: 12, expected: '2025-02-28' },
    ];

    testCases.forEach(({ completionDate, validityPeriodInMonth, expected }) => {
      it(`test case: ${completionDate} + ${validityPeriodInMonth} months -> ${expected}`, () => {
        const actual = calculateTrainingExpiryDate(completionDate, validityPeriodInMonth);

        expect(actual).to.equal(expected);
      });
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
});
