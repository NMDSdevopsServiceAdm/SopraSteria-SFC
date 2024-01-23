import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { BulkUploadTopTipsService } from '@core/services/bulk-upload/bulk-upload-top-tips.service';

import { BulkUploadTopTipsListResolver } from './bulk-upload-top-tips-list.resolver';

describe('BulkUploadTopTipsListResolver', () => {
  let resolver: BulkUploadTopTipsListResolver;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, RouterTestingModule.withRoutes([])],
      providers: [BulkUploadTopTipsListResolver],
    });
    resolver = TestBed.inject(BulkUploadTopTipsListResolver);
  });

  it('should be created', () => {
    expect(resolver).toBeTruthy();
  });

  it('should resolve', () => {
    const bulkUploadTopTipsService = TestBed.inject(BulkUploadTopTipsService);
    spyOn(bulkUploadTopTipsService, 'getTopTipsTitles').and.callThrough();

    resolver.resolve();

    expect(bulkUploadTopTipsService.getTopTipsTitles).toHaveBeenCalled();
  });
});
