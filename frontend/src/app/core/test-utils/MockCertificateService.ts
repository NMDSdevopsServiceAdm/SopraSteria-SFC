import { of } from 'rxjs';

import { Injectable } from '@angular/core';
import { TrainingResponse } from '@core/model/training.model';
import { QualificationCertificateService, TrainingCertificateService } from '@core/services/certificate.service';
import { QualificationsResponse } from '@core/model/qualification.model';
import { Certificate, CertificateDownload } from '@core/model/trainingAndQualifications.model';
import { build, fake } from '@jackfranklin/test-data-bot';

const mockWorkerUid = 'mockWorkerUid';

const certificateBuilder = build<Certificate>({
  fields: {
    filename: fake((f) => f.lorem.word() + '.pdf'),
    uid: fake((f) => f.datatype.uuid()),
    uploadDate: fake((f) => f.date.recent().toISOString()),
  },
});

const buildCertificates = (howMany: number): Certificate[] => {
  return Array(howMany).fill('').map(certificateBuilder);
};

const mockTrainingCertA = buildCertificates(1);
const mockTrainingCertsB = buildCertificates(3);
const mockQualificationCertsA = buildCertificates(1);
const mockQualificationCertsB = buildCertificates(3);
export const mockCertificateFileBlob = new Blob(['mockdata'], { type: 'application/pdf' });
export const mockTrainingCertificates = [...mockTrainingCertA, ...mockTrainingCertsB];
export const mockQualificationCertificates = [...mockQualificationCertsA, ...mockQualificationCertsB];

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
      trainingCertificates: mockTrainingCertA,
      title: 'Training with certs',
      created: new Date(),
      updated: new Date(),
      updatedBy: 'admin3',
    },
    {
      uid: 'uid-another-training-with-certs',
      trainingCategory: { id: 13, category: 'Duty of care' },
      trainingCertificates: mockTrainingCertsB,
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
      qualificationCertificates: mockQualificationCertsA,
    },
    {
      id: 3,
      uid: 'another-qual-with-some-certs',
      qualification: {},
      qualificationCertificates: mockQualificationCertsB,
    },
  ],
};

export const qualificationUidsWithCerts = ['qual-with-some-certs', 'another-qual-with-some-certs'];
export const qualificationUidsWithoutCerts = ['qual-with-no-certs'];

const mockGetCertificateDownloadUrls = (
  workplaceUid: string,
  workerUid: string,
  recordUid: string,
  filesToDownload: CertificateDownload[],
) => {
  const mockResponsePayload = filesToDownload.map((file) => ({
    filename: file.filename,
    signedUrl: `https://localhost/${file.uid}`,
  }));
  return of({ files: mockResponsePayload });
};

const mockDownloadBlobsFromBucket = (files: { signedUrl: string; filename: string }[]) => {
  return files.map((file) => of({ fileBlob: mockCertificateFileBlob, filename: file.filename }));
};

@Injectable()
export class MockTrainingCertificateService extends TrainingCertificateService {
  protected getAllRecords(workplaceUid: string, workerUid: string) {
    return of(mockTrainingRecordsResponse.training);
  }

  public getCertificateDownloadUrls = mockGetCertificateDownloadUrls;

  public downloadBlobsFromBucket = mockDownloadBlobsFromBucket;
}

@Injectable()
export class MockQualificationCertificateService extends QualificationCertificateService {
  protected getAllRecords(workplaceUid: string, workerUid: string) {
    return of(mockQualificationRecordsResponse.qualifications);
  }

  public getCertificateDownloadUrls = mockGetCertificateDownloadUrls;

  public downloadBlobsFromBucket = mockDownloadBlobsFromBucket;
}
