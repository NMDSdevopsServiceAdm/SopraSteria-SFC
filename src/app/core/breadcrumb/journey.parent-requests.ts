import { JourneyRoute } from './breadcrumb.model';

enum Path {
  BECOME_A_PARENT = '/become-a-parent',
  LINK_TO_PARENT = '/link-to-parent',
}

export const becomeAParentJourney: JourneyRoute = {
  children: [
    {
      title: `Become a parent and manage other workplaces' data`,
      path: Path.BECOME_A_PARENT,
    },
  ],
};

export const linkToParentJourney: JourneyRoute = {
  children: [
    {
      title: `Link to a parent workplace`,
      path: Path.LINK_TO_PARENT,
    },
  ],
};
