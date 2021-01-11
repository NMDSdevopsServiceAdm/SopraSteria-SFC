import { Injectable } from '@angular/core';
import { ErrorReport } from '@core/model/bulk-upload.model';
import { BulkUploadService } from '@core/services/bulk-upload.service';
import { Observable, of } from 'rxjs';

const { build, fake } = require('@jackfranklin/test-data-bot');

// const benchmarksResponseBuilder = build('BenchmarksResponse', {
//   fields: {
//   },
// });
// const allRankingsResponseBuilder = build('AllRankingsResponse', {
//   fields: {
//     pay: {
//       currentRank: fake((f) => f.random.number({ min: 1, max: 100 })),
//       maxRank: fake((f) => f.random.number({ min: 2, max: 100 })),
//       hasValue: true,
//       stateMessage: '',
//     },
//     turnover: {
//       currentRank: fake((f) => f.random.number({ min: 1, max: 100 })),
//       maxRank: fake((f) => f.random.number({ min: 2, max: 100 })),
//       hasValue: true,
//       stateMessage: '',
//     },
//     sickness: {
//       currentRank: fake((f) => f.random.number({ min: 1, max: 100 })),
//       maxRank: fake((f) => f.random.number({ min: 2, max: 100 })),
//       hasValue: true,
//       stateMessage: '',
//     },
//     qualifications: {
//       currentRank: fake((f) => f.random.number({ min: 1, max: 100 })),
//       maxRank: fake((f) => f.random.number({ min: 2, max: 100 })),
//       hasValue: true,
//       stateMessage: '',
//     },
//   },
// });

const errorReport = {
  establishments: {
    errors: [
      {
        errCode: 1100,
        errType: 'ERROR',
        error: 'WE HAVE AN ERROR',
        origin: 'Establishment',
        lineNumber: 2,
        source: '',
        name: 'SKILLS FOR CARE',
      },
    ],
    warnings: [],
  },
  workers: {
    errors: [],
    warnings: [],
  },
  training: {
    errors: [],
    warnings: [],
  },
};

@Injectable()
export class MockBulkUploadService extends BulkUploadService {
  public errorReport(establishmentUid): Observable<ErrorReport> {
    return of(errorReport);
  }
}
