import { HttpClientTestingModule } from '@angular/common/http/testing';
import { getTestBed } from '@angular/core/testing';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { WorkerService } from '@core/services/worker.service';
import { MockWorkerServiceWithoutReturnUrl, MockWorkerServiceWithUpdateWorker } from '@core/test-utils/MockWorkerService';
import { SharedModule } from '@shared/shared.module';
import { fireEvent, render } from '@testing-library/angular';

import { SocialCareQualificationLevelComponent } from './social-care-qualification-level.component';

describe('SocialCareQualificationLevelComponent', () => {
  async function setup(returnUrl = true) {
    const { fixture, getByText, getAllByText, getByLabelText, getByTestId, queryByTestId } = await render(
      SocialCareQualificationLevelComponent,
      {
        imports: [SharedModule, RouterModule, RouterTestingModule, HttpClientTestingModule, ReactiveFormsModule],
        providers: [
          FormBuilder,
          {
            provide: ActivatedRoute,
            useValue: {
              parent: {
                snapshot: {
                  data: {
                    establishment: { uid: 'mocked-uid' },
                  },
                  url: [{ path: returnUrl ? 'staff-record-summary' : 'mocked-uid' }],
                },
              },
              snapshot: {
                params: {},
              },
            },
          },
          {
            provide: WorkerService,
            useClass: returnUrl ? MockWorkerServiceWithUpdateWorker : MockWorkerServiceWithoutReturnUrl,
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
      router,
      getByText,
      getAllByText,
      getByLabelText,
      getByTestId,
      queryByTestId,
    };
  }

  it('should render the SocialCareQualificationLevelComponent', async () => {
    const { component } = await setup();
    expect(component).toBeTruthy();
  });

  describe('progress bar', () => {
    it('should render the workplace progress bar', async () => {
      const { getByTestId } = await setup(false);

      expect(getByTestId('progress-bar')).toBeTruthy();
    });

    it('should not render the progress bars when accessed from outside the flow', async () => {
      const { queryByTestId } = await setup();

      expect(queryByTestId('progress-bar')).toBeFalsy();
    });
  });

  describe('submit buttons', () => {
    it(`should show 'Save and continue' cta button and 'View this staff record' link, if a return url is not provided`, async () => {
      const { getByText } = await setup(false);

      expect(getByText('Save and continue')).toBeTruthy();
      expect(getByText('Skip this question')).toBeTruthy();
      expect(getByText('View this staff record')).toBeTruthy();
    });

    it(`should show 'Save and return' cta button and 'Cancel' link if a return url is provided`, async () => {
      const { getByText } = await setup();

      expect(getByText('Save and return')).toBeTruthy();
      expect(getByText('Cancel')).toBeTruthy();
    });
  });

  describe('navigation', () => {
    it(`should navigate to other-qualifications page when submitting from flow`, async () => {
      const { component, fixture, routerSpy, getByText } = await setup(false);

      const workerId = component.worker.uid;
      const workplaceId = component.workplace.uid;

      component.form.controls.qualification.setValue('2');
      fixture.detectChanges();

      const saveButton = getByText('Save and continue');
      fireEvent.click(saveButton);

      expect(getByText('Save and continue')).toBeTruthy();

      expect(routerSpy).toHaveBeenCalledWith([
        '/workplace',
        workplaceId,
        'staff-record',
        workerId,
        'other-qualifications',
      ]);
    });

    it('should navigate to other-qualifications page when skipping the question in the flow', async () => {
      const { component, routerSpy, getByText } = await setup(false);

      const workerId = component.worker.uid;
      const workplaceId = component.workplace.uid;

      const skipButton = getByText('Skip this question');
      fireEvent.click(skipButton);

      expect(routerSpy).toHaveBeenCalledWith([
        '/workplace',
        workplaceId,
        'staff-record',
        workerId,
        'other-qualifications',
      ]);
    });

    it('should navigate to staff-summary-page page when pressing save and return', async () => {
      const { component, fixture, routerSpy, getByText } = await setup();

      const workerId = component.worker.uid;
      const workplaceId = component.workplace.uid;

      component.form.controls.qualification.setValue('2');
      fixture.detectChanges();

      const saveButton = getByText('Save and return');
      fireEvent.click(saveButton);

      expect(getByText('Save and return')).toBeTruthy();

      expect(routerSpy).toHaveBeenCalledWith([
        '/workplace',
        workplaceId,
        'staff-record',
        workerId,
        'staff-record-summary',
      ]);
    });

    it('should navigate to staff-summary-page page when pressing cancel', async () => {
      const { component, routerSpy, getByText } = await setup();

      const workerId = component.worker.uid;
      const workplaceId = component.workplace.uid;

      const cancelButton = getByText('Cancel');
      fireEvent.click(cancelButton);

      expect(routerSpy).toHaveBeenCalledWith([
        '/workplace',
        workplaceId,
        'staff-record',
        workerId,
        'staff-record-summary',
      ]);
    });

    it('should navigate to wdf staff-summary-page page when pressing save and return in wdf version', async () => {
      const { component, fixture, routerSpy, getByText, router } = await setup(false);
      spyOnProperty(router, 'url').and.returnValue('/wdf/staff-record');
      component.returnUrl = undefined;
      component.ngOnInit();
      fixture.detectChanges();
      const workerId = component.worker.uid;

      component.form.controls.qualification.setValue('2');
      fixture.detectChanges();

      const saveButton = getByText('Save and return');
      fireEvent.click(saveButton);

      expect(getByText('Save and return')).toBeTruthy();

      expect(routerSpy).toHaveBeenCalledWith(['/wdf', 'staff-record', workerId]);
    });

    it('should navigate to wdf staff-summary-page page when pressing cancel when in wdf version of page', async () => {
      const { component, routerSpy, fixture, getByText, router } = await setup(false);
      spyOnProperty(router, 'url').and.returnValue('/wdf/staff-record');
      component.returnUrl = undefined;
      component.ngOnInit();
      fixture.detectChanges();
      const workerId = component.worker.uid;

      const cancelButton = getByText('Cancel');
      fireEvent.click(cancelButton);

      expect(routerSpy).toHaveBeenCalledWith(['/wdf', 'staff-record', workerId]);
    });
  });
});
