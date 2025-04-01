import { HttpClient } from '@angular/common/http';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { getTestBed } from '@angular/core/testing';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { AlertService } from '@core/services/alert.service';
import { WindowRef } from '@core/services/window.ref';
import { WorkerService } from '@core/services/worker.service';
import { MockWorkerServiceWithOverrides } from '@core/test-utils/MockWorkerService';
import { SharedModule } from '@shared/shared.module';
import { fireEvent, render } from '@testing-library/angular';

import { WorkersModule } from '../workers.module';
import { OtherQualificationsComponent } from './other-qualifications.component';

describe('OtherQualificationsComponent', () => {
  /* eslint-disable @typescript-eslint/no-explicit-any */
  async function setup(overrides: any = {}) {
    const insideFlow = overrides.insideFlow ?? false;
    const workerOverrides = overrides.worker ?? { otherQualification: null };

    const setupTools = await render(OtherQualificationsComponent, {
      imports: [SharedModule, RouterModule, HttpClientTestingModule, WorkersModule],
      providers: [
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
          useFactory: MockWorkerServiceWithOverrides.factory({ worker: workerOverrides }),
          deps: [HttpClient],
        },
        AlertService,
        WindowRef,
      ],
    });

    const injector = getTestBed();
    const router = injector.inject(Router) as Router;
    const routerSpy = spyOn(router, 'navigate').and.returnValue(Promise.resolve(true));

    const alertService = injector.inject(AlertService) as AlertService;
    const alertSpy = spyOn(alertService, 'addAlert').and.stub();

    return {
      ...setupTools,
      component: setupTools.fixture.componentInstance,
      routerSpy,
      router,
      alertSpy,
    };
  }

  it('should render a OtherQualificationsComponent', async () => {
    const { component } = await setup();
    expect(component).toBeTruthy();
  });

  describe('submit buttons', () => {
    it('should render the page with a save button, view this staff record and Skip this question link when in flow', async () => {
      const { getByText } = await setup({ insideFlow: true });

      expect(getByText('Save')).toBeTruthy();
      expect(getByText('View this staff record')).toBeTruthy();
      expect(getByText('Skip this question')).toBeTruthy();
    });

    it('should render the page with a save button and a cancel link when not in the flow', async () => {
      const { getByText } = await setup({ insideFlow: false });

      expect(getByText('Save')).toBeTruthy();
      expect(getByText('Cancel')).toBeTruthy();
    });

    it(`should navigate to other-qualifications-level when otherQualification is previously answered yes and in the flow`, async () => {
      const { component, getByText, routerSpy } = await setup({
        insideFlow: true,
        worker: { otherQualification: 'Yes' },
      });

      const button = getByText('Save');

      fireEvent.click(button);

      expect(routerSpy).toHaveBeenCalledWith([
        '/workplace',
        'mocked-uid',
        'staff-record',
        component.worker.uid,
        'other-qualifications-level',
      ]);
    });

    describe('Add worker details flow', () => {
      ['Skip this question', 'View this staff record'].forEach((link) => {
        it(`should navigate to 'staff-record-summary' url when '${link}' is clicked`, async () => {
          const { component, getByText, routerSpy } = await setup({ insideFlow: true });

          fireEvent.click(getByText(link));

          expect(routerSpy).toHaveBeenCalledWith([
            '/workplace',
            'mocked-uid',
            'staff-record',
            component.worker.uid,
            'staff-record-summary',
          ]);
        });

        it(`should add Staff record added alert when '${link}' is clicked`, async () => {
          const { getByText, alertSpy } = await setup({ insideFlow: true });

          fireEvent.click(getByText(link));

          expect(alertSpy).toHaveBeenCalledWith({
            type: 'success',
            message: 'Staff record saved',
          });
        });
      });

      ['No', 'I do not know', null].forEach((answer) => {
        const userClicksSaveWithoutSelecting = answer === null;

        it(`should navigate to 'staff-record-summary' url when '${answer}' is selected`, async () => {
          const { component, getByText, routerSpy } = await setup({ insideFlow: true });

          if (!userClicksSaveWithoutSelecting) {
            const button = getByText(answer);
            fireEvent.click(button);
          }

          fireEvent.click(getByText('Save'));

          expect(routerSpy).toHaveBeenCalledWith([
            '/workplace',
            'mocked-uid',
            'staff-record',
            component.worker.uid,
            'staff-record-summary',
          ]);
        });

        it(`should add Staff record added alert when '${answer}' is selected`, async () => {
          const { getByText, alertSpy } = await setup({ insideFlow: true });

          if (!userClicksSaveWithoutSelecting) {
            const button = getByText(answer);
            fireEvent.click(button);
          }

          fireEvent.click(getByText('Save'));

          expect(alertSpy).toHaveBeenCalledWith({
            type: 'success',
            message: 'Staff record saved',
          });
        });
      });
    });

    it('should navigate to staff-summary-page page when pressing save and not know is entered', async () => {
      const { component, fixture, routerSpy, getByText } = await setup({ insideFlow: false });

      const workerId = component.worker.uid;
      const workplaceId = component.workplace.uid;

      const radioButton = getByText('I do not know');
      fireEvent.click(radioButton);

      const link = getByText('Save');
      fireEvent.click(link);

      fixture.detectChanges();

      expect(routerSpy).toHaveBeenCalledWith([
        '/workplace',
        workplaceId,
        'staff-record',
        workerId,
        'staff-record-summary',
      ]);
    });

    it('should navigate to staff-summary-page page when pressing save and No is entered', async () => {
      const { component, fixture, routerSpy, getByText } = await setup({ insideFlow: false });

      const workerId = component.worker.uid;
      const workplaceId = component.workplace.uid;

      const radioButton = getByText('No');
      fireEvent.click(radioButton);

      const link = getByText('Save');
      fireEvent.click(link);

      fixture.detectChanges();

      expect(routerSpy).toHaveBeenCalledWith([
        '/workplace',
        workplaceId,
        'staff-record',
        workerId,
        'staff-record-summary',
      ]);
    });

    ['No', 'I do not know'].forEach((answer) => {
      it(`should not add Staff record added alert when '${answer}' is selected but not in flow`, async () => {
        const { getByText, alertSpy } = await setup({ insideFlow: false });

        const button = getByText(answer);
        fireEvent.click(button);

        fireEvent.click(getByText('Save'));

        expect(alertSpy).not.toHaveBeenCalledWith({
          type: 'success',
          message: 'Staff record saved',
        });
      });
    });

    it('should navigate to other-qualifications-level page when pressing save and Yes is entered', async () => {
      const { component, fixture, routerSpy, getByText } = await setup({ insideFlow: false });

      const workerId = component.worker.uid;
      const workplaceId = component.workplace.uid;

      const radioButton = getByText('Yes');
      fireEvent.click(radioButton);

      const link = getByText('Save');
      fireEvent.click(link);

      fixture.detectChanges();

      expect(routerSpy).toHaveBeenCalledWith([
        '/workplace',
        workplaceId,
        'staff-record',
        workerId,
        'staff-record-summary',
        'other-qualifications-level',
      ]);
    });

    it('should navigate to staff-summary-page page when pressing cancel', async () => {
      const { component, routerSpy, getByText } = await setup({ insideFlow: false });

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

    it('should navigate to wdf staff-summary-page page when pressing save and not know is entered in wdf version of page', async () => {
      const { component, fixture, routerSpy, getByText, router } = await setup({ insideFlow: false });
      spyOnProperty(router, 'url').and.returnValue('/wdf/staff-record');
      component.returnUrl = undefined;
      component.ngOnInit();
      fixture.detectChanges();
      const workerId = component.worker.uid;

      const radioButton = getByText('I do not know');
      fireEvent.click(radioButton);

      const link = getByText('Save');
      fireEvent.click(link);

      fixture.detectChanges();

      expect(routerSpy).toHaveBeenCalledWith(['/wdf', 'staff-record', workerId]);
    });

    it('should navigate to wdf staff-summary-page page when pressing save and No is entered in wdf version of page', async () => {
      const { component, fixture, routerSpy, getByText, router } = await setup({ insideFlow: false });
      spyOnProperty(router, 'url').and.returnValue('/wdf/staff-record');
      component.returnUrl = undefined;
      component.ngOnInit();
      fixture.detectChanges();
      const workerId = component.worker.uid;

      const radioButton = getByText('No');
      fireEvent.click(radioButton);

      const link = getByText('Save');
      fireEvent.click(link);

      fixture.detectChanges();

      expect(routerSpy).toHaveBeenCalledWith(['/wdf', 'staff-record', workerId]);
    });

    it('should navigate to wdf other-qualifications-level page when pressing save and Yes is entered in wdf version of page', async () => {
      const { component, fixture, routerSpy, getByText, router } = await setup({ insideFlow: false });
      spyOnProperty(router, 'url').and.returnValue('/wdf/staff-record');
      component.returnUrl = undefined;
      component.ngOnInit();
      fixture.detectChanges();
      const workerId = component.worker.uid;

      const radioButton = getByText('Yes');
      fireEvent.click(radioButton);

      const link = getByText('Save');
      fireEvent.click(link);

      fixture.detectChanges();

      expect(routerSpy).toHaveBeenCalledWith(['/wdf', 'staff-record', workerId, 'other-qualifications-level']);
    });

    it('should navigate to wdf staff-summary-page page when pressing cancel in wdf version of page', async () => {
      const { component, routerSpy, getByText, fixture, router } = await setup({ insideFlow: false });
      spyOnProperty(router, 'url').and.returnValue('/wdf/staff-record');
      component.returnUrl = undefined;
      component.ngOnInit();
      fixture.detectChanges();
      const workerId = component.worker.uid;

      const link = getByText('Cancel');
      fireEvent.click(link);

      expect(routerSpy).toHaveBeenCalledWith(['/wdf', 'staff-record', workerId]);
    });
  });

  describe('progress bar', () => {
    it('should render the progress bar when in the flow', async () => {
      const { getByTestId } = await setup({ insideFlow: true });

      expect(getByTestId('progress-bar')).toBeTruthy();
    });

    it('should not render the progress bar when outside the flow', async () => {
      const { queryByTestId } = await setup({ insideFlow: false });

      expect(queryByTestId('progress-bar')).toBeFalsy();
    });
  });
});
