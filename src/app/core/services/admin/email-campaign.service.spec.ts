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

  it('should create a campaign for inactive workplaces', () => {
    service.createInactiveWorkplacesCampaign().subscribe();

    const http = TestBed.inject(HttpTestingController);
    const req = http.expectOne('/api/admin/email-campaigns/inactive-workplaces');

    expect(req.request.method).toBe('POST');
  });

  it('should get the history', () => {
    service.getInactiveWorkplacesHistory().subscribe();

    const http = TestBed.inject(HttpTestingController);
    const req = http.expectOne('/api/admin/email-campaigns/inactive-workplaces/history');

    expect(req.request.method).toBe('GET');
  });

  it('should get a report of inactive workplaces', () => {
    service.getInactiveWorkplacesReport().subscribe();

    const http = TestBed.inject(HttpTestingController);
    const req = http.expectOne('/api/admin/email-campaigns/inactive-workplaces/report');

    expect(req.request.method).toBe('GET');
  });

  it('should get a total number of emails been sent to targeted users', () => {
    service.getTargetedTotalEmails('primaryUsers').subscribe();

    const http = TestBed.inject(HttpTestingController);
    const req = http.expectOne('/api/admin/email-campaigns/targeted-emails/total?groupType=primaryUsers');

    expect(req.request.method).toBe('GET');
  });

  it('should get a list of templates that can be sent to targeted users', () => {
    service.getTargetedTemplates().subscribe();

    const http = TestBed.inject(HttpTestingController);
    const req = http.expectOne('/api/admin/email-campaigns/targeted-emails/templates');

    expect(req.request.method).toBe('GET');
  });

  it('should create a campaign for targeted users', () => {
    service.createTargetedEmailsCampaign('primaryUsers', '1').subscribe();

    const http = TestBed.inject(HttpTestingController);
    const req = http.expectOne('/api/admin/email-campaigns/targeted-emails');

    expect(req.request.method).toBe('POST');
    expect(req.request.body.groupType).toEqual('primaryUsers');
    expect(req.request.body.templateId).toEqual('1');
  });
});
