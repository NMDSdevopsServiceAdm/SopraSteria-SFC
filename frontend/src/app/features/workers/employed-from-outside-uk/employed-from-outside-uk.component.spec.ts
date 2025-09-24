import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { getTestBed } from '@angular/core/testing';
import { ReactiveFormsModule, UntypedFormBuilder } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { WorkerService } from '@core/services/worker.service';
import { MockWorkerServiceWithUpdateWorker } from '@core/test-utils/MockWorkerService';
import { SharedModule } from '@shared/shared.module';
import { fireEvent, render } from '@testing-library/angular';

import { EmployedFromOutsideUkComponent } from './employed-from-outside-uk.component';
import { InternationalRecruitmentService } from '@core/services/international-recruitment.service';

describe('EmployedFromOutsideUkComponent', () => {
  async function setup(insideFlow = true) {
    const { fixture, getByText, getAllByText, getByLabelText, getByTestId, queryByTestId } = await render(
      EmployedFromOutsideUkComponent,
      {
        imports: [SharedModule, RouterModule, RouterTestingModule, ReactiveFormsModule],
        providers: [
          UntypedFormBuilder,
          InternationalRecruitmentService,
          {
            provide: WorkerService,
            useClass: MockWorkerServiceWithUpdateWorker,
          },
          {
            provide: ActivatedRoute,
            useValue: {
              parent: {
                snapshot: {
                  data: {
                    establishment: { uid: 'mocked-uid' },
                  },
                  url: [{ path: insideFlow ? 'staff-uid' : 'staff-record-summary' }],
                },
              },
              snapshot: {
                params: {},
              },
            },
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
      router,
      getByText,
      getAllByText,
      getByLabelText,
      getByTestId,
      queryByTestId,
      routerSpy,
    };
  }

  it('should render the SocialCareQualificationComponent', async () => {
    const { component } = await setup();
    expect(component).toBeTruthy();
  });

  it('should render the reveal', async () => {
    const { getByTestId } = await setup();

    const reveal = getByTestId('reveal-WhyWeAsk');

    expect(reveal).toBeTruthy();
  });

  describe('Progress bar', () => {
    it('should render the staff record progress bar when in add staff record flow', async () => {
      const { getByTestId } = await setup();

      expect(getByTestId('progress-bar')).toBeTruthy();
    });

    it('should not render the progress bars when accessed from outside the flow', async () => {
      const { queryByTestId } = await setup(false);

      expect(queryByTestId('progress-bar')).toBeFalsy();
    });
  });

  describe('Submit buttons', () => {
    it(`should show 'Save and continue' cta button and 'View this staff record' link, if a return url is not provided`, async () => {
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

  describe('Navigation', () => {
    describe('Inside flow', () => {
      const testCases = ['Outside the UK', 'Inside the UK', 'I do not know'];
      for (let radioButton of testCases) {
        it(`should navigate to main-job-start-date page when '${radioButton}' is selected`, async () => {
          const { component, fixture, routerSpy, getByText, getByLabelText } = await setup();

          const radioButtonNo = getByLabelText(radioButton);
          fireEvent.click(radioButtonNo);

          fixture.detectChanges();

          const saveButton = getByText('Save and continue');
          fireEvent.click(saveButton);

          expect(routerSpy).toHaveBeenCalledWith([
            '/workplace',
            component.workplace.uid,
            'staff-record',
            component.worker.uid,
            'main-job-start-date',
          ]);
        });
      }

      it('should navigate to main-job-start-date page when you skip the question', async () => {
        const { component, routerSpy, getByText } = await setup();

        const skipButton = getByText('Skip this question');
        fireEvent.click(skipButton);

        expect(routerSpy).toHaveBeenCalledWith([
          '/workplace',
          component.workplace.uid,
          'staff-record',
          component.worker.uid,
          'main-job-start-date',
        ]);
      });
    });

    describe('Outside flow', () => {
      const testCases = ['Outside the UK', 'Inside the UK', 'I do not know'];
      for (let radioButton of testCases) {
        it(`should navigate to staff-summary-page page when pressing 'Save and return' and '${radioButton}' is entered`, async () => {
          const { component, fixture, routerSpy, getByText, getByLabelText } = await setup(false);

          const radioButtonNo = getByLabelText(radioButton);
          fireEvent.click(radioButtonNo);

          fixture.detectChanges();

          const saveButton = getByText('Save and return');
          fireEvent.click(saveButton);

          expect(routerSpy).toHaveBeenCalledWith([
            '/workplace',
            component.workplace.uid,
            'staff-record',
            component.worker.uid,
            'staff-record-summary',
          ]);
        });
      }

      it('should navigate to staff-summary-page page when pressing cancel', async () => {
        const { component, routerSpy, getByText } = await setup(false);

        const cancelButton = getByText('Cancel');
        fireEvent.click(cancelButton);

        expect(routerSpy).toHaveBeenCalledWith([
          '/workplace',
          component.workplace.uid,
          'staff-record',
          component.worker.uid,
          'staff-record-summary',
        ]);
      });
    });

    describe('funding view', () => {
      const setupForWdfView = async () => {
        const { component, fixture, routerSpy, getByText, getByLabelText, router } = await setup(false);

        spyOnProperty(router, 'url').and.returnValue('/funding/staff-record');
        component.returnUrl = undefined;
        component.ngOnInit();
        fixture.detectChanges();
        const workerId = component.worker.uid;

        return { component, fixture, routerSpy, getByText, getByLabelText, router, workerId };
      };

      it('should navigate to funding staff-summary-page page when pressing save and Yes is entered', async () => {
        const { fixture, routerSpy, getByText, getByLabelText, workerId } = await setupForWdfView();

        const radioButtonNo = getByLabelText('Outside the UK');
        fireEvent.click(radioButtonNo);

        fixture.detectChanges();

        const saveButton = getByText('Save and return');
        fireEvent.click(saveButton);

        expect(routerSpy).toHaveBeenCalledWith(['/funding', 'staff-record', workerId]);
      });

      it('should navigate to funding staff-summary-page page when pressing cancel in funding version of page', async () => {
        const { routerSpy, getByText, workerId } = await setupForWdfView();

        const cancelButton = getByText('Cancel');
        fireEvent.click(cancelButton);

        expect(routerSpy).toHaveBeenCalledWith(['/funding', 'staff-record', workerId]);
      });
    });
  });
});