import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, provideRouter, RouterStateSnapshot, UrlTree } from '@angular/router';

import { WorkplaceIsAwareOfCwpGuard } from './workplace-is-aware-of-cwp.guard';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { CareWorkforcePathwayService } from '@core/services/care-workforce-pathway.service';
import { MockCareWorkforcePathwayService } from '@core/test-utils/MockCareWorkforcePathwayService';
import { EstablishmentService } from '@core/services/establishment.service';
import { MockEstablishmentService } from '@core/test-utils/MockEstablishmentService';
import { provideHttpClient } from '@angular/common/http';

describe('WorkplaceIsAwareOfCwpGuard', () => {
  const setup = async (overrides: any = {}) => {
    TestBed.configureTestingModule({
      imports: [],
      providers: [
        WorkplaceIsAwareOfCwpGuard,
        {
          provide: CareWorkforcePathwayService,
          useFactory: MockCareWorkforcePathwayService.factory({
            isAwareOfCareWorkforcePathway: () => overrides.workplaceIsAwareOfCareWorkforcePathway ?? true,
          }),
        },
        { provide: EstablishmentService, useClass: MockEstablishmentService },
        provideRouter([]),

        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    });

    const guard = TestBed.inject(WorkplaceIsAwareOfCwpGuard);

    const establishmentService = TestBed.inject(EstablishmentService);
    const careWorkforcePathwayService = TestBed.inject(CareWorkforcePathwayService);
    const cwpServiceSpy = spyOn(careWorkforcePathwayService, 'isAwareOfCareWorkforcePathway').and.returnValue(
      overrides.workplaceIsAwareOfCareWorkforcePathway ?? true,
    );
    const route = TestBed.inject(ActivatedRoute).snapshot;

    return { guard, route, cwpServiceSpy, establishmentService };
  };

  const mockRouterStateSnapshot = {
    url: '/workplace/mock-workplace-uid/care-workforce-pathway-use',
  } as RouterStateSnapshot;

  it('should be created', async () => {
    const { guard } = await setup();
    expect(guard).toBeTruthy();
  });

  it('should return true when the workplace is aware of Care workforce pathway', async () => {
    const { guard, route, cwpServiceSpy, establishmentService } = await setup({
      workplaceIsAwareOfCareWorkforcePathway: true,
    });

    const result = await guard.canActivate(route, mockRouterStateSnapshot);

    expect(result).toEqual(true);
    expect(cwpServiceSpy).toHaveBeenCalledWith(
      establishmentService.establishment.careWorkforcePathwayWorkplaceAwareness,
    );
  });

  it('should redirect user to CWP awareness question when the workplace is not aware of that', async () => {
    const { guard, route, cwpServiceSpy, establishmentService } = await setup({
      workplaceIsAwareOfCareWorkforcePathway: false,
    });

    const result = await guard.canActivate(route, mockRouterStateSnapshot);

    expect(result).toBeInstanceOf(UrlTree);
    expect(result.toString()).toEqual('/workplace/mock-workplace-uid/care-workforce-pathway-awareness');
    expect(cwpServiceSpy).toHaveBeenCalledWith(
      establishmentService.establishment.careWorkforcePathwayWorkplaceAwareness,
    );
  });
});
