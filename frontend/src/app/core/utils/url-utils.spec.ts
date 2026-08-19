import { parseUrl } from './url-util';

describe('url-util', () => {
  describe('parseURL', () => {
    const testCases = [
      { mockUrl: '/dashboard', expectedPathname: '/dashboard', expectedHash: '' },
      { mockUrl: '/dashboard#home', expectedPathname: '/dashboard', expectedHash: '#home' },
      { mockUrl: '/dashboard#staff-records', expectedPathname: '/dashboard', expectedHash: '#staff-records' },
      {
        mockUrl: '/workplace/mock-uid-1/staff-record/mock-uid-2/staff-record-summary/date-of-birth#Error-summary',
        expectedPathname: '/workplace/mock-uid-1/staff-record/mock-uid-2/staff-record-summary/date-of-birth',
        expectedHash: '#Error-summary',
      },
    ];

    testCases.forEach((testCase) => {
      const { mockUrl, expectedPathname, expectedHash } = testCase;
      it(`should parse a partial url into its components: ${mockUrl}`, () => {
        const result = parseUrl(mockUrl);

        expect(result.pathname).toEqual(expectedPathname);
        expect(result.hash).toEqual(expectedHash);
      });
    });
  });
});
