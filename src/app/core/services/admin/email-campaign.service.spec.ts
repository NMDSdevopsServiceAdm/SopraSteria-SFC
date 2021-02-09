import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { EmailCampaignService } from './email-campaign.service';

describe('EmailCampaignService', () => {
  let service: EmailCampaignService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
    });
    service = TestBed.inject(EmailCampaignService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
