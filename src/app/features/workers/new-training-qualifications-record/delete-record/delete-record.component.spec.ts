import { HttpClientTestingModule } from '@angular/common/http/testing';
import { getTestBed } from '@angular/core/testing';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { Establishment } from '@core/model/establishment.model';
import { AlertService } from '@core/services/alert.service';
import { WindowRef } from '@core/services/window.ref';
import { WorkerService } from '@core/services/worker.service';
import { MockWorkerService, workerBuilder } from '@core/test-utils/MockWorkerService';
import { SharedModule } from '@shared/shared.module';
import { render } from '@testing-library/angular';

import { establishmentBuilder } from '../../../../../../server/test/factories/models';
import { WorkersModule } from '../../workers.module';
import { DeleteRecordComponent } from './delete-record.component';

describe('DeleteRecordComponent', () => {
  const workplace = establishmentBuilder() as Establishment;
  const worker = workerBuilder() as Worker;

  async function setup(otherJob = false) {
    const { fixture, getByText, getAllByText, queryByText, getByTestId } = await render(DeleteRecordComponent, {
      imports: [SharedModule, RouterModule, RouterTestingModule, HttpClientTestingModule, WorkersModule],
      providers: [
        AlertService,
        WindowRef,
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              data: {
                establishment: workplace,
                worker: {
                  uid: 123,
                  nameOrId: 'John',
                  mainJob: {
                    title: 'Care Worker',
                    other: otherJob ? 'Care taker' : undefined,
                  },
                },
              },
              params: {
                trainingRecordId: '1',
              },
            },
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
      getByText,
      getAllByText,
      getByTestId,
      queryByText,
    };
  }

  it('should render a TrainingAndQualificationsRecordComponent', async () => {
    const { component } = await setup();
    expect(component).toBeTruthy();
  });

  it('should display the worker name', async () => {
    const { component, getByText } = await setup();

    expect(getByText(component.worker.nameOrId, { exact: false })).toBeTruthy();
  });

  it('should display the worker job role', async () => {
    const { component, getByTestId } = await setup();

    expect(getByTestId('workerNameAndRole').textContent).toContain(component.worker.mainJob.title);
  });

  it('should display the other worker job role', async () => {
    const { component, getByTestId } = await setup(true);

    expect(getByTestId('workerNameAndRole').textContent).toContain(component.worker.mainJob.other);
  });
});
