import { HttpTestingController, HttpClientTestingModule } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { CareWorkforcePathwayService } from './care-workforce-pathway.service';
import { environment } from 'src/environments/environment';

describe('CareWorkforcePathwayService', () => {
  let service: CareWorkforcePathwayService;
  let http: HttpTestingController;
  let establishmentId = '124';

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [CareWorkforcePathwayService],
    });
    service = TestBed.inject(CareWorkforcePathwayService);

    http = TestBed.inject(HttpTestingController);
  });

  it('should create the service', () => {
    expect(service).toBeTruthy();
  });

  it('should call the /api/careWorkforcePathwayWorkplaceAwarenessAnswers endpoint to get the careWorkforcePathwayWorkplaceAwarenessAnswers', () => {
    service.getCareWorkforcePathwayWorkplaceAwarenessAnswers().subscribe();

    const req = http.expectOne(`${environment.appRunnerEndpoint}/api/careWorkforcePathwayWorkplaceAwarenessAnswers`);
    expect(req.request.method).toBe('GET');
  });

  it('should call the /api/careWorkforcePathwayRoleCategories endpoint to get the careWorkforcePathwayRoleCategories', () => {
    service.getCareWorkforcePathwayRoleCategories().subscribe();

    const req = http.expectOne(`${environment.appRunnerEndpoint}/api/careWorkforcePathwayRoleCategories`);
    expect(req.request.method).toBe('GET');
  });

  it('should call the /api/${establishmentId}/careWorkforcePathway/noOfWorkersWhoRequireCareWorkforcePathwayRoleAnswer endpoint', () => {
    service.getNoOfWorkersWhoRequireCareWorkforcePathwayRoleAnswer(establishmentId).subscribe();

    const req = http.expectOne(
      `${environment.appRunnerEndpoint}/api/establishment/${establishmentId}/careWorkforcePathway/noOfWorkersWhoRequireCareWorkforcePathwayRoleAnswer`,
    );
    expect(req.request.method).toBe('GET');
  });

  describe('getAllWorkers', () => {
    const endpoint = '/careWorkforcePathway/workersWhoRequireCareWorkforcePathwayRoleAnswer';

    it('should call the expected endpoint', () => {
      service.getAllWorkersWhoRequireCareWorkforcePathwayRoleAnswer(establishmentId).subscribe();

      const req = http.expectOne(`${environment.appRunnerEndpoint}/api/establishment/${establishmentId}${endpoint}`);
      expect(req.request.method).toBe('GET');
    });

    it('should call the endpoint with pagination query params if given', async () => {
      service
        .getAllWorkersWhoRequireCareWorkforcePathwayRoleAnswer(establishmentId, { pageIndex: 1, itemsPerPage: 15 })
        .subscribe();

      const req = http.expectOne(
        `${environment.appRunnerEndpoint}/api/establishment/${establishmentId}${endpoint}?pageIndex=1&itemsPerPage=15`,
      );
      expect(req.request.method).toBe('GET');
    });
  });
});
