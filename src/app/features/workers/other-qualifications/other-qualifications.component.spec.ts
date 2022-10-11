import { HttpClientTestingModule } from '@angular/common/http/testing';
import { getTestBed } from '@angular/core/testing';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { Establishment } from '@core/model/establishment.model';
import { BackService } from '@core/services/back.service';
import { WorkerService } from '@core/services/worker.service';
import { MockWorkerServiceWithUpdateWorker } from '@core/test-utils/MockWorkerService';
import { SharedModule } from '@shared/shared.module';
import { fireEvent, render } from '@testing-library/angular';

import { establishmentBuilder } from '../../../../../server/test/factories/models';
import { WorkersModule } from '../workers.module';
import { OtherQualificationsComponent } from './other-qualifications.component';

describe('OtherQualificationsComponent', () => {
  const workplace = establishmentBuilder() as Establishment;

  async function setup(insideFlow = true) {
    const { fixture, getByText, getByTestId, queryByTestId } = await render(OtherQualificationsComponent, {
      imports: [SharedModule, RouterModule, RouterTestingModule, HttpClientTestingModule, WorkersModule],
      providers: [
        BackService,
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
    });

    const component = fixture.componentInstance;

    const injector = getTestBed();
    const router = injector.inject(Router) as Router;
    const backService = injector.inject(BackService);

    const routerSpy = spyOn(router, 'navigate').and.returnValue(Promise.resolve(true));
    const backLinkSpy = spyOn(backService, 'setBackLink');

    return {
      component,
      fixture,
      routerSpy,
      getByText,
      backLinkSpy,
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
      const { component, fixture, getByText } = await setup();

      fixture.detectChanges();

      expect(getByText('Save and continue')).toBeTruthy();
      expect(getByText('View this staff record')).toBeTruthy();
      expect(getByText('Skip this question')).toBeTruthy();
    });

    it('should render the page with a save and return button and a cancel link', async () => {
      const { getByText } = await setup(false);

      expect(getByText('Save and return')).toBeTruthy();
      expect(getByText('Cancel')).toBeTruthy();
    });

    it(`should run getRoutePath with a other-qualifications-level string when otherQualification is yes and in the flow`, async () => {
      const { component, getByText, routerSpy } = await setup();

      const button = getByText('Save and continue');

      fireEvent.click(button);
      component.worker.otherQualification;

      expect(routerSpy).toHaveBeenCalledWith([
        '/workplace',
        'mocked-uid',
        'staff-record',
        component.worker.uid,
        'other-qualifications-level',
      ]);
    });

    it(`should call submit data and navigate with the   'other-qualifications-level' url when 'Skip this question' is clicked and in the flow`, async () => {
      const { component, getByText, routerSpy } = await setup();

      const button = getByText('Skip this question');
      fireEvent.click(button);
      component.worker.otherQualification;

      expect(routerSpy).toHaveBeenCalledWith([
        '/workplace',
        'mocked-uid',
        'staff-record',
        component.worker.uid,
        'other-qualifications-level',
      ]);
    });

    it('should navigate to staff-record when View this staff record link is clicked', async () => {
      const { component, fixture, routerSpy, getByText } = await setup();

      component.return = null;
      fixture.detectChanges();

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

    it('should navigate to staff-summary-page page when pressing save and return', async () => {
      const { component, routerSpy, getByText } = await setup(false);

      const workerId = component.worker.uid;
      const workplaceId = component.workplace.uid;

      const link = getByText('Save and return');
      fireEvent.click(link);

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
});
