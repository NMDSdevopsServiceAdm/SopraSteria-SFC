import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { CareWorkforcePathwayService } from './care-workforce-pathway.service';
import { environment } from 'src/environments/environment';
import { provideHttpClient } from '@angular/common/http';
import dayjs from 'dayjs';

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
    service.countWorkersWhoRequireCareWorkforcePathwayRoleAnswer(establishmentId).subscribe();

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

  describe('getWorkersWhoMeetNewToCareCriteria', () => {
    const createWorker = (overrides: any = {}) => ({
      uid: 'worker-1',
      nameOrId: 'Test Worker',
      MainJobStartDateValue: null,
      careWorkforcePathwayRoleCategory: {
        id: 1,
        title: 'New to care',
      },
      CareWorkforcePathwayRoleCategoryChangedAt: null,
      ...overrides,
    });

    it('should include a New to care worker with no start date', () => {
      const worker = createWorker();

      const result = service.getWorkersWhoMeetNewToCareCriteria([worker]);

      expect(result).toEqual([worker]);
    });

    it('should include a New to care worker whose start date was more than 12 months ago', () => {
      const worker = createWorker({
        MainJobStartDateValue: dayjs().subtract(13, 'month').format('YYYY-MM-DD'),
      });

      const result = service.getWorkersWhoMeetNewToCareCriteria([worker]);

      expect(result).toEqual([worker]);
    });

    it('should exclude a New to care worker whose start date was less than 12 months ago', () => {
      const worker = createWorker({
        MainJobStartDateValue: dayjs().subtract(6, 'month').format('YYYY-MM-DD'),
      });

      const result = service.getWorkersWhoMeetNewToCareCriteria([worker]);

      expect(result).toEqual([]);
    });

    it('should exclude a worker who is not in the New to care category', () => {
      const worker = createWorker({
        careWorkforcePathwayRoleCategory: {
          id: 2,
          title: 'Experienced in care',
        },
      });

      const result = service.getWorkersWhoMeetNewToCareCriteria([worker]);

      expect(result).toEqual([]);
    });
    // yet to be confirmed with Dave to change today
    it('should exclude a New to care worker whose role category changed today', () => {
      const worker = createWorker({
        MainJobStartDateValue: null,
        CareWorkforcePathwayRoleCategoryChangedAt: dayjs().format('YYYY-MM-DD'),
      });

      const result = service.getWorkersWhoMeetNewToCareCriteria([worker]);

      expect(result).toEqual([]);
    });

    it('should include a New to care worker whose role category changed before today', () => {
      const worker = createWorker({
        MainJobStartDateValue: null,
        CareWorkforcePathwayRoleCategoryChangedAt: dayjs().subtract(1, 'day').format('YYYY-MM-DD'),
      });

      const result = service.getWorkersWhoMeetNewToCareCriteria([worker]);

      expect(result).toEqual([worker]);
    });

    it('should return an empty array when no workers meet the criteria', () => {
      const workers = [
        createWorker({
          MainJobStartDateValue: dayjs().subtract(6, 'month').format('YYYY-MM-DD'),
        }),
        createWorker({
          careWorkforcePathwayRoleCategory: {
            id: 2,
            title: 'Experienced in care',
          },
        }),
      ];

      const result = service.getWorkersWhoMeetNewToCareCriteria(workers);

      expect(result).toEqual([]);
    });
  });
});
