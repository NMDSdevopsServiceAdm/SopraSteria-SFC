import { HttpClient } from '@angular/common/http';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { getTestBed } from '@angular/core/testing';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { AlertService } from '@core/services/alert.service';
import { WindowRef } from '@core/services/window.ref';
import { WorkerService } from '@core/services/worker.service';
import { MockWorkerServiceWithoutReturnUrl } from '@core/test-utils/MockWorkerService';
import { build, fake } from '@jackfranklin/test-data-bot';
import { SharedModule } from '@shared/shared.module';
import { fireEvent, render } from '@testing-library/angular';

import { WorkersModule } from '../workers.module';
import { OtherQualificationsComponent } from './other-qualifications.component';

const workerBuilder = build('Worker', {
  fields: {
    uid: fake((f) => f.datatype.uuid()),
    qualificationInSocialCare: 'Yes',
    otherQualification: 'Yes',
  },
});

const noQualificationInSocialCare = () =>
  workerBuilder({
    overrides: {
      qualificationInSocialCare: 'No',
      otherQualification: 'No',
    },
  });

describe('OtherQualificationsComponent', () => {
  async function setup(insideFlow = true, qualificationInSocial = 'Yes') {
    let qualification;

    if (qualificationInSocial === 'Yes') {
      qualification = workerBuilder();
    } else if (qualificationInSocial === 'No') {
      qualification = noQualificationInSocialCare();
    }
    const { fixture, getByText, getByTestId, queryByTestId } = await render(OtherQualificationsComponent, {
      imports: [SharedModule, RouterModule, RouterTestingModule, HttpClientTestingModule, WorkersModule],
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
          useFactory: MockWorkerServiceWithoutReturnUrl.factory(qualification),
          deps: [HttpClient],
        },
        AlertService,
        WindowRef,
      ],
    });

    const component = fixture.componentInstance;

    const injector = getTestBed();
    const router = injector.inject(Router) as Router;
    const routerSpy = spyOn(router, 'navigate').and.returnValue(Promise.resolve(true));

    const alertService = injector.inject(AlertService) as AlertService;
    const alertSpy = spyOn(alertService, 'addAlert').and.stub();

    const workerService = injector.inject(WorkerService) as WorkerService;
    const hasCompletedStaffRecordFlowSpy = spyOnProperty(workerService, 'hasCompletedStaffRecordFlow', 'set');

    return {
      component,
      fixture,
      routerSpy,
      router,
      getByText,
      getByTestId,
      queryByTestId,
      alertSpy,
      hasCompletedStaffRecordFlowSpy,
    };
  }

  it('should render a OtherQualificationsComponent', async () => {
    const { component } = await setup();
    expect(component).toBeTruthy();
  });

  describe('submit buttons', () => {
    it('should render the page with a save button, view this staff record and Skip this question link when in flow', async () => {
      const { getByText } = await setup();

      expect(getByText('Save')).toBeTruthy();
      expect(getByText('View this staff record')).toBeTruthy();
      expect(getByText('Skip this question')).toBeTruthy();
    });

    it('should render the page with a save button and a cancel link when not in the flow', async () => {
      const { getByText } = await setup(false);

      expect(getByText('Save')).toBeTruthy();
      expect(getByText('Cancel')).toBeTruthy();
    });

    it(`should run getRoutePath with a other-qualifications-level string when otherQualification is yes and in the flow`, async () => {
      const { component, getByText, routerSpy } = await setup(true, 'Yes');

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
          const { component, getByText, routerSpy } = await setup(true, 'Yes');

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
          const { getByText, alertSpy } = await setup(true, 'Yes');

          fireEvent.click(getByText(link));

          expect(alertSpy).toHaveBeenCalledWith({
            type: 'success',
            message: 'Staff record saved',
          });
        });

        it(`should set hasCompletedStaffRecordFlow in worker service when '${link}' is clicked`, async () => {
          const { getByText, hasCompletedStaffRecordFlowSpy } = await setup(true, 'Yes');

          fireEvent.click(getByText(link));

          expect(hasCompletedStaffRecordFlowSpy).toHaveBeenCalled();
        });
      });

      ['No', 'I do not know'].forEach((answer) => {
        it(`should navigate to 'staff-record-summary' url when '${answer}' is selected`, async () => {
          const { component, getByText, routerSpy } = await setup(true, 'Yes');

          const button = getByText(answer);
          fireEvent.click(button);

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
          const { getByText, alertSpy } = await setup(true, 'Yes');

          const button = getByText(answer);
          fireEvent.click(button);

          fireEvent.click(getByText('Save'));

          expect(alertSpy).toHaveBeenCalledWith({
            type: 'success',
            message: 'Staff record saved',
          });
        });

        it(`should set hasCompletedStaffRecordFlow in worker service when '${answer}' is selected`, async () => {
          const { getByText, hasCompletedStaffRecordFlowSpy } = await setup(true, 'Yes');

          const button = getByText(answer);
          fireEvent.click(button);

          fireEvent.click(getByText('Save'));

          expect(hasCompletedStaffRecordFlowSpy).toHaveBeenCalled();
        });
      });
    });

    it('should navigate to staff-summary-page page when pressing save and not know is entered', async () => {
      const { component, fixture, routerSpy, getByText } = await setup(false);

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
      const { component, fixture, routerSpy, getByText } = await setup(false);

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
        const { getByText, alertSpy } = await setup(false);

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
      const { component, fixture, routerSpy, getByText } = await setup(false);

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

    it('should navigate to wdf staff-summary-page page when pressing save and not know is entered in wdf version of page', async () => {
      const { component, fixture, routerSpy, getByText, router } = await setup(false, 'yes');
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
      const { component, fixture, routerSpy, getByText, router } = await setup(false, 'yes');
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
      const { component, fixture, routerSpy, getByText, router } = await setup(false, 'yes');
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
      const { component, routerSpy, getByText, fixture, router } = await setup(false, 'yes');
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
      const { getByTestId } = await setup();

      expect(getByTestId('progress-bar')).toBeTruthy();
    });

    it('should not render the progress bar when outside the flow', async () => {
      const { queryByTestId } = await setup(false);

      expect(queryByTestId('progress-bar')).toBeFalsy();
    });
  });
});
