import { JourneyRoute } from './breadcrumb.model';

enum Path {
  BENEFITS_BUNDLE = '/benefits-bundle',
}

export const benefitsBundleJourney: JourneyRoute = {
  children: [
    {
      title: 'The ASC-WDS Benefits Bundle',
      path: Path.BENEFITS_BUNDLE,
    },
  ],
};
