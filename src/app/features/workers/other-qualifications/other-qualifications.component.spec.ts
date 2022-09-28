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

  async function setup() {
    const { fixture, getByText } = await render(OtherQualificationsComponent, {
      imports: [SharedModule, RouterModule, RouterTestingModule, HttpClientTestingModule, WorkersModule],
      providers: [
        BackService,
        {
          provide: ActivatedRoute,
          useValue: {
            parent: {
              snapshot: {
                data: {
                  establishment: workplace,
                },
              },
            },
            snapshot: {},
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
    const routerSpy = spyOn(router, 'navigate');
    routerSpy.and.returnValue(Promise.resolve(true));

    return {
      component,
      fixture,
      routerSpy,
      getByText,
    };
  }

  it('should render a OtherQualificationsComponent', async () => {
    const { component } = await setup();
    expect(component).toBeTruthy();
  });

  it('should render the page with a save and continue button and view this staff record link', async () => {
    const { component, fixture, getByText } = await setup();

    component.return = null;
    fixture.detectChanges();

    const button = getByText('Save and continue');
    const viewRecordLink = getByText('View this staff record');

    expect(button).toBeTruthy();
    expect(viewRecordLink).toBeTruthy();
  });

  it('should render the page with a save and return button and a cancel link', async () => {
    const { getByText } = await setup();

    const button = getByText('Save and return');
    const exitLink = getByText('Cancel');

    expect(button).toBeTruthy();
    expect(exitLink).toBeTruthy();
  });

  it('should run getRoutePath with a blank string', async () => {
    const { component, fixture, getByText } = await setup();
    const getRoutePathSpy = spyOn(component, 'getRoutePath');

    component.worker.otherQualification = 'No';
    fixture.detectChanges();

    const button = getByText('Save and return');
    fireEvent.click(button);

    expect(getRoutePathSpy).toHaveBeenCalledWith('');
  });

  it('should run getRoutePath with a other-qualifications-level string when otherQualification is yes', async () => {
    const { component, fixture, getByText } = await setup();
    const getRoutePathSpy = spyOn(component, 'getRoutePath');

    component.worker.otherQualification = 'Yes';
    fixture.detectChanges();

    const button = getByText('Save and return');
    fireEvent.click(button);

    expect(getRoutePathSpy).toHaveBeenCalledWith('other-qualifications-level');
  });

  it('should navigate back to staff-record when View this staff record link is clicked', async () => {
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
});
