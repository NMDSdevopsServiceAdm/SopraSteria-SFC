import { provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { ActivatedRouteSnapshot, provideRouter, RouterModule } from '@angular/router';
import { CqcStatusChangeService } from '@core/services/cqc-status-change.service';
import { AdminModule } from '@features/admin/admin.module';

import { GetIndividualCqcMainServiceChangeResolver } from './get-individual-cqc-main-service-change.resolver';
import { provideHttpClient } from '@angular/common/http';

describe('GetIndividualCqcMainServiceChangeResolver', () => {
  let resolver: GetIndividualCqcMainServiceChangeResolver;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [AdminModule, RouterModule],
      providers: [
        GetIndividualCqcMainServiceChangeResolver,
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
      ],
    });
    resolver = TestBed.inject(GetIndividualCqcMainServiceChangeResolver);
  });

  it('should be created', () => {
    expect(resolver).toBeTruthy();
  });

  it('should call getIndividualCqcStatusChange with uid in route', () => {
    const cqcStatusChangeService = TestBed.inject(CqcStatusChangeService);
    spyOn(cqcStatusChangeService, 'getIndividualCqcStatusChange').and.callThrough();

    const mockRoute = {
      url: [{ path: 'sfcadmin' }, { path: 'cqc-status-changes' }, { path: 'mockUid' }],
    } as ActivatedRouteSnapshot;

    resolver.resolve(mockRoute);

    expect(cqcStatusChangeService.getIndividualCqcStatusChange).toHaveBeenCalledWith('mockUid');
  });
});
