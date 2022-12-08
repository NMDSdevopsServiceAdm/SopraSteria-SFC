import { HttpClientTestingModule } from '@angular/common/http/testing';
import { getTestBed } from '@angular/core/testing';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { WorkerService } from '@core/services/worker.service';
import { MockWorkerServiceWithUpdateWorker } from '@core/test-utils/MockWorkerService';
import { SharedModule } from '@shared/shared.module';
import { fireEvent, render } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';

import { YearArrivedUkComponent } from './year-arrived-uk.component';

describe('YearArrivedUkComponent', () => {
  async function setup(insideFlow = true) {
    const { fixture, getByText, getAllByText, getByLabelText, getByTestId, queryByTestId } = await render(
      YearArrivedUkComponent,
      {
        imports: [SharedModule, RouterModule, RouterTestingModule, HttpClientTestingModule, ReactiveFormsModule],
        providers: [
          FormBuilder,
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
            },
          },

          {
            provide: WorkerService,
            useClass: MockWorkerServiceWithUpdateWorker,
          },
        ],
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

  describe('navigation', () => {
    it('should navigate to main-job-start-date page when submitting from flow', async () => {
      const { component, routerSpy, getByText } = await setup();

      const workerId = component.worker.uid;
      const workplaceId = component.workplace.uid;

      const saveButton = getByText('Save and continue');
      fireEvent.click(saveButton);

      expect(getByText('Save and continue')).toBeTruthy();

      expect(routerSpy).toHaveBeenCalledWith([
        '/workplace',
        workplaceId,
        'staff-record',
        workerId,
        'main-job-start-date',
      ]);
    });

    it('should navigate to main-job-start-date page when skipping the question in the flow', async () => {
      const { component, routerSpy, getByText } = await setup();

      const workerId = component.worker.uid;
      const workplaceId = component.workplace.uid;

      const link = getByText('Skip this question');
      fireEvent.click(link);

      expect(routerSpy).toHaveBeenCalledWith([
        '/workplace',
        workplaceId,
        'staff-record',
        workerId,
        'main-job-start-date',
      ]);
    });

    it('should navigate to staff-summary-page page when pressing view this staff record', async () => {
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

    it('should navigate to staff-summary-page page when pressing save and return', async () => {
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

    it('should navigate to staff-summary-page page when pressing cancel', async () => {
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
