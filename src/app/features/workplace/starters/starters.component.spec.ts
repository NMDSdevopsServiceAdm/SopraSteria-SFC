import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { EstablishmentService } from '@core/services/establishment.service';
import { MockEstablishmentService } from '@core/test-utils/MockEstablishmentService';
import { SharedModule } from '@shared/shared.module';
import { fireEvent, render } from '@testing-library/angular';

import { StartersComponent } from './starters.component';

describe('StartersComponent', () => {
  async function setup(returnUrl = true, starters = undefined) {
    const { fixture, getByText, getAllByText, getByLabelText, getByTestId, queryByText, queryAllByText } = await render(
      StartersComponent,
      {
        imports: [SharedModule, RouterModule, RouterTestingModule, HttpClientTestingModule, ReactiveFormsModule],
        providers: [
          FormBuilder,
          {
            provide: EstablishmentService,
            useFactory: MockEstablishmentService.factory({ cqc: null, localAuthorities: null }, returnUrl, {
              starters,
            }),
          },
          {
            provide: ActivatedRoute,
            useValue: {
              snapshot: {
                data: {
                  jobs: [
                    {
                      id: 0,
                      title: 'Job0',
                    },
                    {
                      id: 1,
                      title: 'Job1',
                    },
                    {
                      id: 2,
                      title: 'Job2',
                    },
                    {
                      id: 3,
                      title: 'Job3',
                      other: true,
                    },
                  ],
                },
              },
            },
          },
        ],
      },
    );

    const component = fixture.componentInstance;
    const establishmentService = TestBed.inject(EstablishmentService) as EstablishmentService;
    const establishmentServiceSpy = spyOn(establishmentService, 'updateJobs').and.callThrough();
    const router = TestBed.inject(Router) as Router;
    const routerSpy = spyOn(router, 'navigate').and.returnValue(Promise.resolve(true));

    return {
      component,
      fixture,
      getByText,
      getAllByText,
      getByLabelText,
      getByTestId,
      queryByText,
      queryAllByText,
      establishmentService,
      establishmentServiceSpy,
      routerSpy,
    };
  }

  it('should render the Starters component', async () => {
    const { component } = await setup();
    expect(component).toBeTruthy();
  });

  it('should display no starters and do not know radio buttons', async () => {
    const { getByLabelText } = await setup();

    expect(getByLabelText('There have been no new starters in the last 12 months')).toBeTruthy();
    expect(getByLabelText('I do not know how many new starters there have been')).toBeTruthy();
  });

  it('should add another input when row when the add another job role button is clicked', async () => {
    const { fixture, getByText, getByTestId } = await setup();

    const button = getByText('Add another job role');
    fireEvent.click(button);
    fixture.detectChanges();

    const firstInputRow = getByTestId('row-0');
    const secondInputRow = getByTestId('row-1');

    expect(firstInputRow).toBeTruthy();
    expect(firstInputRow.innerHTML).toContain('Job role 1');
    expect(secondInputRow).toBeTruthy();
    expect(secondInputRow.innerHTML).toContain('Job role 2');
  });

  it('should not show the add another job button when there are there are starters for all available jobs', async () => {
    const { component, fixture, getByText, queryByText } = await setup();

    const button = getByText('Add another job role');
    const jobsArr = component.jobs;
    jobsArr.forEach(() => fireEvent.click(button));
    fixture.detectChanges();

    expect(queryByText('Add another job role')).toBeFalsy();
  });

  it('should prefill the form if the establishment has a list of job roles and number of starters', async () => {
    const starters = [{ jobId: 0, jobTitle: 'Job0', total: 3 }];
    const { component, getByTestId } = await setup(true, starters);

    const inputRow = getByTestId('row-0');
    expect(inputRow.innerHTML).toContain('Job0');
    expect(inputRow.innerHTML).toContain('3');
    expect(component.form.value).toEqual({ starterRecords: [{ jobRole: 0, total: 3 }], noRecordsReason: null });
  });

  it('should select the radio button', async () => {
    const starters = 'None';
    const { component, fixture } = await setup(true, starters);

    const radioButton = fixture.nativeElement.querySelector('input[id="noRecordsReason-0"]');
    expect(radioButton.checked).toBeTruthy();
    expect(component.form.value).toEqual({ starterRecords: [{ jobRole: null, total: null }], noRecordsReason: 'None' });
  });

  describe('Submit buttons and submitting form', () => {
    it('should display Save and continue button and View workplace details link when returnTo not set in establishmentService', async () => {
      const { getByText } = await setup(false);

      expect(getByText('Save and continue')).toBeTruthy();
      expect(getByText('View workplace details')).toBeTruthy();
    });

    it('should call updatedJobs when submitting form with job role and number of starters filled out', async () => {
      const { component, fixture, getByText, establishmentServiceSpy } = await setup(false);

      component.form.get('starterRecords').setValue([{ jobRole: 1, total: 1 }]);

      const button = getByText('Save and continue');
      fireEvent.click(button);
      fixture.detectChanges();

      expect(establishmentServiceSpy).toHaveBeenCalledWith('mocked-uid', {
        starters: [{ jobId: 1, total: 1 }],
      });
    });

    it('should call updatedJobs when submitting form with multiple job roles and number of starters filled out', async () => {
      const { component, fixture, getByText, establishmentServiceSpy } = await setup(false);

      const addRoleButton = getByText('Add another job role');
      fireEvent.click(addRoleButton);
      fixture.detectChanges();

      component.form.get('starterRecords').setValue([
        { jobRole: 1, total: 1 },
        { jobRole: 2, total: 8 },
      ]);

      const button = getByText('Save and continue');
      fireEvent.click(button);
      fixture.detectChanges();

      expect(establishmentServiceSpy).toHaveBeenCalledWith('mocked-uid', {
        starters: [
          { jobId: 1, total: 1 },
          { jobId: 2, total: 8 },
        ],
      });
    });

    it('should call updatedJobs when submitting form with radio button value', async () => {
      const { component, fixture, getByText, establishmentServiceSpy } = await setup(false);

      component.form.get('noRecordsReason').setValue('None');

      const button = getByText('Save and continue');
      fireEvent.click(button);
      fixture.detectChanges();

      expect(establishmentServiceSpy).toHaveBeenCalledWith('mocked-uid', {
        starters: 'None',
      });
    });

    it('should navigate to the leavers page when submitting from the flow', async () => {
      const { component, fixture, getByText, routerSpy } = await setup(false);

      component.form.get('noRecordsReason').setValue('None');

      const button = getByText('Save and continue');
      fireEvent.click(button);
      fixture.detectChanges();

      expect(routerSpy).toHaveBeenCalledWith(['/workplace', 'mocked-uid', 'leavers']);
    });

    it('should navigate to the check-anwsers page when clicking view workplace details link', async () => {
      const { component, fixture, getByText, routerSpy } = await setup(false);

      component.form.get('noRecordsReason').setValue('None');

      const link = getByText('View workplace details');
      fireEvent.click(link);
      fixture.detectChanges();

      expect(routerSpy).toHaveBeenCalledWith(['/workplace', 'mocked-uid', 'check-answers']);
    });

    it('should display Save and return button and Cancel link when returnTo set in establishmentService', async () => {
      const { getByText } = await setup();

      expect(getByText('Save and return')).toBeTruthy();
      expect(getByText('Cancel')).toBeTruthy();
    });

    it('should navigate to the summary page when submitting', async () => {
      const { component, fixture, getByText, routerSpy } = await setup();

      component.form.get('noRecordsReason').setValue('None');

      const button = getByText('Save and return');
      fireEvent.click(button);
      fixture.detectChanges();

      expect(routerSpy).toHaveBeenCalledWith(['/dashboard'], { fragment: 'workplace', queryParams: undefined });
    });

    it('should navigte to the correct page when clicking the cancel link', async () => {
      const { component, fixture, getByText, routerSpy } = await setup();

      component.form.get('noRecordsReason').setValue('None');

      const link = getByText('Cancel');
      fireEvent.click(link);
      fixture.detectChanges();

      expect(routerSpy).toHaveBeenCalledWith(['/dashboard'], { fragment: 'workplace', queryParams: undefined });
    });
  });

  describe('errors', () => {
    it('should show an error if the job role and number of starters are not filled in, and neither radio button has been selected', async () => {
      const { fixture, getByText, getAllByText } = await setup();

      const button = getByText('Save and return');
      fireEvent.click(button);
      fixture.detectChanges();

      const errorMessages = getAllByText(
        'Select the job role and enter the number of starters, or tell us there are none',
      );
      expect(errorMessages.length).toEqual(2);
    });

    it('should show an error if the job role is not filled in but the number of starters is, and neither radio button has been selected', async () => {
      const { component, fixture, getByText, queryByText } = await setup();

      component.form.get('starterRecords').setValue([{ jobRole: null, total: 1 }]);

      const button = getByText('Save and return');
      fireEvent.click(button);
      fixture.detectChanges();

      expect(getByText('Select the job role (job role 1)')).toBeTruthy();
      expect(getByText('Select the job role')).toBeTruthy();
      expect(queryByText('Enter the number of new starters (job role 1)')).toBeFalsy();
      expect(queryByText('Enter the number of new starters')).toBeFalsy();
    });

    it('should show an error if the number of starters is not filled in but the job role is, and neither radio button has been selected', async () => {
      const { component, fixture, getByText, queryByText } = await setup();

      component.form.get('starterRecords').setValue([{ jobRole: 0, total: null }]);

      const button = getByText('Save and return');
      fireEvent.click(button);
      fixture.detectChanges();

      expect(getByText('Enter the number of new starters (job role 1)')).toBeTruthy();
      expect(getByText('Enter the number of new starters')).toBeTruthy();
      expect(queryByText('Select the job role (job role 1)')).toBeFalsy();
      expect(queryByText('Select the job role')).toBeFalsy();
    });

    it('should show an error if the job role and number of starters is filled in but the starters is 0', async () => {
      const { component, fixture, getByText } = await setup();

      component.form.get('starterRecords').setValue([{ jobRole: 0, total: 0 }]);

      const button = getByText('Save and return');
      fireEvent.click(button);
      fixture.detectChanges();

      expect(getByText('Number must be between 1 and 999 (job role 1)')).toBeTruthy();
      expect(getByText('Number must be between 1 and 999')).toBeTruthy();
    });

    it('should show an error if the job role and number of starters is filled in but the starters is negative', async () => {
      const { component, fixture, getByText } = await setup();

      component.form.get('starterRecords').setValue([{ jobRole: 'Job0', total: -1 }]);

      const button = getByText('Save and return');
      fireEvent.click(button);
      fixture.detectChanges();

      expect(getByText('Number must be between 1 and 999 (job role 1)')).toBeTruthy();
      expect(getByText('Number must be between 1 and 999')).toBeTruthy();
    });

    it('should show an error if the job role and number of starters is filled in but the starters is greater than the max allowed number', async () => {
      const { component, fixture, getByText } = await setup();

      component.form.get('starterRecords').setValue([{ jobRole: 0, total: 1000 }]);

      const button = getByText('Save and return');
      fireEvent.click(button);
      fixture.detectChanges();

      expect(getByText('Number must be between 1 and 999 (job role 1)')).toBeTruthy();
      expect(getByText('Number must be between 1 and 999')).toBeTruthy();
    });

    it('should remove any error messages when the add another job role button is clicked', async () => {
      const { component, fixture, getByText, queryByText } = await setup();

      component.form.get('starterRecords').setValue([{ jobRole: null, total: 1 }]);

      const saveButton = getByText('Save and return');
      fireEvent.click(saveButton);
      fixture.detectChanges();

      expect(getByText('Select the job role (job role 1)')).toBeTruthy();
      expect(getByText('Select the job role')).toBeTruthy();

      const addJobButton = getByText('Add another job role');
      fireEvent.click(addJobButton);
      fixture.detectChanges();

      expect(queryByText('Select the job role (job role 1)')).toBeFalsy();
      expect(queryByText('Select the job role')).toBeFalsy();
    });
  });
});
