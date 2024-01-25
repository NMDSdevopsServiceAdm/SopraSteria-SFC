import { Injectable } from '@angular/core';
import { ErrorReport } from '@core/model/bulk-upload.model';
import { BulkUploadService } from '@core/services/bulk-upload.service';
import { build, fake } from '@jackfranklin/test-data-bot';
import { Observable, of } from 'rxjs';

const itemBuilder = build('Item', {
  fields: {
    lineNumber: fake((f) => f.datatype.number({ min: 2, max: 10 })),
    source: '',
    name: 'SKILLS FOR CARE',
  },
});

const bulkUploadErrorResponseBuilder = build('ErrorReportError', {
  fields: {
    errCode: fake((f) => f.datatype.number({ min: 1000, max: 9999 })),
    errType: 'ERROR',
    error: fake((f) => f.lorem.sentence()),
    origin: 'Establishment',
    items: [],
  },
  postBuild: (errorReportError) => {
    errorReportError.items = Array(Math.floor(Math.random() * 10) + 1)
      .fill(undefined)
      .map((_) => itemBuilder());
    return errorReportError;
  },
});

const bulkUploadWarningResponseBuilder = build('ErrorReportWarning', {
  fields: {
    warnCode: fake((f) => f.datatype.number({ min: 1000, max: 9999 })),
    warnType: 'ERROR',
    warning: fake((f) => f.lorem.sentence()),
    origin: 'Establishment',
    items: [],
  },
  postBuild: (errorReportWarning) => {
    errorReportWarning.items = Array(fake((f) => f.datatype.number({ min: 2, max: 10 })))
      .fill(undefined)
      .map((_) => itemBuilder());
    return errorReportWarning;
  },
});

const getErrorsWarnings = () => {
  const errWarn = {
    errors: [],
    warnings: [],
  };
  const timesToRunErrors = Math.random() * 100;
  const timesToRunWarnings = Math.random() * 100;
  for (let i = 0; i < timesToRunErrors; i++) {
    errWarn.errors.push(bulkUploadErrorResponseBuilder());
  }
  for (let i = 0; i < timesToRunWarnings; i++) {
    errWarn.warnings.push(bulkUploadWarningResponseBuilder());
  }
  return errWarn;
};

export const errorReport = {
  establishments: getErrorsWarnings(),
  workers: getErrorsWarnings(),
  training: getErrorsWarnings(),
};

@Injectable()
export class MockBulkUploadService extends BulkUploadService {
  public errorReport(establishmentUid): Observable<ErrorReport> {
    return of(errorReport);
  }

  public nextMissingReferencesNavigation(): string[] {
    return ['1'];
  }
}

const ValidatedFileBuilder = build('ValidatedFile', {
  fields: {
    errors: 0,
    filename: fake((f) => f.lorem.sentence()),
    fileType: null,
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

export const EstablishmentFile = ValidatedFileBuilder({
  overrides: {
    fileType: 'Establishment',
  },
});

export const WorkerFile = ValidatedFileBuilder({
  overrides: {
    fileType: 'Worker',
  },
});
export const OtherFile = ValidatedFileBuilder({
  overrides: {
    fileType: null,
  },
});
