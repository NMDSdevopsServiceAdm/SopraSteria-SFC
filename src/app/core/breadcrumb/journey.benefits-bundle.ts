import { JourneyRoute } from './breadcrumb.model';

enum Path {
  BENEFITS_BUNDLE = '/benefits-bundle',
  BENEFITS_TRAINING_DISCOUNTS = '/benefits-bundle/training-discounts',
  ELEARNING_DISCOUNTS = '/benefits-bundle/elearning-discounts',
  TAILORED_SEMINARS = '/benefits-bundle/tailored-seminars',
}

export const benefitsBundleJourney: JourneyRoute = {
  children: [
    {
      title: 'The ASC-WDS Benefits Bundle',
      path: Path.BENEFITS_BUNDLE,
      children: [
        {
          title: 'Endorsed training providers',
          path: Path.BENEFITS_TRAINING_DISCOUNTS,
        },
        {
          title: 'eLearning modules',
          path: Path.ELEARNING_DISCOUNTS,
        },
        {
          title: 'Tailored seminars',
          path: Path.TAILORED_SEMINARS,
        },
      ],
    },
  ],
};
