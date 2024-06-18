import { JourneyRoute } from './breadcrumb.model';

enum Path {
  BECOME_A_PARENT = '/become-a-parent',
  LINK_TO_PARENT = '/link-to-parent',
  REMOVE_LINK_TO_PARENT = '/workplace/remove_link-to-parent',
  CHANGE_DATA_OWNER = '/change-data-owner',
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

export const removeLinkToParentJourney: JourneyRoute = {
  children: [
    {
      title: `Remove the link to your parent workplace`,
      path: Path.REMOVE_LINK_TO_PARENT,
    },
  ],
};

export const changeDataOwnerJourney: JourneyRoute = {
  children: [
    {
      title: `Change data owner`,
      path: Path.CHANGE_DATA_OWNER,
    },
  ],
};
