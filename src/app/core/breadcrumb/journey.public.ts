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
      url: Path.FEEDBACK,
    },
    {
      title: 'Cookie policy',
      url: Path.COOKIE_POLICY,
    },
    {
      title: 'Contact us',
      url: Path.CONTACT_US,
    },
    {
      title: 'Accessibility statement',
      url: Path.ACCESSIBILITY_STATEMENT,
    },
    {
      title: 'Terms and conditions',
      url: Path.TERMS_AND_CONDITIONS,
    },
    {
      title: 'Privacy notice',
      url: Path.PRIVACY_NOTICE,
    },
  ],
};
