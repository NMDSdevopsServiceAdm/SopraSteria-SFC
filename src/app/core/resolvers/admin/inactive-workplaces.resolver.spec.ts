import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { ActivatedRouteSnapshot } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { EmailCampaignService } from '@core/services/admin/email-campaign.service';
import { SearchModule } from '@features/search/search.module';

import { InactiveWorkplacesResolver } from './inactive-workplaces.resolver';

describe('InactiveWorkplacesResolver', () => {
  let resolver: InactiveWorkplacesResolver;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [SearchModule, HttpClientTestingModule, RouterTestingModule.withRoutes([])],
      providers: [InactiveWorkplacesResolver],
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
