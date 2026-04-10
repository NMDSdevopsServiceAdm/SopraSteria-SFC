import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, provideRouter, RouterModule, RouterStateSnapshot, UrlTree } from '@angular/router';
import { WorkplaceSleepInsGuard } from './workplace-sleep-ins.guard';
import { EstablishmentService } from '@core/services/establishment.service';
import { MockEstablishmentServiceWithOverrides } from '@core/test-utils/MockEstablishmentService';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';

describe('WorkplaceSleepInsGuard', () => {
  const setup = async (overrides: any = {}) => {
    TestBed.configureTestingModule({
      imports: [RouterModule],
      providers: [
        WorkplaceSleepInsGuard,
        {
          provide: EstablishmentService,
          useFactory: MockEstablishmentServiceWithOverrides.factory(overrides.establishmentService ?? {}),
        },
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    });

    const guard = TestBed.inject(WorkplaceSleepInsGuard);

    const establishmentService = TestBed.inject(EstablishmentService);

    const route = TestBed.inject(ActivatedRoute).snapshot;

    return { guard, route, establishmentService };
  };

  const mockRouterStateSnapshot = {
    url: '/workplace/mock-workplace-uid/workplace-data/add-workplace-details/how-do-you-pay-for-sleep-ins',
  } as RouterStateSnapshot;

  it('should be created', async () => {
    const { guard } = await setup();
    expect(guard).toBeTruthy();
  });

  it('should return true when the workplace offer sleep-ins', async () => {
    const { guard, route } = await setup({
      establishmentService: { establishment: { offerSleepIn: 'Yes' } },
    });

    const result = await guard.canActivate(route, mockRouterStateSnapshot);

    expect(result).toEqual(true);
  });

  ['No', "Don't know", null].forEach((answer) => {
    it(`should redirect user to workplace offer sleep-ins question when the answer is ${answer}`, async () => {
      const { guard, route } = await setup({
        establishmentService: { establishment: { offerSleepIn: answer } },
      });

      const result = await guard.canActivate(route, mockRouterStateSnapshot);

      expect(result).toBeInstanceOf(UrlTree);

      expect(result.toString()).toEqual(
        '/workplace/mock-workplace-uid/workplace-data/add-workplace-details/workplace-offer-sleep-ins',
      );
    });
  });
});
