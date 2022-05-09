const expect = require('chai').expect;

const { formatWorkplacesToEmail, getWorkplacesWithoutEmail } = require('../../../../reports/targeted-emails');

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

  const mockWorkplacesToEmail = [
    {
      nmdsId: 'A123456',
      emailAddress: 'mock@email.com',
    },
    {
      nmdsId: 'A123459',
      emailAddress: 'mock2@email.com',
    },
  ];

  describe('formatWorkplacesToEmail()', () => {
    it('should return array with objects containing nmdsId and email', async () => {
      const data = formatWorkplacesToEmail(mockUsers);

      expect(data).to.deep.equal(mockWorkplacesToEmail);
    });
  });

  describe('getWorkplacesWithoutEmail()', () => {
    const nmdsIdsList = ['A123456', 'A123459'];

    it('should return array with all nmdsIds when all IDs in workplacesToEmail', async () => {
      const data = getWorkplacesWithoutEmail(mockWorkplacesToEmail, nmdsIdsList);

      expect(data).to.deep.equal(['A123456', 'A123459']);
    });

    it('should return empty array when workplacesToEmail is empty', async () => {
      const workplacesToEmail = [];

      const data = getWorkplacesWithoutEmail(workplacesToEmail, nmdsIdsList);

      expect(data).to.deep.equal([]);
    });

    it('should return array with first nmdsId when second ID not in workplacesToEmail', async () => {
      const workplacesToEmail = [
        {
          nmdsId: 'A123456',
          emailAddress: 'mock@email.com',
        },
      ];

      const data = getWorkplacesWithoutEmail(workplacesToEmail, nmdsIdsList);

      expect(data).to.deep.equal(['A123456']);
    });

    it('should return array with second nmdsId when first ID not in workplacesToEmail', async () => {
      const workplacesToEmail = [
        {
          nmdsId: 'A123459',
          emailAddress: 'mock2@email.com',
        },
      ];

      const data = getWorkplacesWithoutEmail(workplacesToEmail, nmdsIdsList);

      expect(data).to.deep.equal(['A123459']);
    });
  });
});
