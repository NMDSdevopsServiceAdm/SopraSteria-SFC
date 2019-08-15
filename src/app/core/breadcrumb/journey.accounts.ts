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
      url: Path.ACCOUNT_DETAILS,
      children: [
        {
          title: 'Your details',
          url: Path.YOUR_DETAILS,
        },
        {
          title: 'Your password',
          url: Path.YOUR_PASSWORD,
        },
        {
          title: 'Your security question',
          url: Path.YOUR_SECURITY_QUESTION,
        },
      ],
    },
  ],
};
