const findParentWorkplaces = async () => {

  return [
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
};

module.exports = {
  findParentWorkplaces,
};
