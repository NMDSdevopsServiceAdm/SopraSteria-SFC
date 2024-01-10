import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { ActivatedRouteSnapshot } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { EmailCampaignService } from '@core/services/admin/email-campaign.service';

import { InactiveWorkplacesForDeletionResolver } from './inactive-workplaces-for-deletion.resolver';

describe('InactiveWorkplacesForDeletionResolver', () => {
  let resolver: InactiveWorkplacesForDeletionResolver;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, RouterTestingModule.withRoutes([])],
      providers: [InactiveWorkplacesForDeletionResolver, EmailCampaignService],
    });
    resolver = TestBed.inject(InactiveWorkplacesForDeletionResolver);
  });

  it('should be created', () => {
    expect(resolver).toBeTruthy();
  });

  it('should resolve', () => {
    const emailCampaignService = TestBed.inject(EmailCampaignService);
    spyOn(emailCampaignService, 'getInactiveWorkplcesForDeletion').and.callThrough();

    resolver.resolve({} as ActivatedRouteSnapshot);

    expect(emailCampaignService.getInactiveWorkplcesForDeletion).toHaveBeenCalled();
  });
});
