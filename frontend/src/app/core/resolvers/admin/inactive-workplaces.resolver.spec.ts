import { provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { ActivatedRouteSnapshot, provideRouter, RouterModule } from '@angular/router';
import { EmailCampaignService } from '@core/services/admin/email-campaign.service';

import { InactiveWorkplacesResolver } from './inactive-workplaces.resolver';
import { provideHttpClient } from '@angular/common/http';

describe('InactiveWorkplacesResolver', () => {
  let resolver: InactiveWorkplacesResolver;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [RouterModule],
      providers: [
        InactiveWorkplacesResolver,
        EmailCampaignService,
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
      ],
    });
    resolver = TestBed.inject(InactiveWorkplacesResolver);
  });

  it('should be created', () => {
    expect(resolver).toBeTruthy();
  });

  it('should resolve', () => {
    const emailCampaignService = TestBed.inject(EmailCampaignService);
    spyOn(emailCampaignService, 'getInactiveWorkplaces').and.callThrough();

    resolver.resolve({} as ActivatedRouteSnapshot);

    expect(emailCampaignService.getInactiveWorkplaces).toHaveBeenCalled();
  });
});
