import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { UpdateCareWorkforcePathwayUsePayload } from '@core/model/care-workforce-pathway.model';
import { environment } from 'src/environments/environment';

import { EstablishmentService } from './establishment.service';
import { UpdateStaffKindDelegatedHealthcareActivitiesPayload } from '@core/model/delegated-healthcare-activities.model';
import { provideHttpClient } from '@angular/common/http';

fdescribe('EstablishmentService', () => {
  let service: EstablishmentService;
  let http: HttpTestingController;
  const mockWorkplaceUid = 'mockWorkplaceUid';

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [],
      providers: [EstablishmentService, provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(EstablishmentService);

    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    TestBed.inject(HttpTestingController).verify();
  });

  it('should create the service', () => {
    expect(service).toBeTruthy();
  });

  describe('updateSingleEstablishmentField', () => {
    it('should call updateSingleEstablishmentField for a given establishment with the correct data', () => {
      const requestBody = {
        property: 'exampleColumnName',
        value: 'Yes, always',
      };

      service.updateSingleEstablishmentField('establishmentId', requestBody).subscribe();

      const req = http.expectOne(
        `${environment.appRunnerEndpoint}/api/establishment/establishmentId/updateSingleEstablishmentField`,
      );

      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(requestBody);
    });
  });

  describe('workplaceOrSubHasTrainingCertificates', () => {
    const mockWorkplaceUid = 'mockWorkplaceUid';

    const hasTrainingCertificatesEndpoint = `${environment.appRunnerEndpoint}/api/establishment/${mockWorkplaceUid}/hasTrainingCertificates`;

    it('should make call to expected backend endpoint', async () => {
      service.workplaceOrSubHasTrainingCertificates(mockWorkplaceUid).subscribe();

      const hasTrainingCertificatesRequest = http.expectOne(hasTrainingCertificatesEndpoint);
      expect(hasTrainingCertificatesRequest.request.method).toBe('GET');
    });
  });

  describe('updateJobs', () => {
    const payload = {
      vacancies: [
        { jobId: 10, total: 2 },
        { jobId: 25, total: 3 },
      ],
    };
    const mockResponse = {
      uid: mockWorkplaceUid,
      vacancies: [
        {
          jobId: 10,
          title: 'Care worker',
          total: 2,
        },
        {
          jobId: 25,
          title: 'Senior care worker',
          total: 3,
        },
      ],
      totalVacancies: 5,
    };

    const updateJobsEndpoint = `${environment.appRunnerEndpoint}/api/establishment/${mockWorkplaceUid}/jobs`;

    it('should make call to expected backend endpoint', async () => {
      const onSuccessSpy = jasmine.createSpy();

      service.updateJobs(mockWorkplaceUid, payload).subscribe((data) => onSuccessSpy(data));

      const expectedRequest = http.expectOne(updateJobsEndpoint);
      expectedRequest.flush(mockResponse);

      expect(expectedRequest.request.method).toBe('POST');
      expect(expectedRequest.request.body).toEqual(payload);
      expect(onSuccessSpy).toHaveBeenCalledWith(mockResponse);
    });

    it('should update the local establishment object on success', async () => {
      const setStateSpy = spyOn(service, 'setState');

      service.updateJobs(mockWorkplaceUid, payload).subscribe();

      const expectedRequest = http.expectOne(updateJobsEndpoint);
      expectedRequest.flush(mockResponse);

      expect(setStateSpy).toHaveBeenCalledWith(jasmine.objectContaining(mockResponse));
    });

    it('should not update the local establishment object when request failed', async () => {
      const setStateSpy = spyOn(service, 'setState');
      const onSuccessSpy = jasmine.createSpy();
      const onErrorSpy = jasmine.createSpy();

      service.updateJobs(mockWorkplaceUid, payload).subscribe(onSuccessSpy, onErrorSpy);

      const expectedRequest = http.expectOne(updateJobsEndpoint);
      expectedRequest.flush(null, { status: 500, statusText: 'Internal server error' });

      expect(setStateSpy).not.toHaveBeenCalled();
      expect(onSuccessSpy).not.toHaveBeenCalled();
      expect(onErrorSpy).toHaveBeenCalled();
    });
  });

  describe('updateCareWorkforcePathwayAwareness', () => {
    const updateCareWorkforcePathwayAwarenessEndpoint = `${environment.appRunnerEndpoint}/api/establishment/${mockWorkplaceUid}/careWorkforcePathway/careWorkforcePathwayAwareness`;

    it('should make call to updateCareWorkforcePathwayAwarenessEndpoint', async () => {
      const requestBody = { careWorkforcePathwayWorkplaceAwareness: { id: 1 } };
      service.updateCareWorkforcePathwayAwareness(mockWorkplaceUid, requestBody).subscribe();

      const updateCareWorkforcePathwayAwareness = http.expectOne(updateCareWorkforcePathwayAwarenessEndpoint);
      expect(updateCareWorkforcePathwayAwareness.request.method).toBe('POST');
      expect(updateCareWorkforcePathwayAwareness.request.body).toEqual(requestBody);
    });
  });

  describe('updateCareWorkforcePathwayUse', () => {
    const mockWorkplaceUid = 'mockWorkplaceUid';
    const payload = {
      use: 'Yes',
      reasons: [{ id: 1 }, { id: 2 }, { id: 10, other: 'some free text' }],
    } as UpdateCareWorkforcePathwayUsePayload;

    const endpoint = `${environment.appRunnerEndpoint}/api/establishment/${mockWorkplaceUid}/careWorkforcePathway/careWorkforcePathwayUse`;

    it('should make call to expected backend endpoint', async () => {
      service.updateCareWorkforcePathwayUse(mockWorkplaceUid, payload).subscribe();

      const expectedRequest = http.expectOne(endpoint);

      expect(expectedRequest.request.method).toBe('POST');
      expect(expectedRequest.request.body).toEqual(payload);
    });
  });

  describe('returnIsSetToHomePage', () => {
    it('should return true when returnTo is dashboard with fragment as home', () => {
      const returnTo = { url: ['/dashboard'], fragment: 'home' };
      service.setReturnTo(returnTo);

      expect(service.returnIsSetToHomePage()).toBe(true);
    });

    it('should return false if url is not dashboard', () => {
      const returnTo = { url: ['/workplace/abc123'], fragment: 'home' };
      service.setReturnTo(returnTo);

      expect(service.returnIsSetToHomePage()).toBe(false);
    });

    it('should return false if fragment is not home', () => {
      const returnTo = { url: ['/dashboard'], fragment: 'workplace' };
      service.setReturnTo(returnTo);

      expect(service.returnIsSetToHomePage()).toBe(false);
    });
  });

  describe('updateStaffKindDelegatedHealthcareActivities', () => {
    const mockWorkplaceUid = 'mockWorkplaceUid';
    const payload = {
      knowWhatActivities: 'Yes',
      activities: [{ id: 1 }, { id: 2 }],
    } as UpdateStaffKindDelegatedHealthcareActivitiesPayload;

    const endpoint = `${environment.appRunnerEndpoint}/api/establishment/${mockWorkplaceUid}/updateStaffKindDelegatedHealthcareActivities`;

    it('should make call to expected backend endpoint', async () => {
      service.updateStaffKindDelegatedHealthcareActivities(mockWorkplaceUid, payload).subscribe();

      const expectedRequest = http.expectOne(endpoint);

      expect(expectedRequest.request.method).toBe('POST');
      expect(expectedRequest.request.body).toEqual(payload);
    });
  });

  describe('baseRouteForAddWorkplaceDetails', () => {
    it('should return a base route URL for the add-workplace-details flow', () => {
      const mockWorkplaceUid = 'mock-workplace-uid';
      const expected = ['/workplace', mockWorkplaceUid, 'workplace-data', 'add-workplace-details'];

      const actual = service.baseRouteForAddWorkplaceDetails(mockWorkplaceUid);
      expect(actual).toEqual(expected);
    });
  });

  describe('buildPathForAddWorkplaceDetails', () => {
    it('should build the URL for a page under /workplace-data/add-workplace-details route', () => {
      const mockWorkplaceUid = 'mock-workplace-uid';
      const pageSegment = 'how-many-vacancies';

      const expected = [
        '/workplace',
        mockWorkplaceUid,
        'workplace-data',
        'add-workplace-details',
        'how-many-vacancies',
      ];

      const actual = service.buildPathForAddWorkplaceDetails(mockWorkplaceUid, pageSegment);
      expect(actual).toEqual(expected);
    });
  });

  describe('baseRouteForWorkplaceSummary', () => {
    it('should return a base route URL for the workplace summary route', () => {
      const mockWorkplaceUid = 'mock-workplace-uid';
      const expected = ['/workplace', mockWorkplaceUid, 'workplace-data', 'workplace-summary'];

      const actual = service.baseRouteForWorkplaceSummary(mockWorkplaceUid);
      expect(actual).toEqual(expected);
    });
  });

  describe('buildPathForWorkplaceSummary', () => {
    it('should build the URL for a page under /workplace-data/workplace-summary route', () => {
      const mockWorkplaceUid = 'mock-workplace-uid';
      const pageSegment = 'update-vacancies';

      const expected = ['/workplace', mockWorkplaceUid, 'workplace-data', 'workplace-summary', 'update-vacancies'];

      const actual = service.buildPathForWorkplaceSummary(mockWorkplaceUid, pageSegment);
      expect(actual).toEqual(expected);
    });
  });
});
