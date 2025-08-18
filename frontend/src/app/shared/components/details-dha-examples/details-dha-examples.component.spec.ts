import { SharedModule } from '@shared/shared.module';
import { render } from '@testing-library/angular';

import { DetailsDhaExamplesComponent } from './details-dha-examples.component';

describe('DetailsDhaExamplesComponent', () => {
  const mockDelegatedHealthcareActivities = [
    {
      id: 1,
      title: 'Vital signs monitoring',
      description: 'Like monitoring heart rate as part of the treatment of a condition.',
    },
    {
      id: 2,
      title: 'Specialised medication administration',
      description: 'Like administering warfarin.',
    },
  ];

  const setup = async (overrides: any = {}) => {
    const setupTools = await render(DetailsDhaExamplesComponent, {
      imports: [SharedModule],
      providers: [],
      componentProperties: {
        allDHAs: mockDelegatedHealthcareActivities,
        staffWhatKindDelegatedHealthcareActivities: overrides.staffWhatKindDelegatedHealthcareActivities ?? null,
      },
    });

    const component = setupTools.fixture.componentInstance;

    return { ...setupTools, component };
  };

  it('should create', async () => {
    const { component } = await setup();
    expect(component).toBeTruthy();
  });

  describe('when workplace DHA question 2 is not answered', () => {
    it('should show a reveal title and examples of all DHAs with description', async () => {
      const { getByText } = await setup();

      const revealTitle = getByText('See delegated healthcare activities that your staff might carry out');

      expect(revealTitle).toBeTruthy();
      mockDelegatedHealthcareActivities.forEach((activity) => {
        expect(getByText(activity.title)).toBeTruthy();
        expect(getByText(activity.description)).toBeTruthy();
      });
    });
  });

  describe('when workplace DHA question 2 is answered', () => {
    it('should show a different reveal title and a list of activities that the staff currently carry out, if the activities are known', async () => {
      const mockQuestionTwoAnswer = {
        whatDelegateHealthcareActivities: 'Yes',
        activities: [{ id: mockDelegatedHealthcareActivities[0].id }, { id: mockDelegatedHealthcareActivities[1].id }],
      };

      const { getByText, queryByText } = await setup({
        staffWhatKindDelegatedHealthcareActivities: mockQuestionTwoAnswer,
      });

      const revealTitle = getByText('See the delegated healthcare activities that your staff carry out');
      expect(revealTitle).toBeTruthy();

      expect(getByText("You've said that staff in your workplace currently carry out:")).toBeTruthy();

      mockDelegatedHealthcareActivities.forEach((activity) => {
        const dhaTitleWithFirstLetterLowerCase = activity.title.charAt(0).toLowerCase() + activity.title.slice(1);
        expect(getByText(dhaTitleWithFirstLetterLowerCase)).toBeTruthy();
        expect(queryByText(activity.description)).toBeFalsy();
      });
    });

    it('should show all example activities with description if the activities are not known', async () => {
      const mockQuestionTwoAnswer = {
        whatDelegateHealthcareActivities: "Don't know",
        activities: null,
      };

      const { getByText } = await setup({
        staffWhatKindDelegatedHealthcareActivities: mockQuestionTwoAnswer,
      });

      const revealTitle = getByText('See delegated healthcare activities that your staff might carry out');

      expect(revealTitle).toBeTruthy();
      mockDelegatedHealthcareActivities.forEach((activity) => {
        expect(getByText(activity.title)).toBeTruthy();
        expect(getByText(activity.description)).toBeTruthy();
      });
    });

    it('should show all example activities with description if the answer is Yes but no activities were selected', async () => {
      const mockQuestionTwoAnswer = {
        whatDelegateHealthcareActivities: 'Yes',
        activities: [],
      };

      const { getByText } = await setup({
        staffWhatKindDelegatedHealthcareActivities: mockQuestionTwoAnswer,
      });

      const revealTitle = getByText('See delegated healthcare activities that your staff might carry out');

      expect(revealTitle).toBeTruthy();
      mockDelegatedHealthcareActivities.forEach((activity) => {
        expect(getByText(activity.title)).toBeTruthy();
        expect(getByText(activity.description)).toBeTruthy();
      });
    });
  });
});
