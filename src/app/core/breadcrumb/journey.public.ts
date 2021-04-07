import { JourneyRoute } from './breadcrumb.model';

enum Path {
  FEEDBACK = '/contact-us-or-leave-feedback/feedback',
  COOKIE_POLICY = '/cookie-policy',
  CONTACT_US = '/contact-us-or-leave-feedback/contact-us',
  ACCESSIBILITY_STATEMENT = '/accessibility-statement',
  TERMS_AND_CONDITIONS = '/terms-and-conditions',
  PRIVACY_NOTICE = '/privacy-notice',
  CONTACT_US_OR_LEAVE_FEEDBACK = '/contact-us-or-leave-feedback',
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
