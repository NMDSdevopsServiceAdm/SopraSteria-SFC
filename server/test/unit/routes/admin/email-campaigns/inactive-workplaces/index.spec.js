const expect = require('chai').expect;
const { findInactiveWorkplaces } = require('../../../../../../routes/admin/email-campaigns/inactive-workplaces');

describe('server/routes/admin/email-campaigns/inactive-workplaces', () => {

  it('should return inactive workplaces', async () => {
    const inactiveWorkplaces = await findInactiveWorkplaces();

    expect(inactiveWorkplaces).to.deep.equal([
      {
        name: 'Workplace Name',
        nmdsId: 'J1234567',
        lastUpdated: '2020-06-01',
        emailTemplate: 6,
        dataOwner: 'Workplace',
        user: {
          name: 'Test Name',
          email: 'test@example.com',
        },
      },
      {
        name: 'Second Workplace Name',
        nmdsId: 'A0012345',
        lastUpdated: '2020-01-01',
        emailTemplate: 12,
        dataOwner: 'Workplace',
        user: {
          name: 'Name McName',
          email: 'name@mcname.com',
        },
      }
    ]);
  });
});
