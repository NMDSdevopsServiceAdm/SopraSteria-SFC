import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { BulkUploadTopTipsService } from '@core/services/bulk-upload/bulk-upload-top-tips.service';

import { BulkUploadTopTipResolver } from './bulk-upload-top-tip.resolver';

describe('BulkUploadTopTipsResolver', () => {
  let resolver: BulkUploadTopTipResolver;
  let route: ActivatedRoute;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, RouterTestingModule.withRoutes([])],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: { snapshot: { paramMap: convertToParamMap({ slug: 'topTipSlug' }) } },
        },
        BulkUploadTopTipResolver,
      ],
    });

    resolver = TestBed.inject(BulkUploadTopTipResolver);
    route = TestBed.inject(ActivatedRoute);
  });

  it('should be created', () => {
    expect(resolver).toBeTruthy();
  });

  it('should resolve', () => {
    const bulkUploadTopTipsService = TestBed.inject(BulkUploadTopTipsService);
    spyOn(bulkUploadTopTipsService, 'getTopTip').and.callThrough();

    resolver.resolve(route.snapshot);

    expect(bulkUploadTopTipsService.getTopTip).toHaveBeenCalled();
  });
});
