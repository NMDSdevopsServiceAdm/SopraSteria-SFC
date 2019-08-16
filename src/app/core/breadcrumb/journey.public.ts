import { JourneyRoute } from './breadcrumb.model';

enum Path {
  FEEDBACK = '/feedback',
  COOKIE_POLICY = '/cookie-policy',
  CONTACT_US = '/contact-us',
  ACCESSIBILITY_STATEMENT = '/accessibility-statement',
  TERMS_AND_CONDITIONS = '/terms-and-conditions',
  PRIVACY_NOTICE = '/privacy-notice',
}

export const publicJourney: JourneyRoute = {
  children: [
    {
      title: 'Feedback',
      path: Path.FEEDBACK,
    },
    {
      title: 'Cookie policy',
      path: Path.COOKIE_POLICY,
    },
    {
      title: 'Contact us',
      path: Path.CONTACT_US,
    },
    {
      title: 'Accessibility statement',
      path: Path.ACCESSIBILITY_STATEMENT,
    },
    {
      title: 'Terms and conditions',
      path: Path.TERMS_AND_CONDITIONS,
    },
    {
      title: 'Privacy notice',
      path: Path.PRIVACY_NOTICE,
    },
  ],
};
