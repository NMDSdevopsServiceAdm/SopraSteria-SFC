import { HttpClientTestingModule } from '@angular/common/http/testing';
import { getTestBed } from '@angular/core/testing';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { Establishment } from '@core/model/establishment.model';
import { BackService } from '@core/services/back.service';
import { WorkerService } from '@core/services/worker.service';
import { MockWorkerServiceWithUpdateWorker } from '@core/test-utils/MockWorkerService';
import { SharedModule } from '@shared/shared.module';
import { fireEvent, render, screen } from '@testing-library/angular';

import { establishmentBuilder } from '../../../../../server/test/factories/models';
import { WorkersModule } from '../workers.module';
import { OtherQualificationsLevelComponent } from './other-qualifications-level.component';

describe('OtherQualificationsLevelComponent', () => {
  const workplace = establishmentBuilder() as Establishment;

  async function setup() {
    const { fixture } = await render(OtherQualificationsLevelComponent, {
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
    };
  }

  it('should render a OtherQualificationsLevelComponent', async () => {
    const { component } = await setup();
    expect(component).toBeTruthy();
  });

  it('should render the page with a save and return button and an exit link', async () => {
    const { component, fixture } = await setup();

    component.return = null;
    fixture.detectChanges();

    const button = screen.getByText('Save and continue');
    const viewRecordLink = screen.getByText('View record summary');
    const exitLink = screen.getByText('Exit');

    expect(button).toBeTruthy();
    expect(viewRecordLink).toBeTruthy();
    expect(exitLink).toBeTruthy();
  });

  it('should render the page with a save and continue button and an exit link', async () => {
    await setup();

    const button = screen.getByText('Save and return');
    const exitLink = screen.getByText('Exit');

    expect(button).toBeTruthy();
    expect(exitLink).toBeTruthy();
  });

  it('should navigate back to staff-record when view record summary link is clicked', async () => {
    const { component, fixture, routerSpy } = await setup();

    component.return = null;
    fixture.detectChanges();

    const workplaceUid = component.workplace.uid;
    const workerUid = component.worker.uid;
    const viewRecordLink = screen.getByText('View record summary');
    fireEvent.click(viewRecordLink);

    expect(routerSpy).toHaveBeenCalledWith(['/workplace', workplaceUid, 'staff-record', workerUid]);
  });
});
