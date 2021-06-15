import { JourneyRoute } from './breadcrumb.model';

enum Path {
  FEEDBACK = '/feedback',
  COOKIE_POLICY = '/cookie-policy',
  CONTACT_US = '/contact-us',
  ACCESSIBILITY_STATEMENT = '/accessibility-statement',
  TERMS_AND_CONDITIONS = '/terms-and-conditions',
  PRIVACY_NOTICE = '/privacy-notice',
  CONTACT_US_OR_LEAVE_FEEDBACK = '/contact-us-or-leave-feedback',
  THANK_YOU = '/thank-you',
  ARTICLE = '/articles/:slug',
  ABOUT_US = '/about-us',
}

export const publicJourney: JourneyRoute = {
  children: [
    {
      title: 'Cookie policy',
      path: Path.COOKIE_POLICY,
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
    {
      title: 'Thank you',
      path: Path.THANK_YOU,
    },
    {
      title: 'ASC-WDS news',
      path: Path.ARTICLE,
    },
    {
      title: 'About us',
      path: Path.ABOUT_US,
    },
    {
      title: 'Contact us or leave feedback',
      path: Path.CONTACT_US_OR_LEAVE_FEEDBACK,
      children: [
        {
          title: 'Feedback',
          path: Path.FEEDBACK,
        },
        {
          title: 'Contact us',
          path: Path.CONTACT_US,
        },
      ],
    },
  ],
};
