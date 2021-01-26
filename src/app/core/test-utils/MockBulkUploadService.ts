import { Injectable } from '@angular/core';
import { BulkUploadService } from '@core/services/bulk-upload.service';
import { build, fake } from '@jackfranklin/test-data-bot';

const ValidatedFileBuilder = build('ValidatedFile', {
  fields: {
    errors: 0,
    filename: fake((f) => f.lorem.sentence()),
    fileType: 'Establishment',
    key: fake((f) => f.lorem.sentence()),
    records: 10,
    size: 100,
    uploaded: '',
    warnings: 2,
    username: 'user',
  },
});

export const TrainingFile = ValidatedFileBuilder({
  overrides: {
    fileType: 'Training',
  },
});

export const EstablishmentFile = ValidatedFileBuilder();

export const WorkerFile = ValidatedFileBuilder({
  overrides: {
    fileType: 'Worker',
  },
});
export const OtherFile = ValidatedFileBuilder({
  overrides: {
    fileType: 'CSV',
  },
});

@Injectable()
export class MockBulkUploadService extends BulkUploadService {}
