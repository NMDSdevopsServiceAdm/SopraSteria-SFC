import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { ActivatedRouteSnapshot } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { EmailCampaignService } from '@core/services/admin/email-campaign.service';
import { SearchModule } from '@features/search/search.module';

import { EmailTemplateResolver } from './email-template.resolver';

describe('EmailTemplateResolver', () => {
  let resolver: EmailTemplateResolver;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [SearchModule, HttpClientTestingModule, RouterTestingModule.withRoutes([])],
      providers: [EmailTemplateResolver],
    });
    resolver = TestBed.inject(EmailTemplateResolver);
  });

  it('should be created', () => {
    expect(resolver).toBeTruthy();
  });

  it('should resolve', () => {
    const emailCampaignService = TestBed.inject(EmailCampaignService);
    spyOn(emailCampaignService, 'getTargetedTemplates').and.callThrough();

    resolver.resolve({} as ActivatedRouteSnapshot);

    expect(emailCampaignService.getTargetedTemplates).toHaveBeenCalled();
  });
});
