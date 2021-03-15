const expect = require('chai').expect;

const models = require('../../../../../models');
const findParentWorkplaces = require('../../../../../services/email-campaigns/inactive-workplaces/findParentWorkplaces');

describe('server/routes/admin/email-campaigns/inactive-workplaces/findParentWorkplaces', () => {
  const dummyParentWorkplaces = [
    {
      id: 1,
      name: 'Test Name',
      nmdsId: 'A1234567',
      lastUpdated: '6 months ago',
      emailTemplate: {
        id: 15,
        name: 'Parent',
      },
      dataOwner: 'Workplace',
      user: {
        name: 'Test Person',
        email: 'test@example.com',
      },
      subsidiaries: [
        {
          id: 2,
          name: 'Test Name 2',
          nmdsId: 'J231466',
          lastUpdated: '3 months ago',
          dataOwner: 'Parent',
        },
        {
          id: 3,
          name: 'Test Name 3',
          nmdsId: 'H2345678',
          lastUpdated: '6 months ago',
          dataOwner: 'Parent',
        },
      ],
    },
  ];

  it('should return parent workplaces', async () => {
    const parentWorkplaces = await findParentWorkplaces.findParentWorkplaces();

    expect(parentWorkplaces).to.deep.equal(dummyParentWorkplaces);
  });
});
