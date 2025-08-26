import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { environment } from 'src/environments/environment';

import { DataChangeService } from './data-change.service';

describe('DataChangeService', () => {
  let service: DataChangeService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [DataChangeService],
    });
    service = TestBed.inject(DataChangeService);
    http = TestBed.inject(HttpTestingController);
  });

  it('should create the service', async () => {
    expect(service).toBeTruthy();
  });

  describe('getDataChange', () => {
    it('should call the cms endpoint with data_changes path', async () => {
      service.getDataChange().subscribe();

      const req = http.expectOne(
        `${environment.appRunnerEndpoint}/api/cms/items/data_changes?limit=1&fields=content,title,last_updated&env=${environment.environmentName}`,
      );
      expect(req.request.method).toBe('GET');
    });
  });
});
