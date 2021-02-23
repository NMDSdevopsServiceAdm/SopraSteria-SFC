const findInactiveWorkplaces = async () => {
  return [
    {
      name: 'Workplace Name',
      nmdsId: 'J1234567',
      lastUpdated: '2020-06-01',
      emailTemplateId: 6,
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
      emailTemplateId: 12,
      dataOwner: 'Workplace',
      user: {
        name: 'Name McName',
        email: 'name@mcname.com',
      },
    }
  ];
}

module.exports = {
  findInactiveWorkplaces
};
