import { JourneyRoute } from './breadcrumb.model';

enum Path {
  BENEFITS_BUNDLE = '/benefits-bundle',
  BENEFITS_TRAINING_DISCOUNTS = '/training-discounts',
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
      ],
    },
  ],
};
