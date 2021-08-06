const expect = require('chai').expect;
const { formatLaResponse } = require('../../../../services/local-authorities/local-authorities');

describe('/server/services/local-authorities/local-authorities', () => {
  describe('formatLaResponse', () => {
    it('should reformat returned local authorities object', async () => {
      const las = [
        {
          LocalAuthorityName: 'Example 1',
          ThisYear: 0,
          Status: 'Not updated',
          Notes: 'This is a comment',
          LocalAuthorityUID: 'SomeUID1',
          establishment: {
            nmdsId: 'J103894',
          },
        },
        {
          LocalAuthorityName: 'Example 2',
          ThisYear: 10,
          Status: 'Update, complete',
          Notes: 'This is a comment',
          LocalAuthorityUID: 'SomeUID2',
          establishment: {
            nmdsId: 'J112583',
          },
        },
        {
          LocalAuthorityName: 'Example 3',
          ThisYear: 104,
          Status: 'Not updated',
          Notes: null,
          LocalAuthorityUID: 'SomeUID3',
          establishment: {
            nmdsId: 'G223485',
          },
        },
      ];

      const expectedResponse = {
        J: [
          { name: 'Example 1', status: 'Not updated', workers: 0, notes: true, localAuthorityUID: 'SomeUID1' },
          { name: 'Example 2', status: 'Update, complete', workers: 10, notes: true, localAuthorityUID: 'SomeUID2' },
        ],
        G: [{ name: 'Example 3', status: 'Not updated', workers: 104, notes: false, localAuthorityUID: 'SomeUID3' }],
      };

      const reply = formatLaResponse(las);

      expect(reply).to.deep.equal(expectedResponse);
    });
  });
});
