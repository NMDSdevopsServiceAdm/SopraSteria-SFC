import { DateUtil } from './date-util';

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
