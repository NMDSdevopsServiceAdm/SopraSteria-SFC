import { provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { ActivatedRouteSnapshot, provideRouter, RouterModule } from '@angular/router';
import { EmailCampaignService } from '@core/services/admin/email-campaign.service';

import { EmailTemplateResolver } from './email-template.resolver';
import { provideHttpClient } from '@angular/common/http';

describe('EmailTemplateResolver', () => {
  let resolver: EmailTemplateResolver;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [RouterModule],
      providers: [
        EmailTemplateResolver,
        EmailCampaignService,
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
      ],
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
