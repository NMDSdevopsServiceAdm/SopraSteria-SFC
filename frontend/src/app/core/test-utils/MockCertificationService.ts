import { of } from 'rxjs';

import { Injectable } from '@angular/core';
import { TrainingResponse } from '@core/model/training.model';
import { QualificationCertificateService, TrainingCertificateService } from '@core/services/certificate.service';
import { QualificationsResponse } from '@core/model/qualification.model';

const mockWorkplaceUid = 'mockWorkplaceUid';
const mockWorkerUid = 'mockWorkerUid';
const mockRecordUid = 'mockRecordUid';

export const mockCertificatesA = [
  {
    filename: 'Certificate 2023.pdf',
    uid: 'uid1',
    uploadDate: '2024-09-20T08:57:45.000Z',
  },
  {
    filename: 'Certificate 2024.pdf',
    uid: 'uid2',
    uploadDate: '2024-09-20T08:57:45.000Z',
  },
];

export const mockCertificatesB = [
  {
    filename: 'Certificate 2022.pdf',
    uid: 'uid3',
    uploadDate: '2024-09-20T08:57:45.000Z',
  },
  {
    filename: 'Certificate 2023.pdf',
    uid: 'uid4',
    uploadDate: '2024-09-20T08:57:45.000Z',
  },
];

export const mockTrainingRecordsResponse: TrainingResponse = {
  workerUid: mockWorkerUid,
  count: 3,
  lastUpdated: '2024-10-23T09:38:32.990Z',
  training: [
    //@ts-ignore
    {
      uid: 'uid-missing-mandatory-training',
      trainingCategory: { id: 11, category: 'Diabetes' },
      missing: true,
      created: new Date(),
      updated: new Date(),
      updatedBy: 'admin3',
    },
    {
      uid: 'uid-training-with-no-certs',
      trainingCategory: { id: 7, category: 'Continence care' },
      trainingCertificates: [],
      title: 'training with no certs',
      created: new Date(),
      updated: new Date(),
      updatedBy: 'admin3',
    },
    {
      uid: 'uid-training-with-certs',
      trainingCategory: { id: 1, category: 'Activity provision, wellbeing' },
      trainingCertificates: mockCertificatesA,
      title: 'Training with certs',
      created: new Date(),
      updated: new Date(),
      updatedBy: 'admin3',
    },
    {
      uid: 'uid-another-training-with-certs',
      trainingCategory: { id: 13, category: 'Duty of care' },
      trainingCertificates: mockCertificatesB,
      title: 'another training with certs',
      created: new Date(),
      updated: new Date(),
      updatedBy: 'admin3',
    },
  ],
};

export const trainingUidsWithCerts = ['uid-training-with-certs', 'uid-another-training-with-certs'];
export const trainingUidsWithoutCerts = ['uid-training-with-no-certs', 'uid-missing-mandatory-training'];

export const mockQualificationRecordsResponse: QualificationsResponse = {
  workerUid: '3fdc3fd9-4030-440c-96b5-716251cc23c8',
  count: 1,
  lastUpdated: '2024-10-23T09:38:17.469Z',
  qualifications: [
    {
      id: 1,
      uid: 'qual-with-no-certs',
      qualification: {},
      qualificationCertificates: [],
    },
    {
      id: 2,
      uid: 'qual-with-some-certs',
      qualification: {},
      qualificationCertificates: mockCertificatesA,
    },
    {
      id: 3,
      uid: 'another-qual-with-some-certs',
      qualification: {},
      qualificationCertificates: mockCertificatesB,
    },
  ],
};

export const qualificationUidsWithCerts = ['qual-with-some-certs', 'another-qual-with-some-certs'];
export const qualificationUidsWithoutCerts = ['qual-with-no-certs'];

@Injectable()
export class MockTrainingCertificateService extends TrainingCertificateService {
  protected getAllRecords(workplaceUid: string, workerUid: string) {
    return of(mockTrainingRecordsResponse.training);
  }
}

@Injectable()
export class MockQualificationCertificateService extends QualificationCertificateService {
  protected getAllRecords(workplaceUid: string, workerUid: string) {
    return of(mockQualificationRecordsResponse.qualifications);
  }
}
