import { SharedModule } from '@shared/shared.module';
import { SelectSortByComponent } from './select-sort-by.component';
import { render, within } from '@testing-library/angular';
import { SortStaffOptionsForCWPWorkerSummary } from '@core/model/establishment.model';
import userEvent from '@testing-library/user-event';

describe('SelectSortByComponent', () => {
  const setup = async (overrides: any = {}) => {
    const setupTools = await render(SelectSortByComponent, {
      imports: [SharedModule],
      componentInputs: { sortByOptions: SortStaffOptionsForCWPWorkerSummary, ...overrides },
    });

    const component = setupTools.fixture.componentInstance;

    return { ...setupTools, component };
  };
  it('should create', async () => {
    const { component } = await setup();
    expect(component).toBeTruthy();
  });

  it('should show a select element with the given options', async () => {
    const { getByLabelText } = await setup();
    const sortBySelectBox = getByLabelText('Sort by') as HTMLSelectElement;

    const sortByLabels = Object.values(SortStaffOptionsForCWPWorkerSummary);
    sortByLabels.forEach((label) => {
      expect(within(sortBySelectBox).getByText(label)).toBeTruthy();
    });
  });

  it('should have the initialSortByValue pre-selected if it is given', async () => {
    const { getByLabelText } = await setup({ initialSortByValue: 'jobRoleDesc' });
    const sortBySelectBox = getByLabelText('Sort by') as HTMLSelectElement;

    expect(sortBySelectBox.value).toEqual('jobRoleDesc');
  });

  it('should emit onSortChange event when user select an option', async () => {
    const { component, getByLabelText, getByText } = await setup();
    const onSortChangeSpy = spyOn(component.onSortChange, 'emit');

    const sortBySelectBox = getByLabelText('Sort by') as HTMLSelectElement;

    userEvent.selectOptions(sortBySelectBox, getByText('Staff name (Z to A)'));
    expect(onSortChangeSpy).toHaveBeenCalledWith('staffNameDesc');

    userEvent.selectOptions(sortBySelectBox, getByText('Job role (A to Z)'));
    expect(onSortChangeSpy).toHaveBeenCalledWith('jobRoleAsc');
  });
});
