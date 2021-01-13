import { Injectable } from '@angular/core';
import { BulkUploadService } from '@core/services/bulk-upload.service';

const { build, fake } = require('@jackfranklin/test-data-bot');

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

export const ValidatedFile = ValidatedFileBuilder();

@Injectable()
export class MockBulkUploadService extends BulkUploadService {
  // public getUploadedFiles(establishmentUid, requiredTiles): Observable<BenchmarksResponse> {
  //   return of(benchmarksData);
  // }
  // public getAllRankingData(establishmentUid): Observable<AllRankingsResponse> {
  //   return of(allRankingsData);
  // }
}
