import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { environment } from 'src/environments/environment';

import { WizardService } from './wizard.service';

describe('WizardService', () => {
  let service: WizardService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [WizardService],
    });
    service = TestBed.inject(WizardService);
    http = TestBed.inject(HttpTestingController);
  });

  it('should create the service', async () => {
    expect(service).toBeTruthy();
  });

  describe('getWizardPage', () => {
    it('should call the cms endpoint with wizard path and canViewBenchmarks as true when passed in as true', async () => {
      const filter = {
        benchmarks_flag: {
          _in: [false, true],
        },
      };
      service.getWizardPage(true).subscribe();

      const req = http.expectOne(
        `${
          environment.appRunnerEndpoint
        }/api/cms/items/wizard?sort=order&fields=content,title,image,video&_filter=${encodeURI(
          JSON.stringify(filter),
        )}&env=${environment.environmentName}`,
      );
      expect(req.request.method).toBe('GET');
    });

    it('should call the cms endpoint with wizard path and canViewBenchmarks as false when passed in as false', async () => {
      const filter = {
        benchmarks_flag: {
          _in: [false, false],
        },
      };

      service.getWizardPage(false).subscribe();

      const req = http.expectOne(
        `${
          environment.appRunnerEndpoint
        }/api/cms/items/wizard?sort=order&fields=content,title,image,video&_filter=${encodeURI(
          JSON.stringify(filter),
        )}&env=${environment.environmentName}`,
      );
      expect(req.request.method).toBe('GET');
    });
  });
});
