import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Params } from '@angular/router';
import { QualificationsByGroup } from '@core/model/qualification.model';
import { MultipleTrainingResponse } from '@core/model/training.model';
import { URLStructure } from '@core/model/url.model';
import { Worker, WorkerEditResponse, WorkersResponse } from '@core/model/worker.model';
import { WorkerService } from '@core/services/worker.service';
import { build, fake, oneOf, perBuild, sequence } from '@jackfranklin/test-data-bot';
import { Observable, of } from 'rxjs';

export const workerBuilder = build('Worker', {
  fields: {
    id: sequence(),
    uid: fake((f) => f.datatype.uuid()),
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
      hours: fake((f) => f.datatype.number()),
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
    wdfEligible: perBuild(() => false),
    trainingCount: 0,
    expiredTrainingCount: 0,
    expiringTrainingCount: 0,
    missingMandatoryTrainingCount: 0,
    qualificationCount: 0,
    longTermAbsence: null,
    completed: perBuild(() => false),
    ethnicity: {
      ethnicityId: 1,
      ethnicity: 'white ethnicity 1',
    },
  },
});

const worker = workerBuilder();

export const workerWithExpiringTraining = workerBuilder({
  overrides: {
    nameOrId: 'Alice',
    expiredTrainingCount: 0,
    expiringTrainingCount: 2,
    missingMandatoryTrainingCount: 0,
    qualificationCount: 0,
    trainingAlert: 0,
    trainingCount: 1,
  },
});

export const workerWithExpiredTraining = workerBuilder({
  overrides: {
    nameOrId: 'Ben',
    expiredTrainingCount: 3,
    expiringTrainingCount: 0,
    missingMandatoryTrainingCount: 0,
    qualificationCount: 0,
    trainingAlert: 0,
    trainingCount: 0,
  },
});

export const workerWithOneExpiringTraining = workerBuilder({
  overrides: {
    nameOrId: 'Carl',
    expiredTrainingCount: 0,
    expiringTrainingCount: 1,
    missingMandatoryTrainingCount: 0,
    qualificationCount: 0,
    trainingAlert: 1,
    trainingCount: 3,
  },
});

export const workerWithMissingTraining = workerBuilder({
  overrides: {
    nameOrId: 'Darlyn',
    expiredTrainingCount: 0,
    expiringTrainingCount: 0,
    missingMandatoryTrainingCount: 2,
    qualificationCount: 0,
    trainingAlert: 2,
    trainingCount: 0,
  },
});

export const workerWithUpToDateTraining = workerBuilder({
  overrides: {
    nameOrId: 'Ellie',
    expiredTrainingCount: 0,
    expiringTrainingCount: 0,
    missingMandatoryTrainingCount: 0,
    qualificationCount: 0,
    trainingAlert: 0,
    trainingCount: 1,
  },
});

export const longTermAbsentWorker = workerBuilder({
  overrides: {
    nameOrId: 'John',
    longTermAbsence: 'Illness',
  },
});

export const AllWorkers = [
  {
    nameOrId: worker.nameOrId,
    uid: '1234',
    trainingCount: 1,
    trainingLastUpdated: '2020-01-01T00:00:00Z',
    mainJob: {
      jobId: 8,
      other: null,
    },
  },
  {
    nameOrId: worker.nameOrId,
    uid: '5678',
    trainingCount: 1,
    trainingLastUpdated: '2020-01-01T00:00:00Z',
    mainJob: {
      jobId: 8,
      other: null,
    },
  },
  {
    nameOrId: worker.nameOrId,
    uid: '4321',
    trainingCount: 1,
    trainingLastUpdated: '2020-01-01T00:00:00Z',
    mainJob: {
      jobId: 8,
      other: null,
    },
  },
] as Worker[];

export const getAllWorkersResponse = { workers: AllWorkers, workerCount: AllWorkers.length };

export const qualificationsByGroup = {
  count: 3,
  lastUpdated: new Date('2020-01-02'),
  groups: [
    {
      group: 'Health',
      records: [
        {
          year: 2020,
          notes: 'This is a test note for the first row in the Health group',
          title: 'Health qualification',
          uid: 'firstHealthQualUid',
        },
      ],
    },
    {
      group: 'Certificate',
      records: [
        {
          year: 2021,
          notes: 'Test notes needed',
          title: 'Cert qualification',
          uid: 'firstCertificateUid',
        },
        {
          year: 2012,
          notes: 'These are some more notes in the second row of the cert table',
          title: 'Another name for qual',
          uid: 'secondCertificateUid',
        },
      ],
    },
  ],
} as QualificationsByGroup;

export const trainingRecord = {
  id: 10,
  uid: 'someTrainingUid',
  workerUid: '6787fgfghfghghjjg',
  created: '01/02/2020',
  updated: '01/02/2020',
  updatedBy: 'admin',
  trainingCategory: { id: 1, category: 'Communication' },
  title: 'Communication Training 1',
  accredited: true,
  completed: '01/02/2020',
  expires: '01/02/2021',
};

export const qualificationRecord = {
  uid: '1234-5678',
  created: '01/01/2021',
  updated: '01/02/2021',
  updatedBy: 'user',
  qualification: {
    id: 1,
    group: 'Degree',
    title: 'Health Care Degree',
  },
  year: 2021,
  notes: 'Notes',
};

@Injectable()
export class MockWorkerService extends WorkerService {
  public _worker;

  public static factory(worker: Worker) {
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

  getAllWorkers(establishmentUid: string, queryParams?: Params): Observable<WorkersResponse> {
    return of(getAllWorkersResponse);
  }

  createMultipleTrainingRecords(): Observable<MultipleTrainingResponse> {
    return of({ savedRecords: 1 } as MultipleTrainingResponse);
  }

  getLongTermAbsenceReasons(): Observable<Array<string>> {
    return of(['Maternity leave', 'Paternity leave', 'Illness', 'Injury', 'Other']);
  }
}

@Injectable()
export class MockWorkerServiceWithUpdateWorker extends MockWorkerService {
  public static factory(worker: Worker) {
    return (httpClient: HttpClient) => {
      const service = new MockWorkerServiceWithUpdateWorker(httpClient);
      if (worker) {
        service.worker = worker;
        service.worker$ = of(worker as Worker);
      }
      return service;
    };
  }

  updateWorker(workplaceUid: string, workerId: string, props): Observable<WorkerEditResponse> {
    return of({ uid: '1' } as WorkerEditResponse);
  }
}

@Injectable()
export class MockWorkerServiceWithoutReturnUrl extends MockWorkerServiceWithUpdateWorker {
  public static factory(worker: Worker) {
    return (httpClient: HttpClient) => {
      const service = new MockWorkerServiceWithoutReturnUrl(httpClient);
      if (worker) {
        service.worker = worker;
        service.worker$ = of(worker as Worker);
      }
      return service;
    };
  }

  public get returnTo(): URLStructure {
    return;
  }
}
