import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { ActivatedRouteSnapshot } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { ParentRequestsService } from '@core/services/parent-requests.service';
import { AdminModule } from '@features/admin/admin.module';

import { GetIndividualParentRequestResolver } from './get-parent-individual-request.resolver';

describe('GetIndividualParentRequestResolver', () => {
  let resolver: GetIndividualParentRequestResolver;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [AdminModule, HttpClientTestingModule, RouterTestingModule.withRoutes([])],
      providers: [GetIndividualParentRequestResolver],
    });
    resolver = TestBed.inject(GetIndividualParentRequestResolver);
  });

  it('should be created', () => {
    expect(resolver).toBeTruthy();
  });

  it('should call getIndividualCqcStatusChange with uid in route', () => {
    const parentRequestsService = TestBed.inject(ParentRequestsService);
    spyOn(parentRequestsService, 'getIndividualParentRequest').and.callThrough();

    const mockRoute = {
      url: [{ path: 'sfcadmin' }, { path: 'parent-requests' }, { path: 'mockUid' }],
    } as ActivatedRouteSnapshot;

    resolver.resolve(mockRoute);

    expect(parentRequestsService.getIndividualParentRequest).toHaveBeenCalledWith('mockUid');
  });
});
