import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { ActivatedRouteSnapshot } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { CqcStatusChangeService } from '@core/services/cqc-status-change.service';
import { AdminModule } from '@features/admin/admin.module';

import { GetIndividualCqcMainServiceChangeResolver } from './get-individual-cqc-main-service-change.resolver';

describe('GetIndividualCqcMainServiceChangeResolver', () => {
  let resolver: GetIndividualCqcMainServiceChangeResolver;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [AdminModule, HttpClientTestingModule, RouterTestingModule.withRoutes([])],
      providers: [GetIndividualCqcMainServiceChangeResolver],
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
