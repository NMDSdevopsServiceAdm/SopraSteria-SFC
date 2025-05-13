import { HttpTestingController, HttpClientTestingModule } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { CareWorkforcePathwayService } from './care-workforce-pathway.service';
import { environment } from 'src/environments/environment';

fdescribe('CareWorkforcePathwayService', () => {
  let service: CareWorkforcePathwayService;
  let http: HttpTestingController;

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

  // it('should call the /api/trainingCategories endpoint to get the careWorkforcePathwayCategories', () => {
  //   service.getCareWorkforcePathwayCategories().subscribe();

  //   const req = http.expectOne(`${environment.appRunnerEndpoint}/api/careWorkforcePathwayCategories`);
  //   expect(req.request.method).toBe('GET');
  // });
});
