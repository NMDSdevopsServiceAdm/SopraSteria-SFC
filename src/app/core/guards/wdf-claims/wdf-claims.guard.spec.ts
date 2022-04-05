import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { GrantLetterService } from '@core/services/wdf-claims/wdf-grant-letter.service';
import { WdfGrantLetterComponent } from '@features/wdf/wdf-claims/wdf-grant-letter/wdf-grant-letter.component';

import { WdfClaimsGuard } from './wdf-claims.guard';

describe('WdfClaimsGuard', () => {
  function setup() {
    TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
        RouterTestingModule.withRoutes([{ path: 'wdf-claims/grant-letter', component: WdfGrantLetterComponent }]),
      ],
      providers: [WdfClaimsGuard, GrantLetterService],
    });

    const guard = TestBed.inject(WdfClaimsGuard) as WdfClaimsGuard;

    const router = TestBed.inject(Router) as Router;
    const routerSpy = spyOn(router, 'navigate').and.returnValue(Promise.resolve(true));

    return {
      guard,
      routerSpy,
    };
  }

  it('should create WdfClaimsGuard', () => {
    const { guard } = setup();
    expect(guard).toBeTruthy();
  });

  it('should return true if the wdfClaimInProgress is true', () => {
    const { guard, routerSpy } = setup();

    const grantLetterService = TestBed.inject(GrantLetterService) as GrantLetterService;
    grantLetterService.wdfClaimInProgress$.next(true);

    const res = guard.canActivate();

    expect(res).toBeTruthy();
    expect(routerSpy).not.toHaveBeenCalled();
  });

  it('should return false if the wdfClaimInProgress is false', () => {
    const { guard, routerSpy } = setup();

    const res = guard.canActivate();

    expect(res).toBeFalsy();
    expect(routerSpy).toHaveBeenCalledWith(['/wdf-claims/grant-letter']);
  });
});
