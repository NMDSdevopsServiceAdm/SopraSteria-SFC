import { render } from '@testing-library/angular';
import { WdfSummaryPanel } from './wdf-summary-panel.component';

describe('Wdf Summary panel', () => {
  const meetingFunding = {
    title: 'Workplace',
    message: 'Your data has met the funding requirements for 2024 to 2025',
    eligibility: true,
  };

  const notMeetingFunding = {
    title: 'Workplace',
    message: 'Your data does not meet funding requirements, 2024 to 2025',
    eligibility: false,
  };

  const setup = async (sections = []) => {
    const { fixture, getByText, queryByText, getByTestId, queryByTestId } = await render(WdfSummaryPanel, {
      imports: [],
      providers: [],
      componentProperties: {
        sections: sections,
      },
    });
    const component = fixture.componentInstance;

    return { component, fixture, getByText, queryByText, getByTestId, queryByTestId };
  };
  it('should create', async () => {
    const { component } = await setup();

    expect(component).toBeTruthy();
  });

  it('should show the section title and message with green tick', async () => {
    const { fixture, getByText, getByTestId } = await setup([meetingFunding]);
    fixture.detectChanges();

    expect(getByText('Workplace')).toBeTruthy();
    expect(getByText(meetingFunding.message)).toBeTruthy();
    expect(getByTestId('green-tick')).toBeTruthy();
  });

  it('should show the section title and message with red flag', async () => {
    const { fixture, getByText, getByTestId } = await setup([notMeetingFunding]);
    fixture.detectChanges();

    expect(getByText('Workplace')).toBeTruthy();
    expect(getByText(notMeetingFunding.message)).toBeTruthy();
    expect(getByTestId('red-flag')).toBeTruthy();
  });
});
