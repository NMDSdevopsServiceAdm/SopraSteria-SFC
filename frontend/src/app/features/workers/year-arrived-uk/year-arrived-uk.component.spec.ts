import { provideHttpClient } from '@angular/common/http';
import { HttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { getTestBed } from '@angular/core/testing';
import { ReactiveFormsModule, UntypedFormBuilder } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { Worker } from '@core/model/worker.model';
import { InternationalRecruitmentService } from '@core/services/international-recruitment.service';
import { WorkerService } from '@core/services/worker.service';
import { MockWorkerServiceWithUpdateWorker, workerBuilder } from '@core/test-utils/MockWorkerService';
import { SharedModule } from '@shared/shared.module';
import { fireEvent, render } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';

import { YearArrivedUkComponent } from './year-arrived-uk.component';

describe('YearArrivedUkComponent', () => {
  async function setup(insideFlow = true, workerFields = {}) {
    const { fixture, getByText, getAllByText, getByLabelText, getByTestId, queryByTestId } = await render(
      YearArrivedUkComponent,
      {
        imports: [SharedModule, RouterModule, RouterTestingModule, ReactiveFormsModule],
        providers: [
          UntypedFormBuilder,
          InternationalRecruitmentService,
          {
            provide: ActivatedRoute,
            useValue: {
              parent: {
                snapshot: {
                  url: [{ path: insideFlow ? 'staff-uid' : 'staff-record-summary' }],
                  data: {
                    establishment: { uid: 'mocked-uid' },
                    primaryWorkplace: {},
                  },
                },
              },
              snapshot: {
                params: {},
              },
            },
          },

          {
            provide: WorkerService,
            useFactory: MockWorkerServiceWithUpdateWorker.factory({ ...workerBuilder(), ...workerFields } as Worker),
            deps: [HttpClient],
          },
        provideHttpClient(), provideHttpClientTesting(),],
      },
    );

    const injector = getTestBed();

    const component = fixture.componentInstance;
    const router = injector.inject(Router) as Router;

    const routerSpy = spyOn(router, 'navigate').and.returnValue(Promise.resolve(true));

    return {
      component,
      fixture,
      routerSpy,
      router,
      getByText,
      getAllByText,
      getByLabelText,
      getByTestId,
      queryByTestId,
    };
  }

  it('should render the YearArrivedUkComponent', async () => {
    const { component } = await setup();
    expect(component).toBeTruthy();
  });

  describe('submit buttons', () => {
    it(`should show 'Save and continue' cta button, skip this question  and 'View this staff record' link, if a return url is not provided`, async () => {
      const { getByText } = await setup();

      expect(getByText('Save and continue')).toBeTruthy();
      expect(getByText('Skip this question')).toBeTruthy();
      expect(getByText('View this staff record')).toBeTruthy();
    });

    it(`should show 'Save and return' cta button and 'Cancel' link if a return url is provided`, async () => {
      const { getByText } = await setup(false);

      expect(getByText('Save and return')).toBeTruthy();
      expect(getByText('Cancel')).toBeTruthy();
    });
  });

  describe('progress bar', () => {
    it('should render the workplace progress bar', async () => {
      const { getByTestId } = await setup();

      expect(getByTestId('progress-bar')).toBeTruthy();
    });

    it('should not render the progress bars when accessed from outside the flow', async () => {
      const { queryByTestId } = await setup(false);

      expect(queryByTestId('progress-bar')).toBeFalsy();
    });
  });

  describe('should navigate to ', () => {
    ['Save and continue', 'Skip this question'].forEach((button) => {
      it(`health-and-care-visa page when other nationality, British citizenship not known and '${button}' clicked`, async () => {
        const workerFields = {
          nationality: { value: 'Other' },
          britishCitizenship: 'No',
        };

        const { component, fixture, getByText, getByLabelText, routerSpy } = await setup(true, workerFields);

        fireEvent.click(getByText(button));
        fixture.detectChanges();

        expect(routerSpy).toHaveBeenCalledWith([
          '/workplace',
          component.workplace.uid,
          'staff-record',
          component.worker.uid,
          'health-and-care-visa',
        ]);
      });

      it(`health-and-care-visa page when worker nationality not known and not British citizen and '${button}' clicked`, async () => {
        const workerFields = {
          nationality: { value: "Don't know" },
          britishCitizenship: 'No',
        };

        const { component, fixture, getByText, routerSpy } = await setup(true, workerFields);

        fireEvent.click(getByText(button));
        fixture.detectChanges();

        expect(routerSpy).toHaveBeenCalledWith([
          '/workplace',
          component.workplace.uid,
          'staff-record',
          component.worker.uid,
          'health-and-care-visa',
        ]);
      });
    });

    ['Save and continue', 'Skip this question'].forEach((button) => {
      it(`main-job-start-date page when in flow, should not see health and care visa page and '${button}' clicked`, async () => {
        const { component, routerSpy, getByText } = await setup();

        const workerId = component.worker.uid;
        const workplaceId = component.workplace.uid;

        fireEvent.click(getByText(button));

        expect(routerSpy).toHaveBeenCalledWith([
          '/workplace',
          workplaceId,
          'staff-record',
          workerId,
          'main-job-start-date',
        ]);
      });
    });

    it('staff-summary-page page when pressing view this staff record', async () => {
      const { component, routerSpy, getByText } = await setup();

      const workerId = component.worker.uid;
      const workplaceId = component.workplace.uid;

      const link = getByText('View this staff record');
      fireEvent.click(link);

      expect(routerSpy).toHaveBeenCalledWith([
        '/workplace',
        workplaceId,
        'staff-record',
        workerId,
        'staff-record-summary',
      ]);
    });

    it('staff-summary-page page when pressing save and return', async () => {
      const { component, routerSpy, getByText } = await setup(false);

      const workerId = component.worker.uid;
      const workplaceId = component.workplace.uid;

      const saveButton = getByText('Save and return');
      fireEvent.click(saveButton);

      expect(routerSpy).toHaveBeenCalledWith([
        '/workplace',
        workplaceId,
        'staff-record',
        workerId,
        'staff-record-summary',
      ]);
    });

    it('staff-summary-page page when pressing cancel', async () => {
      const { component, routerSpy, getByText } = await setup(false);

      const workerId = component.worker.uid;
      const workplaceId = component.workplace.uid;

      const link = getByText('Cancel');
      fireEvent.click(link);

      expect(routerSpy).toHaveBeenCalledWith([
        '/workplace',
        workplaceId,
        'staff-record',
        workerId,
        'staff-record-summary',
      ]);
    });

    it('funding staff-summary-page page when pressing save and return in funding version of page', async () => {
      const { component, routerSpy, getByText, fixture, router } = await setup(false);
      spyOnProperty(router, 'url').and.returnValue('/funding/staff-record');
      component.returnUrl = undefined;
      component.ngOnInit();
      fixture.detectChanges();
      const workerId = component.worker.uid;

      const saveButton = getByText('Save and return');
      fireEvent.click(saveButton);

      expect(routerSpy).toHaveBeenCalledWith(['/funding', 'staff-record', workerId]);
    });

    it('funding staff-summary-page page when pressing cancel in funding version of page', async () => {
      const { component, routerSpy, getByText, fixture, router } = await setup(false);
      spyOnProperty(router, 'url').and.returnValue('/funding/staff-record');
      component.returnUrl = undefined;
      component.ngOnInit();
      fixture.detectChanges();
      const workerId = component.worker.uid;

      const link = getByText('Cancel');
      fireEvent.click(link);

      expect(routerSpy).toHaveBeenCalledWith(['/funding', 'staff-record', workerId]);
    });
  });

  describe('error messages', () => {
    it('should show an error if yes radio is selected and the input is not entered on submit', async () => {
      const { fixture, getByLabelText, getByText, getAllByText } = await setup();

      const yesRadio = getByLabelText('Yes');
      fireEvent.click(yesRadio);

      const submitButton = getByText('Save and continue');
      fireEvent.click(submitButton);
      fixture.detectChanges();

      const errorMessages = getAllByText('Enter the year');
      expect(errorMessages.length).toEqual(2);
    });

    it('should show an error if yes radio is selected and the input is text when submitted', async () => {
      const { fixture, getByLabelText, getByText, getAllByText } = await setup();

      const yesRadio = getByLabelText('Yes');
      fireEvent.click(yesRadio);

      const inputString = 'ABC';
      const yearInput = getByLabelText('Year');
      userEvent.type(yearInput, inputString);

      const submitButton = getByText('Save and continue');
      fireEvent.click(submitButton);
      fixture.detectChanges();

      const errorMessages = getAllByText('Enter a valid year, like 2021');
      expect(errorMessages.length).toEqual(2);
    });

    it('should show an error if yes radio is selected and the input is a year more than 100 years ago when submitted', async () => {
      const { fixture, getByLabelText, getByText, getAllByText } = await setup();

      const yesRadio = getByLabelText('Yes');
      fireEvent.click(yesRadio);

      const inputvalue = '1';
      const yearInput = getByLabelText('Year');
      userEvent.type(yearInput, inputvalue);

      const submitButton = getByText('Save and continue');
      fireEvent.click(submitButton);
      fixture.detectChanges();

      const errorMessages = getAllByText('Year cannot be more than 100 years ago');
      expect(errorMessages.length).toEqual(2);
    });

    it('should show an error if yes radio is selected and the input is a year in the future when submitted', async () => {
      const { fixture, getByLabelText, getByText, getAllByText } = await setup();

      const yesRadio = getByLabelText('Yes');
      fireEvent.click(yesRadio);

      const inputvalue = '9999';
      const yearInput = getByLabelText('Year');
      userEvent.type(yearInput, inputvalue);

      const submitButton = getByText('Save and continue');
      fireEvent.click(submitButton);
      fixture.detectChanges();

      const errorMessages = getAllByText('Year cannot be in the future');
      expect(errorMessages.length).toEqual(2);
    });
  });
});