import { HttpClient } from '@angular/common/http';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { getTestBed } from '@angular/core/testing';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { EstablishmentService } from '@core/services/establishment.service';
import { MockEstablishmentService } from '@core/test-utils/MockEstablishmentService';
import { SharedModule } from '@shared/shared.module';
import { fireEvent, render } from '@testing-library/angular';

import { LeaversComponent } from './leavers.component';

describe('LeaversComponent', () => {
  async function setup(returnUrl = true, leavers = undefined) {
    const {
      fixture,
      getByText,
      getAllByText,
      getByLabelText,
      getByTestId,
      queryByText,
      queryAllByText,
      queryByTestId,
    } = await render(LeaversComponent, {
      imports: [SharedModule, RouterModule, RouterTestingModule, HttpClientTestingModule, ReactiveFormsModule],
      providers: [
        FormBuilder,
        {
          provide: EstablishmentService,
          useFactory: MockEstablishmentService.factory({ cqc: null, localAuthorities: null }, returnUrl, {
            leavers,
          }),
          deps: [HttpClient],
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
    });

    const component = fixture.componentInstance;

    const injector = getTestBed();
    const establishmentService = injector.inject(EstablishmentService) as EstablishmentService;
    const establishmentServiceSpy = spyOn(establishmentService, 'updateJobs').and.callThrough();
    const router = injector.inject(Router) as Router;
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
      queryByTestId,
    };
  }

  it('should render a LeaversComponent', async () => {
    const { component } = await setup();
    expect(component).toBeTruthy();
  });

  it('should render the heading, input and radio buttons', async () => {
    const { getByText, getByLabelText, getByTestId } = await setup();

    const inputRow = getByTestId('row-0');

    expect(getByText('How many staff leavers have you had in the last 12 months?')).toBeTruthy();
    expect(inputRow).toBeTruthy();
    expect(inputRow.innerText).toContain('Job role 1');
    expect(getByText('Add another job role')).toBeTruthy();
    expect(getByText('Total leavers: 0')).toBeTruthy();
    expect(getByLabelText('There have been no leavers in the last 12 months')).toBeTruthy();
    expect(getByLabelText('I do not know how many leavers there have been')).toBeTruthy();
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

  it('should not show the add another job button when there are there are leavers for all available jobs', async () => {
    const { component, fixture, getByText, queryByText } = await setup();

    const button = getByText('Add another job role');
    const jobsArr = component.jobs;
    jobsArr.forEach(() => fireEvent.click(button));
    fixture.detectChanges();

    expect(queryByText('Add another job role')).toBeFalsy();
  });

  it('should prefill the form if the establishment has a list of job roles and number of leavers', async () => {
    const leavers = [{ jobId: 0, jobTitle: 'Job0', total: 3 }];
    const { component, getByTestId } = await setup(true, leavers);

    const inputRow = getByTestId('row-0');
    expect(inputRow.innerHTML).toContain('Job0');
    expect(inputRow.innerHTML).toContain('3');
    expect(component.form.value).toEqual({ leavers: [{ jobRole: 0, total: 3 }], leaversKnown: null });
  });

  it('should select the radio button', async () => {
    const leavers = 'None';
    const { component, fixture } = await setup(true, leavers);

    const radioButton = fixture.nativeElement.querySelector('input[id="leaversKnown-0"]');
    expect(radioButton.checked).toBeTruthy();
    expect(component.form.value).toEqual({ leavers: [{ jobRole: null, total: null }], leaversKnown: 'None' });
  });

  describe('submit buttons and submitting form', () => {
    it(`should show 'Save and continue' cta button and 'Skip this question' link, if a return url is not provided`, async () => {
      const { getByText } = await setup(false);

      expect(getByText('Save and continue')).toBeTruthy();
      expect(getByText('Skip this question')).toBeTruthy();
    });

    it('should call updatedJobs when submitting form with job role and number of leavers filled out', async () => {
      const { component, fixture, getByText, establishmentServiceSpy } = await setup(false);

      component.form.get('leavers').setValue([{ jobRole: 1, total: 1 }]);

      const button = getByText('Save and continue');
      fireEvent.click(button);
      fixture.detectChanges();

      expect(establishmentServiceSpy).toHaveBeenCalledWith('mocked-uid', {
        leavers: [{ jobId: 1, total: 1 }],
      });
    });

    it('should call updatedJobs when submitting form with multiple job roles and number of leavers filled out', async () => {
      const { component, fixture, getByText, establishmentServiceSpy } = await setup(false);

      const addRoleButton = getByText('Add another job role');
      fireEvent.click(addRoleButton);
      fixture.detectChanges();

      component.form.get('leavers').setValue([
        { jobRole: 1, total: 1 },
        { jobRole: 2, total: 8 },
      ]);

      const button = getByText('Save and continue');
      fireEvent.click(button);
      fixture.detectChanges();

      expect(establishmentServiceSpy).toHaveBeenCalledWith('mocked-uid', {
        leavers: [
          { jobId: 1, total: 1 },
          { jobId: 2, total: 8 },
        ],
      });
    });

    it('should call updatedJobs when submitting form with radio button value', async () => {
      const { component, fixture, getByText, establishmentServiceSpy } = await setup(false);

      component.form.get('leaversKnown').setValue('None');

      const button = getByText('Save and continue');
      fireEvent.click(button);
      fixture.detectChanges();

      expect(establishmentServiceSpy).toHaveBeenCalledWith('mocked-uid', {
        leavers: 'None',
      });
    });

    it('should navigate to the recruitment-advertising-cost page when submitting from the flow', async () => {
      const { component, fixture, getByText, routerSpy } = await setup(false);

      component.form.get('leaversKnown').setValue('None');

      const button = getByText('Save and continue');
      fireEvent.click(button);
      fixture.detectChanges();

      expect(routerSpy).toHaveBeenCalledWith(['/workplace', 'mocked-uid', 'recruitment-advertising-cost']);
    });

    it('should navigate to the next page when clicking Skip this question link', async () => {
      const { component, fixture, getByText, routerSpy } = await setup(false);

      component.form.get('leaversKnown').setValue('None');

      const link = getByText('Skip this question');
      fireEvent.click(link);
      fixture.detectChanges();

      expect(routerSpy).toHaveBeenCalledWith(['/workplace', 'mocked-uid', 'recruitment-advertising-cost']);
    });

    it(`should call the setSubmitAction function with an action of skip and save as false when clicking 'Skip this question' link`, async () => {
      const { component, getByText } = await setup(false);

      const setSubmitActionSpy = spyOn(component, 'setSubmitAction').and.callThrough();

      const link = getByText('Skip this question');
      fireEvent.click(link);

      expect(setSubmitActionSpy).toHaveBeenCalledWith({ action: 'skip', save: false });
    });

    it(`should show 'Save and return' cta button and 'Cancel' link if a return url is provided`, async () => {
      const { getByText } = await setup();

      expect(getByText('Save and return')).toBeTruthy();
      expect(getByText('Cancel')).toBeTruthy();
    });

    it('should navigate to the summary page when submitting', async () => {
      const { component, fixture, getByText, routerSpy } = await setup();

      component.form.get('leaversKnown').setValue('None');

      const button = getByText('Save and return');
      fireEvent.click(button);
      fixture.detectChanges();

      expect(routerSpy).toHaveBeenCalledWith(['/dashboard'], { fragment: 'workplace', queryParams: undefined });
    });

    it('should navigte to the correct page when clicking the cancel link', async () => {
      const { component, fixture, getByText, routerSpy } = await setup();

      component.form.get('leaversKnown').setValue('None');

      const link = getByText('Cancel');
      fireEvent.click(link);
      fixture.detectChanges();

      expect(routerSpy).toHaveBeenCalledWith(['/dashboard'], { fragment: 'workplace', queryParams: undefined });
    });
  });

  describe('errors', () => {
    it('should show an error if the job role and number of leavers are not filled in, and neither radio button has been selected', async () => {
      const { fixture, getByText, getAllByText } = await setup();

      const button = getByText('Save and return');
      fireEvent.click(button);
      fixture.detectChanges();

      const errorMessages = getAllByText(
        'Select the job role and enter the number of leavers, or tell us there are none',
      );
      expect(errorMessages.length).toEqual(2);
    });

    it('should show an error if the job role is not filled in but the number of vacanies is, and neither radio button has been selected', async () => {
      const { component, fixture, getByText, queryByText } = await setup();

      component.form.get('leavers').setValue([{ jobRole: null, total: 1 }]);

      const button = getByText('Save and return');
      fireEvent.click(button);
      fixture.detectChanges();

      expect(getByText('Select the job role (job role 1)')).toBeTruthy();
      expect(getByText('Select the job role')).toBeTruthy();
      expect(queryByText('Enter the number of leavers (job role 1)')).toBeFalsy();
      expect(queryByText('Enter the number of leavers')).toBeFalsy();
    });

    it('should show an error if the number of leavers is not filled in but the job role is, and neither radio button has been selected', async () => {
      const { component, fixture, getByText, queryByText } = await setup();

      component.form.get('leavers').setValue([{ jobRole: 0, total: null }]);

      const button = getByText('Save and return');
      fireEvent.click(button);
      fixture.detectChanges();

      expect(getByText('Enter the number of leavers (job role 1)')).toBeTruthy();
      expect(getByText('Enter the number of leavers')).toBeTruthy();
      expect(queryByText('Select the job role (job role 1)')).toBeFalsy();
      expect(queryByText('Select the job role')).toBeFalsy();
    });

    it('should show an error if the job role and number of leavers is filled in but the vacancies is 0', async () => {
      const { component, fixture, getByText } = await setup();

      component.form.get('leavers').setValue([{ jobRole: 0, total: 0 }]);

      const button = getByText('Save and return');
      fireEvent.click(button);
      fixture.detectChanges();

      expect(getByText('Number must be between 1 and 999 (job role 1)')).toBeTruthy();
      expect(getByText('Number must be between 1 and 999')).toBeTruthy();
    });

    it('should show an error if the job role and number of leavers is filled in but the vacancies is negative', async () => {
      const { component, fixture, getByText } = await setup();

      component.form.get('leavers').setValue([{ jobRole: 'Job0', total: -1 }]);

      const button = getByText('Save and return');
      fireEvent.click(button);
      fixture.detectChanges();

      expect(getByText('Number must be between 1 and 999 (job role 1)')).toBeTruthy();
      expect(getByText('Number must be between 1 and 999')).toBeTruthy();
    });

    it('should show an error if the job role and number of leavers is filled in but the vacancies is greater than the max allowed number', async () => {
      const { component, fixture, getByText } = await setup();

      component.form.get('leavers').setValue([{ jobRole: 0, total: 1000 }]);

      const button = getByText('Save and return');
      fireEvent.click(button);
      fixture.detectChanges();

      expect(getByText('Number must be between 1 and 999 (job role 1)')).toBeTruthy();
      expect(getByText('Number must be between 1 and 999')).toBeTruthy();
    });

    it('should remove any error messages when the add another job role button is clicked', async () => {
      const { component, fixture, getByText, queryByText } = await setup();

      component.form.get('leavers').setValue([{ jobRole: null, total: 1 }]);

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

  describe('progress-bar', () => {
    it('should render the section, the question but not the progress bar when not in the flow', async () => {
      const { getByTestId, queryByTestId } = await setup();

      expect(getByTestId('section-heading')).toBeTruthy();
      expect(queryByTestId('progress-bar')).toBeFalsy();
    });

    it('should render the progress bar when in the flow', async () => {
      const { component, fixture, getByTestId } = await setup(false);

      expect(getByTestId('progress-bar')).toBeTruthy();
    });
  });
});
