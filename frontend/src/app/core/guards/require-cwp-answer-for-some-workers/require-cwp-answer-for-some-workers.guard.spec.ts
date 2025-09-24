import { of } from 'rxjs';

import { provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, provideRouter, RouterStateSnapshot, UrlTree } from '@angular/router';
import { CareWorkforcePathwayService } from '@core/services/care-workforce-pathway.service';
import { EstablishmentService } from '@core/services/establishment.service';
import { MockCareWorkforcePathwayService } from '@core/test-utils/MockCareWorkforcePathwayService';
import { MockEstablishmentService } from '@core/test-utils/MockEstablishmentService';
import { MockParentSubsidiaryViewService } from '@core/test-utils/MockParentSubsidiaryViewService';
import { ParentSubsidiaryViewService } from '@shared/services/parent-subsidiary-view.service';

import { RequireCWPAnswerForSomeWorkersGuard } from './require-cwp-answer-for-some-workers.guard';
import { provideHttpClient } from '@angular/common/http';

describe('RequireCWPAnswerForSomeWorkersGuard', () => {
  const setup = async (overrides: any = {}) => {
    TestBed.configureTestingModule({
      imports: [],
      providers: [
        RequireCWPAnswerForSomeWorkersGuard,
        { provide: CareWorkforcePathwayService, useClass: MockCareWorkforcePathwayService },
        { provide: EstablishmentService, useClass: MockEstablishmentService },
        { provide: ParentSubsidiaryViewService, useClass: MockParentSubsidiaryViewService },
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    });

    const guard = TestBed.inject(RequireCWPAnswerForSomeWorkersGuard);

    const establishmentService = TestBed.inject(EstablishmentService);
    const careWorkforcePathwayService = TestBed.inject(CareWorkforcePathwayService);
    const parentSubsidiaryViewService = TestBed.inject(ParentSubsidiaryViewService);
    const route = TestBed.inject(ActivatedRoute).snapshot;

    const cwpServiceSpy = spyOn(careWorkforcePathwayService, 'getNoOfWorkersWhoRequireCareWorkforcePathwayRoleAnswer');
    cwpServiceSpy.and.returnValue(of({ noOfWorkersWhoRequireAnswers: overrides.noOfWorkersWhoRequireAnswers ?? 0 }));

    if (overrides.isViewingSubAsParent) {
      establishmentService.establishment.uid = 'mock-subsidiary-uid';
      spyOn(parentSubsidiaryViewService, 'getViewingSubAsParent').and.returnValue(true);
      spyOn(parentSubsidiaryViewService, 'getSubsidiaryUid').and.returnValue('mock-subsidiary-uid');
    } else {
      spyOn(parentSubsidiaryViewService, 'getViewingSubAsParent').and.returnValue(false);
    }

    return { guard, route, establishmentService, cwpServiceSpy, parentSubsidiaryViewService };
  };

  const mockRouterStateSnapshot = {} as RouterStateSnapshot;

  it('should be created', async () => {
    const { guard } = await setup();
    expect(guard).toBeTruthy();
  });

  it('should return true when some workers still require answer for CWP Role Category question', async () => {
    const { guard, route, establishmentService, cwpServiceSpy } = await setup({
      noOfWorkersWhoRequireAnswers: 2,
    });

    const result = await guard.canActivate(route, mockRouterStateSnapshot);

    expect(cwpServiceSpy).toHaveBeenCalledWith(establishmentService.establishment.uid);
    expect(result).toEqual(true);
  });

  it('should redirect to dashboard home tab when every worker has got the CWP question answered', async () => {
    const { guard, route, establishmentService, cwpServiceSpy } = await setup({
      isViewingSubAsParent: false,
      noOfWorkersWhoRequireAnswers: 0,
    });

    const result = await guard.canActivate(route, mockRouterStateSnapshot);

    expect(cwpServiceSpy).toHaveBeenCalledWith(establishmentService.establishment.uid);
    expect(result).toBeInstanceOf(UrlTree);
    expect(result.toString()).toEqual('/dashboard#home');
  });

  it('should redirect to subsidiary dashboard home tab when every worker has got the CWP question answered and viewing sub as parent', async () => {
    const { guard, route, cwpServiceSpy } = await setup({
      isViewingSubAsParent: true,
      noOfWorkersWhoRequireAnswers: 0,
    });

    const result = await guard.canActivate(route, mockRouterStateSnapshot);

    expect(cwpServiceSpy).toHaveBeenCalledWith('mock-subsidiary-uid');
    expect(result).toBeInstanceOf(UrlTree);
    expect(result.toString()).toEqual('/subsidiary/mock-subsidiary-uid/home');
  });
});
