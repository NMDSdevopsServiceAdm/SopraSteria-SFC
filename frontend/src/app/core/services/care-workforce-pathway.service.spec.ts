import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { CareWorkforcePathwayService } from './care-workforce-pathway.service';
import { environment } from 'src/environments/environment';
import { provideHttpClient } from '@angular/common/http';

describe('CareWorkforcePathwayService', () => {
  let service: CareWorkforcePathwayService;
  let http: HttpTestingController;
  const establishmentId = '124';

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [],
      providers: [CareWorkforcePathwayService, provideHttpClient(), provideHttpClientTesting()],
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

  describe('getAllCareWorkforcePathwayUseReasons', () => {
    const endpoint = '/api/careWorkforcePathway/useReasons';

    it('should call the expected endpoint', () => {
      service.getAllCareWorkforcePathwayUseReasons().subscribe();

      const req = http.expectOne(`${environment.appRunnerEndpoint}${endpoint}`);
      expect(req.request.method).toBe('GET');
    });
  });

  describe('isAwareOfCareWorkforcePathway', () => {
    const testCases = [
      { inputValue: null, expected: false },
      { inputValue: { id: 1, title: 'Aware of how the care workforce pathway works in practice' }, expected: true },
      { inputValue: { id: 2, title: 'Aware of the aims of the care workforce pathway' }, expected: true },
      { inputValue: { id: 3, title: "Aware of the term 'care workforce pathway'" }, expected: true },
      { inputValue: { id: 4, title: 'Not aware of the care workforce pathway' }, expected: false },
      { inputValue: { id: 5, title: 'I do not know how aware our workplace is' }, expected: false },
    ];

    testCases.forEach(({ inputValue, expected }) => {
      it(`should return ${expected} when input is ${inputValue}`, () => {
        const actual = service.isAwareOfCareWorkforcePathway(inputValue);
        expect(actual).toEqual(expected);
      });
    });
  });
});
