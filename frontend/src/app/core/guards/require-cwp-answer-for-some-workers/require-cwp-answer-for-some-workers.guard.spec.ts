import { of } from 'rxjs';

import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, CanActivateFn, provideRouter, RouterStateSnapshot, UrlTree } from '@angular/router';
import { CareWorkforcePathwayService } from '@core/services/care-workforce-pathway.service';
import { EstablishmentService } from '@core/services/establishment.service';
import { MockCareWorkforcePathwayService } from '@core/test-utils/MockCareWorkforcePathwayService';
import { MockEstablishmentService } from '@core/test-utils/MockEstablishmentService';
import { MockParentSubsidiaryViewService } from '@core/test-utils/MockParentSubsidiaryViewService';
import { ParentSubsidiaryViewService } from '@shared/services/parent-subsidiary-view.service';

import { RequireCWPAnswerForSomeWorkersGuard } from './require-cwp-answer-for-some-workers.guard';

describe('RequireCWPAnswerForSomeWorkersGuard', () => {
  const setup = async (overrides: any = {}) => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        { provide: CareWorkforcePathwayService, useClass: MockCareWorkforcePathwayService },
        { provide: EstablishmentService, useClass: MockEstablishmentService },
        { provide: ParentSubsidiaryViewService, useClass: MockParentSubsidiaryViewService },
        provideRouter([]),
      ],
    });

    const establishmentService = TestBed.inject(EstablishmentService);
    const careWorkforcePathwayService = TestBed.inject(CareWorkforcePathwayService);
    const parentSubsidiaryViewService = TestBed.inject(ParentSubsidiaryViewService);
    const route = TestBed.inject(ActivatedRoute).snapshot;

    const resolver: CanActivateFn = (...guardParameters) =>
      TestBed.runInInjectionContext(() => RequireCWPAnswerForSomeWorkersGuard(...guardParameters));

    if (overrides.isViewingSubAsParent) {
      establishmentService.establishment.uid = 'mock-subsidiary-uid';
      spyOn(parentSubsidiaryViewService, 'getViewingSubAsParent').and.returnValue(true);
      spyOn(parentSubsidiaryViewService, 'getSubsidiaryUid').and.returnValue('mock-subsidiary-uid');
    } else {
      spyOn(parentSubsidiaryViewService, 'getViewingSubAsParent').and.returnValue(false);
    }

    return { resolver, route, establishmentService, careWorkforcePathwayService, parentSubsidiaryViewService };
  };

  const mockRouterStateSnapshot = {} as RouterStateSnapshot;

  it('should be created', async () => {
    const { resolver } = await setup();
    expect(resolver).toBeTruthy();
  });

  it('should return true when some workers still require answer for CWP Role Category question', async () => {
    const { resolver, route, establishmentService, careWorkforcePathwayService } = await setup();

    const cwpServiceSpy = spyOn(careWorkforcePathwayService, 'getNoOfWorkersWhoRequireCareWorkforcePathwayRoleAnswer');
    cwpServiceSpy.and.returnValue(of({ noOfWorkersWhoRequireAnswers: 2 }));

    const result = await resolver(route, mockRouterStateSnapshot);

    expect(cwpServiceSpy).toHaveBeenCalledWith(establishmentService.establishment.uid);
    expect(result).toEqual(true);
  });

  it('should redirect to dashboard home tab when every worker has got the CWP question answered', async () => {
    const { resolver, route, establishmentService, careWorkforcePathwayService } = await setup({
      isViewingSubAsParent: false,
    });

    const cwpServiceSpy = spyOn(careWorkforcePathwayService, 'getNoOfWorkersWhoRequireCareWorkforcePathwayRoleAnswer');
    cwpServiceSpy.and.returnValue(of({ noOfWorkersWhoRequireAnswers: 0 }));

    const result = await resolver(route, mockRouterStateSnapshot);

    expect(cwpServiceSpy).toHaveBeenCalledWith(establishmentService.establishment.uid);
    expect(result).toBeInstanceOf(UrlTree);
    expect(result.toString()).toEqual('/dashboard#home');
  });

  it('should redirect to subsidiary dashboard home tab when every worker has got the CWP question answered and viewing sub as parent', async () => {
    const { resolver, route, careWorkforcePathwayService } = await setup({ isViewingSubAsParent: true });

    const cwpServiceSpy = spyOn(careWorkforcePathwayService, 'getNoOfWorkersWhoRequireCareWorkforcePathwayRoleAnswer');
    cwpServiceSpy.and.returnValue(of({ noOfWorkersWhoRequireAnswers: 0 }));

    const result = await resolver(route, mockRouterStateSnapshot);

    expect(cwpServiceSpy).toHaveBeenCalledWith('mock-subsidiary-uid');
    expect(result).toBeInstanceOf(UrlTree);
    expect(result.toString()).toEqual('/subsidiary/mock-subsidiary-uid/home');
  });
});
