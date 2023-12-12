import { HttpClient } from '@angular/common/http';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { getTestBed } from '@angular/core/testing';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
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
      ],
    });

    const component = fixture.componentInstance;

    const injector = getTestBed();
    const router = injector.inject(Router) as Router;

    const routerSpy = spyOn(router, 'navigate').and.returnValue(Promise.resolve(true));

    return {
      component,
      fixture,
      routerSpy,
      router,
      getByText,
      getByTestId,
      queryByTestId,
    };
  }

  it('should render a OtherQualificationsComponent', async () => {
    const { component } = await setup();
    expect(component).toBeTruthy();
  });

  describe('submit buttons', () => {
    it('should render the page with a save and continue button and view this staff record and Skip this question link', async () => {
      const { getByText } = await setup();

      expect(getByText('Save and continue')).toBeTruthy();
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

      const button = getByText('Save and continue');

      fireEvent.click(button);

      expect(routerSpy).toHaveBeenCalledWith([
        '/workplace',
        'mocked-uid',
        'staff-record',
        component.worker.uid,
        'other-qualifications-level',
      ]);
    });

    it(`should navigate with the 'confirm-staff-record' url when 'Skip this question' is clicked and in the flow`, async () => {
      const { component, getByText, routerSpy } = await setup(true, 'Yes');

      const button = getByText('Skip this question');
      fireEvent.click(button);

      expect(routerSpy).toHaveBeenCalledWith([
        '/workplace',
        'mocked-uid',
        'staff-record',
        component.worker.uid,
        'confirm-staff-record',
      ]);
    });

    it('should navigate to staff-record when View this staff record link is clicked', async () => {
      const { component, routerSpy, getByText } = await setup();

      const workplaceUid = component.workplace.uid;
      const workerUid = component.worker.uid;
      const viewRecordLink = getByText('View this staff record');
      fireEvent.click(viewRecordLink);

      expect(routerSpy).toHaveBeenCalledWith([
        '/workplace',
        workplaceUid,
        'staff-record',
        workerUid,
        'staff-record-summary',
      ]);
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
