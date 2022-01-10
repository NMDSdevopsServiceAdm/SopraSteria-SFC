import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { BulkUploadTopTipsService } from '@core/services/bulk-upload/bulk-upload-top-tips.service';

import { BulkUploadTopTipsTitlesResolver } from './bulk-upload-top-tips-titles.resolver';

fdescribe('BulkUploadTopTipsTitlesResolver', () => {
  let resolver: BulkUploadTopTipsTitlesResolver;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, RouterTestingModule.withRoutes([])],
      providers: [BulkUploadTopTipsTitlesResolver],
    });
    resolver = TestBed.inject(BulkUploadTopTipsTitlesResolver);
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
