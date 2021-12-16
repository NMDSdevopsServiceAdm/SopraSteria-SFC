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
    },
    {
      title: `Discounts from Skills for Care's endorsed providers`,
      path: Path.BENEFITS_TRAINING_DISCOUNTS,
    },
  ],
};
