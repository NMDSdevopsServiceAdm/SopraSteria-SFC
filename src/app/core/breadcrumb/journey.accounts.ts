import { JourneyRoute } from './breadcrumb.model';

enum Path {
  USER_ACCOUNT = '/workplace/:workplaceUid/user/:workerUid',
  EDIT_USER_ACCOUNT = '/workplace/:workplaceUid/user/:workerUid/edit-details',
  ACCOUNT_DETAILS = '/account-management',
  YOUR_DETAILS = '/account-management/change-your-details',
  YOUR_PASSWORD = '/account-management/change-password',
  YOUR_SECURITY_QUESTION = '/account-management/change-user-security',
}

export const accountJourney: JourneyRoute = {
  children: [
    {
      title: 'My account details',
      path: Path.ACCOUNT_DETAILS,
      children: [
        {
          title: 'Name, job title and contact',
          path: Path.YOUR_DETAILS,
        },
        {
          title: 'Password',
          path: Path.YOUR_PASSWORD,
        },
        {
          title: 'Security question',
          path: Path.YOUR_SECURITY_QUESTION,
        },
      ],
    },
  ],
};

export const editUserJourney: JourneyRoute = {
  children: [
    {
      title: 'User details',
      path: Path.USER_ACCOUNT,
      children: [
        {
          title: 'Details',
          path: Path.EDIT_USER_ACCOUNT,
        },
      ],
    },
  ],
};
