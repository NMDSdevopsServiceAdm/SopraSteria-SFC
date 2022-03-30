import { JourneyRoute } from './breadcrumb.model';

enum Path {
  MAKE_CLAIM = '/wdf-claims/grant-letter',
}

export const wdfClaimsJourney: JourneyRoute = {
  children: [
    {
      title: 'Make and manage WDF claims',
      path: Path.MAKE_CLAIM,
    },
  ],
};
