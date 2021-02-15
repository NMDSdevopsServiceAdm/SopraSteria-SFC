import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { EmailCampaignService } from './email-campaign.service';

describe('EmailCampaignService', () => {
  let service: EmailCampaignService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [EmailCampaignService],
    });
    service = TestBed.inject(EmailCampaignService);
  });

  afterEach(() => {
    TestBed.inject(HttpTestingController).verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should get inactive workplaces', () => {
    service.getInactiveWorkplaces().subscribe();

    const http = TestBed.inject(HttpTestingController);
    const req = http.expectOne('/api/admin/email-campaigns/inactive-workplaces');

    expect(req.request.method).toBe('GET');
  });

  it('should create a campaign', () => {
    service.createCampaign().subscribe();

    const http = TestBed.inject(HttpTestingController);
    const req = http.expectOne('/api/admin/email-campaigns/inactive-workplaces');

    expect(req.request.method).toBe('POST');
  });

  it('should get the history', () => {
    service.getHistory().subscribe();

    const http = TestBed.inject(HttpTestingController);
    const req = http.expectOne('/api/admin/email-campaigns/inactive-workplaces/history');

    expect(req.request.method).toBe('GET');
  });
});
