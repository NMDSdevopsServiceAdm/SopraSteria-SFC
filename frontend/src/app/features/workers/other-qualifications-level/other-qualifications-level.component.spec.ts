import { provideHttpClient } from '@angular/common/http';
import { HttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { getTestBed } from '@angular/core/testing';
import { UntypedFormBuilder } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { AlertService } from '@core/services/alert.service';
import { QualificationService } from '@core/services/qualification.service';
import { WindowRef } from '@core/services/window.ref';
import { WorkerService } from '@core/services/worker.service';
import { MockQualificationService } from '@core/test-utils/MockQualificationsService';
import { MockWorkerServiceWithOverrides } from '@core/test-utils/MockWorkerService';
import { SharedModule } from '@shared/shared.module';
import { fireEvent, render } from '@testing-library/angular';

import { WorkersModule } from '../workers.module';
import { OtherQualificationsLevelComponent } from './other-qualifications-level.component';

describe('OtherQualificationsLevelComponent', () => {
  async function setup(overrides: any = {}) {
    const setupTools = await render(OtherQualificationsLevelComponent, {
      imports: [SharedModule, RouterModule, WorkersModule],
      providers: [
        UntypedFormBuilder,
        {
          provide: ActivatedRoute,
          useValue: {
            parent: {
              snapshot: {
                url: [{ path: overrides.returnUrl ? 'staff-record-summary' : 'staff-uid' }],
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
          // useFactory: MockWorkerServiceWithOverrides.factory(overrides),
          deps: [HttpClient],
          useFactory: MockWorkerServiceWithOverrides.factory({
            returnTo: () => {
              return overrides.returnUrl
                ? {
                    url: ['/dashboard'],
                    fragment: 'workplace',
                  }
                : null;
            },
          }),
        },
        {
          provide: QualificationService,
          useClass: MockQualificationService,
        },
        AlertService,
        WindowRef,
      provideHttpClient(), provideHttpClientTesting(),],
    });
    const injector = getTestBed();

    const router = injector.inject(Router) as Router;
    const routerSpy = spyOn(router, 'navigate').and.returnValue(Promise.resolve(true));
    const alertService = injector.inject(AlertService) as AlertService;
    const alertSpy = spyOn(alertService, 'addAlert').and.stub();

    // hasAnsweredNonMandatoryQuestion should always be true,
    // as this question only visited when OtherQualifications was answered with yes
    const workerService = injector.inject(WorkerService) as WorkerService;
    spyOn(workerService, 'hasAnsweredNonMandatoryQuestion').and.returnValue(true);

    return {
      ...setupTools,
      component: setupTools.fixture.componentInstance,
      router,
      routerSpy,
      alertSpy,
    };
  }

  it('should render a OtherQualificationsLevelComponent', async () => {
    const overrides = { returnUrl: true };
    const { component } = await setup(overrides);
    expect(component).toBeTruthy();
  });

  it('should render the OtherQualificationsLevelComponent heading, subheading and select box', async () => {
    const overrides = { returnUrl: true };
    const { getByText, getByTestId } = await setup(overrides);

    expect(getByText(`What's the highest level of their other qualifications?`)).toBeTruthy;
    expect(getByTestId('section-heading')).toBeTruthy();
    expect(getByText('Qualification level')).toBeTruthy();
  });

  it('should render the reveal', async () => {
    const { getByText } = await setup();

    expect(getByText('Get help with qualification levels')).toBeTruthy();
  });

  it("should show the correct format for don't know answer", async () => {
    const { getByText } = await setup();

    expect(getByText('I do not know')).toBeTruthy();
  });

  describe('submit buttons', () => {
    it('should render the page with a Save and continue button when the return value is null', async () => {
      const { getByText } = await setup({ returnUrl: false });

      const button = getByText('Save and continue');
      const viewRecordLink = getByText('View this staff record');

      expect(button).toBeTruthy();
      expect(viewRecordLink).toBeTruthy();
    });

    it('should render the page with a save and return button and an cancel link when there is a return value', async () => {
      const overrides = { returnUrl: true };
      const { getByText } = await setup(overrides);

      const button = getByText('Save and return');
      const exitLink = getByText('Cancel');

      expect(button).toBeTruthy();
      expect(exitLink).toBeTruthy();
    });
  });

  describe('progress bar', () => {
    it('should render the workplace progress bar', async () => {
      const { getByTestId } = await setup({ returnUrl: false });

      expect(getByTestId('progress-bar-1')).toBeTruthy();
    });

    it('should not render the progress bars when accessed from outside the flow', async () => {
      const overrides = { returnUrl: true };
      const { queryByTestId } = await setup(overrides);

      expect(queryByTestId('progress-bar-1')).toBeFalsy();
    });
  });

  describe('navigation', () => {
    it('should navigate to care-workforce-pathway page when submitting from flow', async () => {
      const overrides = { returnUrl: false };
      const { component, fixture, routerSpy, getByText, getByLabelText } = await setup(overrides);

      await fixture.whenStable();

      const workerId = component.worker.uid;
      const workplaceId = component.workplace.uid;

      fireEvent.click(getByLabelText('Level 1'));

      const saveButton = getByText('Save and continue');
      fireEvent.click(saveButton);
      fixture.detectChanges();

      expect(routerSpy).toHaveBeenCalledWith([
        '/workplace',
        workplaceId,
        'staff-record',
        workerId,
        'care-workforce-pathway',
      ]);
    });

    it('should navigate to care-workforce-pathway page when skipping the question in the flow', async () => {
      const overrides = { returnUrl: false };
      const { component, routerSpy, getByText } = await setup(overrides);

      const workerId = component.worker.uid;
      const workplaceId = component.workplace.uid;

      const skipButton = getByText('Skip this question');
      fireEvent.click(skipButton);

      expect(routerSpy).toHaveBeenCalledWith([
        '/workplace',
        workplaceId,
        'staff-record',
        workerId,
        'care-workforce-pathway',
      ]);
    });

    it('should navigate to staff-summary-page page when pressing save and return', async () => {
      const overrides = { returnUrl: true };
      const { component, fixture, routerSpy, getByText, getByLabelText } = await setup(overrides);

      const workerId = component.worker.uid;
      const workplaceId = component.workplace.uid;

      const radioButton = getByLabelText('Entry level');
      fireEvent.click(radioButton);
      fixture.detectChanges();

      const skipButton = getByText('Save and return');
      fireEvent.click(skipButton);
      fixture.detectChanges();

      expect(routerSpy).toHaveBeenCalledWith([
        '/workplace',
        workplaceId,
        'staff-record',
        workerId,
        'staff-record-summary',
      ]);
    });

    it('should navigate to staff-summary-page page when pressing cancel', async () => {
      const overrides = { returnUrl: true };
      const { component, routerSpy, getByText } = await setup(overrides);

      const workerId = component.worker.uid;
      const workplaceId = component.workplace.uid;

      const skipButton = getByText('Cancel');
      fireEvent.click(skipButton);

      expect(routerSpy).toHaveBeenCalledWith([
        '/workplace',
        workplaceId,
        'staff-record',
        workerId,
        'staff-record-summary',
      ]);
    });

    it('should navigate to funding staff-summary-page page when pressing save and return in funding version of page', async () => {
      const overrides = { returnUrl: false };
      const { component, fixture, routerSpy, getByText, getByLabelText, router } = await setup(overrides);
      spyOnProperty(router, 'url').and.returnValue('/funding/staff-record');
      component.returnUrl = undefined;
      component.ngOnInit();
      fixture.detectChanges();
      const workerId = component.worker.uid;

      const radioButton = getByLabelText('Entry level');
      fireEvent.click(radioButton);
      fixture.detectChanges();

      const skipButton = getByText('Save and return');
      fireEvent.click(skipButton);
      fixture.detectChanges();

      expect(routerSpy).toHaveBeenCalledWith(['/funding', 'staff-record', workerId]);
    });

    it('should navigate to funding staff-summary-page page when pressing cancel in funding version of page', async () => {
      const overrides = { returnUrl: false };
      const { component, routerSpy, getByText, router, fixture } = await setup(overrides);
      spyOnProperty(router, 'url').and.returnValue('/funding/staff-record');
      component.returnUrl = undefined;
      component.ngOnInit();
      fixture.detectChanges();
      const workerId = component.worker.uid;

      const skipButton = getByText('Cancel');
      fireEvent.click(skipButton);

      expect(routerSpy).toHaveBeenCalledWith(['/funding', 'staff-record', workerId]);
    });
  });
});