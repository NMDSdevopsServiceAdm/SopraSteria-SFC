import lodash from 'lodash';

import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ReactiveFormsModule, UntypedFormBuilder } from '@angular/forms';
import { StarterLeaverVacancy } from '@core/model/establishment.model';
import { SharedModule } from '@shared/shared.module';
import { render } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';

import { JobRoleNumbersTableComponent } from './job-role-numbers-table.component';

describe('JobRolesNumberTableComponent', () => {
  const mockSelectedJobRoles: StarterLeaverVacancy[] = [
    {
      jobId: 10,
      title: 'Care worker',
      total: 2,
    },
    {
      jobId: 23,
      title: 'Registered nurse',
      total: 3,
    },
  ];
  const totalNumberAtStart = lodash.sum(mockSelectedJobRoles.map((job) => job.total));

  const setup = async (override: any = {}) => {
    const { tableTitle, addJobRoleButtonText, totalNumberDescription, messageWhenNoJobRoleSelected } = override;
    const selectedJobRoles: StarterLeaverVacancy[] = override.selectedJobRoles ?? [...mockSelectedJobRoles];
    const allowRemoveJobRole = override.allowRemoveJobRole ?? true;

    const formBuilder = new UntypedFormBuilder();
    const jobRoleNumbers = formBuilder.array(
      selectedJobRoles.map((job) => job.total),
      { updateOn: 'submit', validators: [] },
    );

    const setupTools = await render(JobRoleNumbersTableComponent, {
      imports: [SharedModule, ReactiveFormsModule, HttpClientTestingModule],
      providers: [],
      componentProperties: {
        jobRoleNumbers,
        selectedJobRoles,
        tableTitle,
        addJobRoleButtonText,
        totalNumberDescription,
        allowRemoveJobRole,
        messageWhenNoJobRoleSelected,
      },
    });

    const component = setupTools.fixture.componentInstance;

    return { ...setupTools, component };
  };

  it('should create', async () => {
    const { component } = await setup();
    expect(component).toBeTruthy();
  });

  it('should show the table title', async () => {
    const { getByText } = await setup({ tableTitle: 'Starters in the last 12 months' });
    expect(getByText('Starters in the last 12 months')).toBeTruthy();
  });

  describe('add job role', () => {
    it('should show an add job role button with the given text', async () => {
      const { getByRole } = await setup({ addJobRoleButtonText: 'Add more job roles' });
      expect(getByRole('button', { name: 'Add more job roles' })).toBeTruthy();
    });

    it('should call addJobRole when add job role button is clicked', async () => {
      const { component, fixture, getByRole } = await setup({ addJobRoleButtonText: 'Add more job roles' });
      const addJobRoleButton = spyOn(component.addJobRole, 'emit');

      userEvent.click(getByRole('button', { name: 'Add more job roles' }));
      fixture.detectChanges();

      expect(addJobRoleButton).toHaveBeenCalled();
    });
  });

  describe('total number', () => {
    it('should show a total number and a description', async () => {
      const { getByText, getByTestId } = await setup({ totalNumberDescription: 'Total number of leavers' });

      const totalNumberDescription = getByText('Total number of leavers');

      expect(totalNumberDescription).toBeTruthy();
      expect(getByTestId('total-number').textContent).toEqual(`${totalNumberAtStart}`);
    });

    it('should display the total number as 0 if no job roles were selected', async () => {
      const { getByTestId } = await setup({ selectedJobRoles: [] });

      expect(getByTestId('total-number').textContent).toEqual('0');
    });
  });

  describe('job role numbers', async () => {
    it('should display a job role input for every selected job roles', async () => {
      const { getByLabelText } = await setup();

      mockSelectedJobRoles.forEach((jobRole) => {
        const jobRoleInput = getByLabelText(jobRole.title) as HTMLInputElement;
        expect(jobRoleInput).toBeTruthy();
        expect(jobRoleInput.value).toEqual(`${jobRole.total}`);
      });
    });

    it('should increase the selected job number when "+" is clicked', async () => {
      const { getByLabelText, getByTestId, fixture } = await setup();

      const plusButton = getByTestId('plus-button-job-0');

      const jobRoleInput = getByLabelText(mockSelectedJobRoles[0].title) as HTMLInputElement;
      expect(jobRoleInput.value).toBe(`${mockSelectedJobRoles[0].total}`);

      userEvent.click(plusButton);
      fixture.detectChanges();

      expect(jobRoleInput.value).toBe(`${mockSelectedJobRoles[0].total + 1}`);
      expect(getByTestId('total-number').textContent).toEqual(`${totalNumberAtStart + 1}`);
    });

    it('should decrease the selected job number when "-" is clicked', async () => {
      const { getByLabelText, getByTestId, fixture } = await setup();

      const minusButton = getByTestId('minus-button-job-0');

      const jobRoleInput = getByLabelText(mockSelectedJobRoles[0].title) as HTMLInputElement;
      expect(jobRoleInput.value).toBe(`${mockSelectedJobRoles[0].total}`);

      userEvent.click(minusButton);
      fixture.detectChanges();

      expect(jobRoleInput.value).toBe(`${mockSelectedJobRoles[0].total - 1}`);
      expect(getByTestId('total-number').textContent).toEqual(`${totalNumberAtStart - 1}`);
    });

    it('should update the total number when user changed a job role number', async () => {
      const { getByLabelText, getByTestId, fixture } = await setup();

      const jobRoleInput = getByLabelText(mockSelectedJobRoles[0].title) as HTMLInputElement;

      userEvent.clear(jobRoleInput);
      userEvent.type(jobRoleInput, '10');
      fixture.detectChanges();

      const expectedNewTotalNumber = 10 + mockSelectedJobRoles[1].total;

      expect(getByTestId('total-number').textContent).toEqual(`${expectedNewTotalNumber}`);
    });

    it('should ignore any invalid input when calculating the total number', async () => {
      const { getByLabelText, getByTestId, fixture } = await setup();

      const jobRoleInput = getByLabelText(mockSelectedJobRoles[0].title) as HTMLInputElement;

      userEvent.clear(jobRoleInput);
      userEvent.type(jobRoleInput, 'not a number');
      fixture.detectChanges();

      const expectedNewTotalNumber = mockSelectedJobRoles[1].total;

      expect(getByTestId('total-number').textContent).toEqual(`${expectedNewTotalNumber}`);
    });

    it('should show a given messageWhenNoJobRoleSelected if no job role selected', async () => {
      const messageWhenNoJobRoleSelected = "You've not added any staff who've started since 15 April 2024.";
      const { getByText } = await setup({
        selectedJobRoles: [],
        messageWhenNoJobRoleSelected,
      });

      expect(getByText(messageWhenNoJobRoleSelected)).toBeTruthy();
    });

    it('should not show the message if some job roles were selected', async () => {
      const messageWhenNoJobRoleSelected = "You've not added any staff who've started since 15 April 2024.";
      const { queryByText } = await setup({
        selectedJobRoles: mockSelectedJobRoles,
        messageWhenNoJobRoleSelected,
      });

      expect(queryByText(messageWhenNoJobRoleSelected)).toBeFalsy();
    });
  });

  describe('remove buttons', async () => {
    it('should show an remove button for each job role', async () => {
      const { getAllByText } = await setup();

      expect(getAllByText('Remove')).toHaveSize(mockSelectedJobRoles.length);
    });

    it('should not show remove buttons if allowRemoveJobRole is given as false', async () => {
      const { queryAllByText } = await setup({ allowRemoveJobRole: false });

      expect(queryAllByText('Remove')).toHaveSize(0);
    });

    it('should call removeJobRole with the job role index when a remove button is clicked', async () => {
      const { component, fixture, getAllByText } = await setup();
      const removeJobRoleSpy = spyOn(component.removeJobRole, 'emit');

      userEvent.click(getAllByText('Remove')[1]);

      fixture.detectChanges();

      expect(removeJobRoleSpy).toHaveBeenCalledWith(1);
    });

    it('should update the total number when a job role is removed', async () => {
      const { component, fixture, getByTestId, getAllByText } = await setup();

      const removeJobRoleSpy = spyOn(component.removeJobRole, 'emit');
      removeJobRoleSpy.and.callFake((index) => {
        component.selectedJobRoles.splice(index, 1);
        component.jobRoleNumbers.removeAt(index);
      });

      userEvent.click(getAllByText('Remove')[1]);
      fixture.detectChanges();

      expect(getByTestId('total-number').textContent).toEqual(`${mockSelectedJobRoles[0].total}`);

      userEvent.click(getAllByText('Remove')[0]);
      fixture.detectChanges();

      expect(getByTestId('total-number').textContent).toEqual('0');
    });
  });
});
