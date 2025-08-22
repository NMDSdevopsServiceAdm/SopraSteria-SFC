import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { environment } from 'src/environments/environment';

import { UsefulLinksService } from './useful-links.service';

describe('UsefulLinksService', () => {
  let service: UsefulLinksService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [UsefulLinksService],
    });
    service = TestBed.inject(UsefulLinksService);
    http = TestBed.inject(HttpTestingController);
  });

  it('should create the service', async () => {
    expect(service).toBeTruthy();
  });

  describe('getUsefulLinksForPay', () => {
    it('should call the cms endpoint for useful_link_pay', async () => {
      service.getUsefulLinksForPay().subscribe();

      const req = http.expectOne(
        `${environment.appRunnerEndpoint}/api/cms/items/useful_link_pay?limit=1&fields=content,title&env=${environment.environmentName}`,
      );
      expect(req.request.method).toBe('GET');
    });
  });

  describe('getUsefulLinksForRecruitment', () => {
    it('should call the cms endpoint for useful_link_recruitment', async () => {
      service.getUsefulLinksForRecruitment().subscribe();

      const req = http.expectOne(
        `${environment.appRunnerEndpoint}/api/cms/items/useful_link_recruitment?limit=1&fields=content,title&env=${environment.environmentName}`,
      );
      expect(req.request.method).toBe('GET');
    });
  });
});
