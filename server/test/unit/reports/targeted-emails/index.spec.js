const expect = require('chai').expect;

const { formatWorkplacesToEmail } = require('../../../../reports/targeted-emails');

describe('reports/targetedEmails/index', () => {
  const mockUsers = [
    {
      get() {
        return 'mock@email.com';
      },
      establishment: {
        nmdsId: 'A123456',
      },
    },
    {
      get() {
        return 'mock2@email.com';
      },
      establishment: {
        nmdsId: 'A123459',
      },
    },
  ];

  describe('formatWorkplacesToEmail()', () => {
    it('should return array with objects containing nmdsId and email', async () => {
      const data = formatWorkplacesToEmail(mockUsers);

      expect(data).to.deep.equal([
        {
          nmdsId: 'A123456',
          emailAddress: 'mock@email.com',
        },
        {
          nmdsId: 'A123459',
          emailAddress: 'mock2@email.com',
        },
      ]);
    });
  });
});
