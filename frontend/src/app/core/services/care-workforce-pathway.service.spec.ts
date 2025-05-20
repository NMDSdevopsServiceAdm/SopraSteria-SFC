import { HttpTestingController, HttpClientTestingModule } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { CareWorkforcePathwayService } from './care-workforce-pathway.service';
import { environment } from 'src/environments/environment';

fdescribe('CareWorkforcePathwayService', () => {
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

  it('should call the /api/${establishmentId}/careWorkforcePathway/workersWhoRequireCareWorkforcePathwayRoleAnswer endpoint', () => {
    service.getAllWorkersWhoRequireCareWorkforcePathwayRoleAnswer(establishmentId).subscribe();

    const req = http.expectOne(
      `${environment.appRunnerEndpoint}/api/establishment/${establishmentId}/careWorkforcePathway/workersWhoRequireCareWorkforcePathwayRoleAnswer`,
    );
    expect(req.request.method).toBe('GET');
  });
});
