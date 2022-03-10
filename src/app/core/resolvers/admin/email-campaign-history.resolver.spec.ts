import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { ActivatedRouteSnapshot } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { EmailCampaignService } from '@core/services/admin/email-campaign.service';
import { SearchModule } from '@features/search/search.module';

import { EmailCampaignHistoryResolver } from './email-campaign-history.resolver';

describe('EmailCampaignHistoryResolver', () => {
  let resolver: EmailCampaignHistoryResolver;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [SearchModule, HttpClientTestingModule, RouterTestingModule.withRoutes([])],
      providers: [EmailCampaignHistoryResolver],
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
