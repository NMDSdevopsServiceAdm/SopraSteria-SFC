import { HttpClientTestingModule } from '@angular/common/http/testing';
import { getTestBed } from '@angular/core/testing';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { Establishment } from '@core/model/establishment.model';
import { Worker } from '@core/model/worker.model';
import { BackService } from '@core/services/back.service';
import { WorkerService } from '@core/services/worker.service';
import { MockWorkerService, workerBuilder } from '@core/test-utils/MockWorkerService';
import { SharedModule } from '@shared/shared.module';
import { fireEvent, render, screen } from '@testing-library/angular';

import { establishmentBuilder } from '../../../../../server/test/factories/models';
import { OtherQualificationsComponent } from '../other-qualifications/other-qualifications.component';
import { WorkersModule } from '../workers.module';
import { OtherQualificationsLevelComponent } from './other-qualifications-level.component';

describe('OtherQualificationsLevelComponent', () => {
  const workplace = establishmentBuilder() as Establishment;
  const worker = workerBuilder() as Worker;

  async function setup() {
    const { fixture } = await render(OtherQualificationsLevelComponent, {
      imports: [
        SharedModule,
        RouterModule,
        RouterTestingModule.withRoutes([
          {
            path: `workplace/${workplace.uid}/staff-record/${worker.uid}/other-qualifications`,
            component: OtherQualificationsComponent,
          },
        ]),
        HttpClientTestingModule,
        WorkersModule,
      ],
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
          useClass: MockWorkerService,
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
    };
  }

  it('should render a OtherQualificationsLevelComponent', async () => {
    const { component } = await setup();

    expect(component).toBeTruthy();
  });

  it('should render the page with a save and continue button when there return value is null', async () => {
    const { component, fixture } = await setup();

    component.return = null;
    fixture.detectChanges();

    const button = screen.getByText('Save and continue');
    const viewRecordLink = screen.getByText('View this staff record');

    expect(button).toBeTruthy();
    expect(viewRecordLink).toBeTruthy();
  });

  it('should render the page with a save and return button and an cancel link when there is a return value', async () => {
    const { component, fixture } = await setup();

    component.return = { url: ['/dashboard'], fragment: 'workplace' };
    fixture.detectChanges();

    const button = screen.getByText('Save and return');
    const exitLink = screen.getByText('Cancel');

    expect(button).toBeTruthy();
    expect(exitLink).toBeTruthy();
  });

  it('should navigate back to staff-record when View this staff record link is clicked', async () => {
    const { component, fixture, routerSpy } = await setup();

    component.return = null;
    fixture.detectChanges();

    const workplaceUid = component.workplace.uid;
    const workerUid = component.worker.uid;
    const viewRecordLink = screen.getByText('View this staff record');
    fireEvent.click(viewRecordLink);

    expect(routerSpy).toHaveBeenCalledWith(['/workplace', workplaceUid, 'staff-record', workerUid]);
  });
});
