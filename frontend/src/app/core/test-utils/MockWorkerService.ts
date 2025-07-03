import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Params } from '@angular/router';
import { QualificationsByGroup, QualificationType } from '@core/model/qualification.model';
import {
  CreateTrainingRecordResponse,
  MultipleTrainingResponse,
  TrainingRecordRequest,
} from '@core/model/training.model';
import { URLStructure } from '@core/model/url.model';
import { Worker, WorkerEditResponse, WorkersResponse } from '@core/model/worker.model';
import { NewWorkerMandatoryInfo, Reason, WorkerService } from '@core/services/worker.service';
import { build, fake, oneOf, perBuild, sequence } from '@jackfranklin/test-data-bot';
import { Observable, of } from 'rxjs';

import { AvailableQualificationsResponse } from '../model/qualification.model';

export const workerBuilder = build('Worker', {
  fields: {
    id: sequence(),
    uid: fake((f) => f.datatype.uuid()),
    nameOrId: fake((f) => f.name.findName()),
    mainJob: {
      id: sequence(),
      jobRoleName: fake((f) => f.lorem.sentence()),
      title: fake((f) => f.lorem.sentence()),
      other: null,
    },
    contract: oneOf('Permanent', 'Temporary', 'Pool or Bank', 'Agency', 'Other'),
    localIdentifier: fake((f) => f.name.findName()),
    zeroHoursContract: oneOf('Yes', 'No', "Don't know"),
    weeklyHoursAverage: null,
    weeklyHoursContracted: {
      value: 'Yes',
      hours: '75',
    },
    annualHourlyPay: {
      value: 'Hourly',
      rate: 8.98,
    },
    careCertificate: 'Yes',
    level2CareCertificate: {
      value: 'Yes, completed',
      year: 2023,
    },
    apprenticeshipTraining: null,
    qualificationInSocialCare: 'No',
    otherQualification: 'Yes',
    highestQualification: null,
    registeredNurse: 'Yes',
    socialCareQualification: {
      qualificationId: 1,
    },
    nurseSpecialism: null,
    wdfEligible: perBuild(() => false),
    wdf: {
      isEligible: perBuild(() => false),
    },
    trainingCount: 0,
    expiredTrainingCount: 0,
    expiringTrainingCount: 0,
    missingMandatoryTrainingCount: 0,
    qualificationCount: 0,
    longTermAbsence: null,
    completed: perBuild(() => false),
    created: new Date('2020-03-31'),
    ethnicity: {
      ethnicityId: 1,
      ethnicity: 'white ethnicity 1',
    },
    countryOfBirth: {
      value: 'United Kingdom',
    },
    nationality: { value: null },
    britishCitizenship: null,
    updated: '2024-05-01T06:50:45.882Z',
    careWorkforcePathwayRoleCategory: null,
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

export const workerWithWdf = () => {
  return workerBuilder({
    overrides: {
      wdfEligible: perBuild(() => true),
      wdf: {
        isEligible: true,
        mainJobStartDate: { isEligible: true, updatedSinceEffectiveDate: true },
        daysSick: { isEligible: true, updatedSinceEffectiveDate: true },
        zeroHoursContract: { isEligible: true, updatedSinceEffectiveDate: true },
        weeklyHoursContracted: { isEligible: true, updatedSinceEffectiveDate: true },
        weeklyHoursAverage: { isEligible: true, updatedSinceEffectiveDate: true },
        annualHourlyPay: { isEligible: true, updatedSinceEffectiveDate: true },
        mainJob: { isEligible: true, updatedSinceEffectiveDate: true },
        contract: { isEligible: true, updatedSinceEffectiveDate: true },
        socialCareQualification: { isEligible: true, updatedSinceEffectiveDate: true },
        qualificationInSocialCare: { isEligible: true, updatedSinceEffectiveDate: true },
        careCertificate: { isEligible: true, updatedSinceEffectiveDate: true },
        otherQualification: { isEligible: true, updatedSinceEffectiveDate: true },
        highestQualification: { isEligible: true, updatedSinceEffectiveDate: true },
        gender: { isEligible: true, updatedSinceEffectiveDate: true },
        nationality: { isEligible: true, updatedSinceEffectiveDate: true },
        dateOfBirth: { isEligible: true, updatedSinceEffectiveDate: true },
        recruitedFrom: { isEligible: true, updatedSinceEffectiveDate: true },
      },
    },
  });
};

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

export const qualificationsByGroup = Object.freeze({
  count: 3,
  lastUpdated: new Date('2020-01-02'),
  groups: [
    {
      group: QualificationType.Award,
      records: [
        {
          year: 2020,
          notes: 'This is a test note for the first row in the Award group',
          title: 'Award qualification',
          uid: 'firstAwardQualUid',
          qualificationCertificates: [],
        },
      ],
    },
    {
      group: QualificationType.Certificate,
      records: [
        {
          year: 2021,
          notes: 'Test notes needed',
          title: 'Cert qualification',
          uid: 'firstCertificateUid',
          qualificationCertificates: [],
        },
        {
          year: 2012,
          notes: 'These are some more notes in the second row of the cert table',
          title: 'Another name for qual',
          uid: 'secondCertificateUid',
          qualificationCertificates: [],
        },
      ],
    },
  ],
}) as QualificationsByGroup;

export const mockAvailableQualifications: AvailableQualificationsResponse[] = [
  {
    type: QualificationType.NVQ,
    count: 2,
    qualifications: [
      {
        id: 93,
        title: 'Care NVQ (level 2)',
        level: '2',
        code: 4,
      },
      {
        id: 94,
        title: 'Care NVQ (level 3)',
        level: '3',
        code: 5,
      },
    ],
  },
  {
    type: QualificationType.Certificate,
    count: 2,
    qualifications: [
      {
        id: 30,
        title: 'Activity provision in social care (level 3)',
        level: '3',
        code: 42,
      },
      {
        id: 31,
        title: 'Adult care (level 4)',
        level: '4',
        code: 110,
      },
    ],
  },
  {
    type: QualificationType.Degree,
    count: 2,
    qualifications: [
      {
        id: 71,
        title: 'Combined nursing and social work degree (level 6)',
        level: '6',
        code: 18,
      },
      {
        id: 136,
        title: 'Health and social care degree (level 6)',
        level: '6',
        code: 144,
      },
    ],
  },
  {
    type: QualificationType.Award,
    count: 2,
    qualifications: [
      {
        id: 1,
        title: 'Advanced Award in Social Work (AASW, level 7)',
        level: '7',
        code: 20,
      },
      {
        id: 5,
        title: 'Awareness of dementia (level 3)',
        level: '3',
        code: 49,
        from: '2010-09-01',
      },
    ],
  },
  {
    type: QualificationType.Diploma,
    count: 1,
    qualifications: [
      {
        id: 74,
        title: 'Adult care (level 4)',
        level: '4',
        code: 109,
      },
    ],
  },
  {
    type: QualificationType.Apprenticeship,
    count: 3,
    qualifications: [
      {
        id: 121,
        title: 'Adult care worker (standard, level 2)',
        level: '2',
        code: 302,
      },
      {
        id: 124,
        title: 'Degree registered nurse (standard, level 6)',
        level: '6',
        code: 310,
      },
    ],
  },
  {
    type: QualificationType.Other,
    count: 2,
    qualifications: [
      {
        id: 113,
        title: 'Other relevant professional qualification',
        level: null,
        code: 33,
      },
      {
        id: 119,
        title: 'Other qualification',
        level: null,
        code: 39,
      },
    ],
  },
];

export const mockLeaveReasons: Reason[] = [
  { id: 1, reason: 'The worker moved to another adult social care employer' },
  { id: 2, reason: 'The worker moved to a role in the health sector' },
  { id: 3, reason: 'The worker moved to a different sector (for example, retail)' },
  { id: 4, reason: 'The worker moved to a different role in this organisation' },
  { id: 5, reason: 'The worker chose to leave (destination unknown)' },
  { id: 6, reason: 'The worker retired' },
  { id: 7, reason: 'The worker had their employment terminated' },
  { id: 8, reason: 'For a reason not listed' },
  { id: 9, reason: 'Reason not known' },
];

export const trainingRecord = {
  id: 10,
  uid: 'someTrainingUid',
  workerUid: '6787fgfghfghghjjg',
  created: '01/02/2020',
  updated: '01/02/2020',
  updatedBy: 'admin',
  trainingCategory: { id: 1, category: 'Communication' },
  title: 'Communication Training 1',
  accredited: 'Yes',
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
  public _alert;
  public _returnTo;
  public _addStaffRecordInProgress: boolean;
  public _totalStaffReturn: boolean;

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

  public getWorker() {
    return of(this._worker);
  }

  public set worker(val) {
    this._worker = val;
  }

  public set returnTo(returnUrl) {
    this._returnTo = returnUrl;
  }

  public setTotalStaffReturn(val) {
    this._totalStaffReturn = val;
  }

  public set addStaffRecordInProgress(value: boolean) {
    this._addStaffRecordInProgress = value;
  }

  public get addStaffRecordInProgress(): boolean {
    return this._addStaffRecordInProgress;
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

  getTrainingRecord(workplaceUid: string, workerId: string, trainingRecordId: string): Observable<any> {
    return of(trainingRecord);
  }

  updateTrainingRecord(
    workplaceUid: string,
    workerId: string,
    trainingRecordId: string,
    record: TrainingRecordRequest,
  ): Observable<TrainingRecordRequest> {
    return of(trainingRecord);
  }

  createTrainingRecord(
    workplaceUid: string,
    workerId: string,
    record: TrainingRecordRequest,
  ): Observable<CreateTrainingRecordResponse> {
    return of(trainingRecord);
  }

  getAllAvailableQualifications(
    workplaceUid: string,
    workerUid: string,
  ): Observable<AvailableQualificationsResponse[]> {
    return of(mockAvailableQualifications);
  }

  getLeaveReasons(): Observable<Reason[]> {
    return of(mockLeaveReasons);
  }

  updateWorker(workplaceUid: string, workerId: string, props): Observable<WorkerEditResponse> {
    return of({ uid: '1' } as WorkerEditResponse);
  }
}

@Injectable()
export class MockWorkerServiceWithUpdateWorker extends MockWorkerService {
  public static factory(worker: Worker = null) {
    return (httpClient: HttpClient) => {
      const service = new MockWorkerServiceWithUpdateWorker(httpClient);
      if (worker) {
        service.worker = worker;
        service.worker$ = of(worker as Worker);
      }
      return service;
    };
  }

  createWorker(workplaceUid: string, props): Observable<WorkerEditResponse> {
    return of({ uid: '1' } as WorkerEditResponse);
  }

  updateWorker(workplaceUid: string, workerId: string, props): Observable<WorkerEditResponse> {
    return of({ uid: '1' } as WorkerEditResponse);
  }
}

@Injectable()
export class MockWorkerServiceWithNoWorker extends MockWorkerService {
  public static factory(workerMandatoryInfo: NewWorkerMandatoryInfo = null) {
    return (httpClient: HttpClient) => {
      const service = new MockWorkerServiceWithNoWorker(httpClient);
      if (workerMandatoryInfo) {
        service.setNewWorkerMandatoryInfo(workerMandatoryInfo.nameOrId, workerMandatoryInfo.contract);
      }
      return service;
    };
  }
  public get worker() {
    return null;
  }

  public worker$ = of(null);
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

@Injectable()
export class MockWorkerServiceWithOverrides extends MockWorkerService {
  public static factory(overrides: any = {}) {
    return (httpClient: HttpClient) => {
      const service = new MockWorkerServiceWithOverrides(httpClient);

      Object.keys(overrides).forEach((overrideName) => {
        switch (overrideName) {
          case 'worker': {
            const worker = { ...workerBuilder(), ...overrides[overrideName] };
            service.worker = worker;
            service.worker$ = of(worker as Worker);
            break;
          }
          case 'returnTo': {
            Object.defineProperty(service, 'returnTo', {
              get: () => overrides['returnTo'],
            });
            break;
          }
          case 'totalStaffReturn': {
            Object.defineProperty(service, 'totalStaffReturn', {
              get: () => overrides['totalStaffReturn'],
            });
            break;
          }
          default: {
            service[overrideName] = overrides[overrideName];
            break;
          }
        }
      });

      return service;
    };
  }
}
