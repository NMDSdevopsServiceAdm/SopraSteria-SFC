import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { ActivatedRouteSnapshot } from '@angular/router';
import { EmailCampaignService } from '@core/services/admin/email-campaign.service';

import { EmailCampaignHistoryResolver } from './email-campaign-history.resolver';

describe('EmailCampaignHistoryResolver', () => {
  let resolver: EmailCampaignHistoryResolver;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [],
      providers: [
        EmailCampaignHistoryResolver,
        EmailCampaignService,
        provideHttpClient(),
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    });
    resolver = TestBed.inject(EmailCampaignHistoryResolver);
  });

  it('should be created', () => {
    expect(resolver).toBeTruthy();
  });

  it('should resolve', () => {
    const emailCampaignService = TestBed.inject(EmailCampaignService);
    spyOn(emailCampaignService, 'getInactiveWorkplacesHistory').and.callThrough();

    resolver.resolve({} as ActivatedRouteSnapshot);

    expect(emailCampaignService.getInactiveWorkplacesHistory).toHaveBeenCalled();
  });
});
