import { Injectable } from '@angular/core';
import { Worker } from '@core/model/worker.model';
import { WorkerService } from '@core/services/worker.service';
import { Observable, of } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { URLStructure } from '@core/model/url.model';

const { build, fake, sequence, oneOf } = require('@jackfranklin/test-data-bot');

export const workerBuilder = build('Worker', {
  fields: {
    id: sequence(),
    uid: fake((f) => f.random.uuid()),
    nameOrId: fake((f) => f.name.findName()),
    mainJob: {
      id: sequence(),
      title: fake((f) => f.lorem.sentence()),
      other: null,
    },
    contract: oneOf('Permanent', 'Temporary', 'Pool or Bank', 'Agency', 'Other'),
    localIdentifier: fake((f) => f.name.findName()),
    zeroHoursContract: oneOf('Yes', 'No', "Don't know"),
    weeklyHoursAverage: null,
    weeklyHoursContracted: {
      value: 'Yes',
      hours: fake((f) => f.random.number()),
    },
    annualHourlyPay: {
      value: 'Hourly',
      rate: 8.98,
    },
    careCertificate: 'Yes',
    apprenticeshipTraining: null,
    qualificationInSocialCare: 'Yes',
    otherQualification: 'No',
    highestQualification: null,
    registeredNurse: 'Yes',
    socialCareQualification: {
      qualificationId: 1,
    },
    nurseSpecialism: null,
    wdfEligible: false,
    trainingCount: 0,
    expiredTrainingCount: 0,
    expiringTrainingCount: 0,
    missingMandatoryTrainingCount: 0,
    qualificationCount: 0,
    fluJab: null,
  },
});

const worker = workerBuilder();

@Injectable()
export class MockWorkerService extends WorkerService {
  private _worker;

  public static factory(worker) {
    return (httpClient: HttpClient) => {
      const service = new MockWorkerService(httpClient);
      if (worker) {
        service.worker = worker;
        service.worker$ = of(worker as Worker);
      }
      return service;
    };
  }

  public get worker() {
    return this._worker;
  }

  public set worker(val) {
    this._worker = val;
  }

  public get returnTo(): URLStructure {
    return {
      url: ['/dashboard'],
      fragment: 'workplace',
    };
  }

  public worker$ = of(worker as Worker);
  public workers$ = of([
    {
      nameOrId: worker.nameOrId,
      trainingCount: 1,
      trainingLastUpdated: '2020-01-01T00:00:00Z',
      mainJob: {
        jobId: 8,
        other: null,
      },
    },
  ] as Worker[]);

  getAllWorkers(establishmentUid: string): Observable<Worker[]> {
    return of([
      {
        nameOrId: worker.nameOrId,
        trainingCount: 1,
        trainingLastUpdated: '2020-01-01T00:00:00Z',
        mainJob: {
          jobId: 8,
          other: null,
        },
      },
    ] as Worker[]);
  }
}
