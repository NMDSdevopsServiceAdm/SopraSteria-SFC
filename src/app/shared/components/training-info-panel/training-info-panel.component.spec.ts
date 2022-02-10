import { queryByText, render } from '@testing-library/angular';

import { TrainingInfoPanelComponent } from './training-info-panel.component';

describe('TrainingInfoPanelComponent', () => {
  async function setup(missing = 0, expired = 0, expiring = 0) {
    const { fixture, getByText, getAllByText, queryByText, getByTestId, queryByTestId, queryAllByText } = await render(
      TrainingInfoPanelComponent,
      {
        imports: [],
        declarations: [],
        providers: [],
        componentProperties: {
          totalExpiredTraining: expired,
          totalExpiringTraining: expiring,
          totalStaffMissingMandatoryTraining: missing,
        },
      },
    );

    const component = fixture.componentInstance;

    return {
      component,
      fixture,
      getByText,
      getAllByText,
      queryByText,
      getByTestId,
      queryByTestId,
      queryAllByText,
    };
  }

  it('should render the component', async () => {
    const component = await setup();
    expect(component).toBeTruthy();
  });

  it('should show the number of missing, expired and expiring soon records', async () => {
    const { getByText, getAllByText } = await setup(1, 1, 1);

    expect(getAllByText('Summary').length).toEqual(1);
    expect(getAllByText('1').length).toEqual(3);
    expect(getByText('staff are missing mandatory training')).toBeTruthy();
    expect(getByText('record has expired')).toBeTruthy();
    expect(getByText('record expires soon')).toBeTruthy();
  });

  it('should show the number of missing, expired and expiring soon records pluralised when multiple records fit the criteria', async () => {
    const { getByText, getAllByText } = await setup(2, 2, 2);

    expect(getAllByText('2').length).toEqual(3);
    expect(getByText('staff are missing mandatory training')).toBeTruthy();
    expect(getByText('records have expired')).toBeTruthy();
    expect(getByText('records expire soon')).toBeTruthy();
  });

  it('should not show any summary when there are no missing, expired or expiring soon records', async () => {
    const { queryByText, queryByTestId } = await setup();

    expect(queryByText('Summary')).toBeFalsy();
    expect(queryByTestId('missing-column')).toBeFalsy();
    expect(queryByTestId('expired-column')).toBeFalsy();
    expect(queryByTestId('expiring-column')).toBeFalsy();
  });

  it('should not show missing mandatory records when there are no missing mandatory records but there are expired and expires soon records', async () => {
    const { getByText, getByTestId, queryByTestId } = await setup(0, 1, 3);

    expect(getByText('Summary')).toBeTruthy();
    expect(queryByTestId('missing-column')).toBeFalsy();
    expect(getByTestId('expired-column')).toBeTruthy();
    expect(getByTestId('expiring-column')).toBeTruthy();
  });

  it('should not show expired records when there are no expired records but there are missing mandatory and expires soon records', async () => {
    const { queryAllByText, getByTestId, queryByTestId } = await setup(1, 0, 3);

    expect(queryAllByText('Summary')).toBeTruthy();
    expect(queryByTestId('expired-column')).toBeFalsy();
    expect(getByTestId('missing-column')).toBeTruthy();
    expect(getByTestId('expiring-column')).toBeTruthy();
  });

  it('should not show expires soon records when there are no expires soon records but there are missing mandatory and expired records', async () => {
    const { queryAllByText, getByTestId, queryByTestId } = await setup(1, 3, 0);

    expect(queryAllByText('Summary')).toBeTruthy();
    expect(queryByTestId('expiring-column')).toBeFalsy();
    expect(getByTestId('missing-column')).toBeTruthy();
    expect(getByTestId('expired-column')).toBeTruthy();
  });

  it('should only show missing mandatory column, when there are only missing mandatory records', async () => {
    const { getByText, getByTestId, queryByTestId } = await setup(1, 0, 0);

    expect(getByText('Summary')).toBeTruthy();
    expect(getByTestId('missing-column')).toBeTruthy();
    expect(queryByTestId('expired-column')).toBeFalsy();
    expect(queryByTestId('expiring-column')).toBeFalsy();
  });

  it('should only show expired column, when there are only expired records', async () => {
    const { getByText, getByTestId, queryByTestId } = await setup(0, 1, 0);

    expect(getByText('Summary')).toBeTruthy();
    expect(getByTestId('expired-column')).toBeTruthy();
    expect(queryByTestId('missing-column')).toBeFalsy();
    expect(queryByTestId('expiring-column')).toBeFalsy();
  });

  it('should only show expiring column, when there are only expiring records', async () => {
    const { getByText, getByTestId, queryByTestId } = await setup(0, 0, 1);

    expect(getByText('Summary')).toBeTruthy();
    expect(getByTestId('expiring-column')).toBeTruthy();
    expect(queryByTestId('missing-column')).toBeFalsy();
    expect(queryByTestId('expired-column')).toBeFalsy();
  });

  it('should render full width conditional class if there each training parameter is not 0', async () => {
    const { getByTestId } = await setup(1, 1, 1);

    expect(getByTestId('summary-box').getAttribute('class')).toContain('asc-full-width');
    expect(getByTestId('missing-column').getAttribute('class')).toContain('asc-columns-full-width');
    expect(getByTestId('expired-column').getAttribute('class')).toContain('asc-columns-full-width');
    expect(getByTestId('expiring-column').getAttribute('class')).toContain('asc-columns-full-width');
  });

  it('should render partial width conditional class if one training parameter is 0', async () => {
    const { getByTestId } = await setup(1, 1, 0);

    expect(getByTestId('summary-box').getAttribute('class')).toContain('asc-partial-width');
    expect(getByTestId('missing-column').getAttribute('class')).toContain('asc-columns-partial-width');
    expect(getByTestId('expired-column').getAttribute('class')).toContain('asc-columns-partial-width');
  });

  it('should render partial width conditional class if two training parameters are 0', async () => {
    const { getByTestId } = await setup(1, 0, 0);

    expect(getByTestId('summary-box').getAttribute('class')).toContain('asc-partial-width');
    expect(getByTestId('missing-column').getAttribute('class')).toContain('asc-columns-partial-width');
  });
});
