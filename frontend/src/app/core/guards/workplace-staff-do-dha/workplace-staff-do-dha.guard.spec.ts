import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, provideRouter, RouterStateSnapshot, UrlTree } from '@angular/router';
import { WorkplaceStaffDoDHAGuard } from './workplace-staff-do-dha.guard';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { EstablishmentService } from '@core/services/establishment.service';
import {

  MockEstablishmentServiceWithOverrides,
} from '@core/test-utils/MockEstablishmentService';

describe('WorkplaceStaffDoDHAGuard', () => {
  const setup = async (overrides: any = {}) => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        WorkplaceStaffDoDHAGuard,
        {
          provide: EstablishmentService,
          useFactory: MockEstablishmentServiceWithOverrides.factory(overrides.establishmentService ?? {}),
        },
        provideRouter([]),
      ],
    });

    const guard = TestBed.inject(WorkplaceStaffDoDHAGuard);

    const establishmentService = TestBed.inject(EstablishmentService);

    const route = TestBed.inject(ActivatedRoute).snapshot;

    return { guard, route, establishmentService };
  };

  const mockRouterStateSnapshot = {
    url: '/workplace/mock-workplace-uid/what-kind-of-delegated-healthcare-activities',
  } as RouterStateSnapshot;

  it('should be created', async () => {
    const { guard } = await setup();
    expect(guard).toBeTruthy();
  });

  it('should return true when the workplace staff do DHA', async () => {
    const { guard, route } = await setup({ establishmentService: { establishment: {staffDoDelegatedHealthcareActivities: "Yes"} }});

    const result = await guard.canActivate(route, mockRouterStateSnapshot);

    expect(result).toEqual(true);
  });

  ["Don't know", null].forEach((answer) => {
    it(`should redirect user to staff do DHA question when the answer is not ${answer}`, async () => {
    const { guard, route } = await setup({ establishmentService: { establishment: {staffDoDelegatedHealthcareActivities: answer} }});

    const result = await guard.canActivate(route, mockRouterStateSnapshot);

    expect(result).toBeInstanceOf(UrlTree);
    expect(result.toString()).toEqual('/workplace/mock-workplace-uid/staff-do-delegated-healthcare-activities');
  });
  })
});
