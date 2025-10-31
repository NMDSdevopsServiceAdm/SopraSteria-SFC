import { provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { ActivatedRouteSnapshot, provideRouter, RouterModule } from '@angular/router';
import { ParentRequestsService } from '@core/services/parent-requests.service';
import { AdminModule } from '@features/admin/admin.module';

import { GetIndividualParentRequestResolver } from './get-parent-individual-request.resolver';
import { provideHttpClient } from '@angular/common/http';

describe('GetIndividualParentRequestResolver', () => {
  let resolver: GetIndividualParentRequestResolver;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [AdminModule, RouterModule],
      providers: [
        GetIndividualParentRequestResolver,
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
      ],
    });
    resolver = TestBed.inject(GetIndividualParentRequestResolver);
  });

  it('should be created', () => {
    expect(resolver).toBeTruthy();
  });

  it('should call getIndividualParentRequest with uid in route', () => {
    const parentRequestsService = TestBed.inject(ParentRequestsService);
    spyOn(parentRequestsService, 'getIndividualParentRequest').and.callThrough();

    const mockRoute = {
      url: [{ path: 'sfcadmin' }, { path: 'parent-requests' }, { path: 'mockUid' }],
    } as ActivatedRouteSnapshot;

    resolver.resolve(mockRoute);

    expect(parentRequestsService.getIndividualParentRequest).toHaveBeenCalledWith('mockUid');
  });
});
