import { JourneyRoute } from './breadcrumb.model';

enum Path {
  ACCOUNT_DETAILS = '/account-management',
  YOUR_DETAILS = '/account-management/change-your-details',
  YOUR_PASSWORD = '/account-management/change-password',
  YOUR_SECURITY_QUESTION = '/account-management/change-user-security',
}

export const accountJourney: JourneyRoute = {
  children: [
    {
      title: 'Account details',
      path: Path.ACCOUNT_DETAILS,
      children: [
        {
          title: 'Your details',
          path: Path.YOUR_DETAILS,
        },
        {
          title: 'Your password',
          path: Path.YOUR_PASSWORD,
        },
        {
          title: 'Your security question',
          path: Path.YOUR_SECURITY_QUESTION,
        },
      ],
    },
  ],
};
