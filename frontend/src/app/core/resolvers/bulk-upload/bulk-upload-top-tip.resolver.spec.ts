import { provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, provideRouter, RouterModule } from '@angular/router';
import { BulkUploadTopTipsService } from '@core/services/bulk-upload/bulk-upload-top-tips.service';

import { BulkUploadTopTipResolver } from './bulk-upload-top-tip.resolver';
import { provideHttpClient } from '@angular/common/http';

describe('BulkUploadTopTipsResolver', () => {
  let resolver: BulkUploadTopTipResolver;
  let route: ActivatedRoute;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [RouterModule],
      providers: [
        provideRouter([]),
        {
          provide: ActivatedRoute,
          useValue: { snapshot: { paramMap: convertToParamMap({ slug: 'topTipSlug' }) } },
        },
        BulkUploadTopTipResolver,
        provideHttpClient(),
        provideHttpClientTesting(),
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
