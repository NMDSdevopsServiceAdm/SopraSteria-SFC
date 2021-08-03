const expect = require('chai').expect;
const { formatLaResponse } = require('../../../../services/local-authorities/local-authorities');

describe('/server/services/local-authorities/local-authorities', () => {
  describe('formatLaResponse', () => {
    it('should reformat returned local authorities object', async () => {
      const las = [
        {
          LocalAuthorityName: 'Example 1',
          ThisYear: 0,
          Status: 'Not Updated',
          Notes: 'This is a comment',
          establishment: {
            nmdsId: 'J103894',
          },
        },
        {
          LocalAuthorityName: 'Example 2',
          ThisYear: 10,
          Status: 'Updated, Complete',
          Notes: 'This is a comment',
          establishment: {
            nmdsId: 'J112583',
          },
        },
        {
          LocalAuthorityName: 'Example 3',
          ThisYear: 104,
          Status: 'Not Updated',
          Notes: null,
          establishment: {
            nmdsId: 'G223485',
          },
        },
      ];

      const expectedResponse = {
        J: [
          { name: 'Example 1', status: 'Not Updated', workers: 0, notes: true },
          { name: 'Example 2', status: 'Updated, Complete', workers: 10, notes: true },
        ],
        G: [{ name: 'Example 3', status: 'Not Updated', workers: 104, notes: false }],
      };

      const reply = formatLaResponse(las);

      expect(reply).to.deep.equal(expectedResponse);
    });
  });
});
