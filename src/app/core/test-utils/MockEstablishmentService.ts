import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Establishment, mandatoryTraining, UpdateJobsRequest } from '@core/model/establishment.model';
import { GetChildWorkplacesResponse } from '@core/model/my-workplaces.model';
import { ServiceGroup } from '@core/model/services.model';
import { URLStructure } from '@core/model/url.model';
import { EstablishmentService } from '@core/services/establishment.service';
import { Observable, of } from 'rxjs';

import { subsid1, subsid2, subsid3 } from './MockUserService';

interface EmployerTypeRequest {
  employerType: {
    value: string;
    other?: string;
  };
}

@Injectable()
export class MockEstablishmentService extends EstablishmentService {
  public shareWith: any = { cqc: null, localAuthorities: null };
  private returnToUrl = true;
  public establishmentObj = {
    address: 'mock establishment address',
    capacities: [],
    created: undefined,
    dataOwner: undefined,
    dataOwnershipRequested: 'mock establishment dataOwnershipRequested',
    dataPermissions: undefined,
    employerType: { other: 'other employer type', value: 'Other' },
    id: 0,
    isRegulated: false,
    leavers: undefined,
    localAuthorities: [],
    mainService: { name: 'Care', id: 123, isCQC: false },
    name: 'mock establishment name',
    nmdsId: 'mock nmdsId',
    numberOfStaff: 0,
    otherServices: { value: null, services: [] },
    postcode: 'mock establishment postcode',
    primaryAuthority: undefined,
    serviceUsers: [],
    shareWith: this.shareWith,
    starters: undefined,
    totalLeavers: 0,
    totalStarters: 0,
    totalVacancies: 0,
    totalWorkers: 0,
    uid: 'mocked-uid',
    updated: undefined,
    updatedBy: 'mock establishment updatedBy',
    vacancies: undefined,
    showSharingPermissionsBanner: false,
    moneySpentOnAdvertisingInTheLastFourWeeks: '78',
    peopleInterviewedInTheLastFourWeeks: 'None',
    doNewStartersRepeatMandatoryTrainingFromPreviousEmployment: 'No, never',
    wouldYouAcceptCareCertificatesFromPreviousEmployment: 'No, never',
    careWorkersCashLoyaltyForFirstTwoYears: 'No',
    sickPay: 'No',
    pensionContribution: 'No',
    careWorkersLeaveDaysPerYear: '35',
  };

  public static factory(shareWith: any, returnToUrl = true, estObj: any = {}) {
    return (http: HttpClient) => {
      const service = new MockEstablishmentService(http);
      if (shareWith) {
        service.setShareWith(shareWith);
      }
      service.returnToUrl = returnToUrl;

      if (estObj) {
        Object.keys(estObj).forEach((key) => {
          service.establishmentObj[key] = estObj[key];
        });
      }

      return service;
    };
  }

  public setShareWith(shareWith: any) {
    this.establishmentObj.shareWith = shareWith;
  }

  public get establishment$(): Observable<Establishment> {
    return of(this.establishment);
  }

  public updateWorkplace(workplaceUid: string, data): Observable<any> {
    return of(null);
  }

  public updateMandatoryTraining(establishmentId, data: mandatoryTraining[]): Observable<any> {
    return of(null);
  }

  public get inStaffRecruitmentFlow(): boolean {
    return false;
  }

  public getAllServices(): Observable<ServiceGroup[]> {
    return of([{ category: 'any', value: null, services: [{ id: 123, name: 'Mock Service' }] }]);
  }

  public get establishment(): Establishment {
    return this.establishmentObj;
  }

  public get returnTo(): URLStructure {
    if (this.returnToUrl) {
      return {
        url: ['/dashboard'],
        fragment: 'workplace',
      };
    } else {
      return;
    }
  }

  public get establishmentId(): string {
    return '98a83eef-e1e1-49f3-89c5-b1287a3cc8dd';
  }

  get primaryWorkplace(): Establishment {
    return {
      address: '',
      capacities: [],
      created: undefined,
      dataOwner: undefined,
      dataOwnershipRequested: '',
      dataPermissions: undefined,
      employerType: { value: 'Private Sector' },
      id: 0,
      isRegulated: false,
      leavers: undefined,
      localAuthorities: [],
      mainService: undefined,
      name: 'Test Workplace',
      nmdsId: 'AB12345',
      numberOfStaff: 0,
      otherServices: { value: null, services: [] },
      postcode: '',
      primaryAuthority: undefined,
      serviceUsers: [],
      shareWith: this.shareWith,
      starters: undefined,
      totalLeavers: 0,
      totalStarters: 0,
      totalVacancies: 0,
      totalWorkers: 0,
      uid: '98a83eef-e1e1-49f3-89c5-b1287a3cc8de',
      updated: undefined,
      updatedBy: '',
      vacancies: undefined,
    };
  }

  public updateTypeOfEmployer(establishmentId, data: EmployerTypeRequest): Observable<any> {
    return of('');
  }

  public getExpiresSoonAlertDates(): Observable<string> {
    return of('90');
  }

  public setExpiresSoonAlertDates(establishmentUid, data): Observable<string> {
    return of('');
  }

  public getChildWorkplaces(establishmentUid: string): Observable<GetChildWorkplacesResponse> {
    return of({
      childWorkplaces: [subsid1, subsid2, subsid3],
      count: 3,
      activeWorkplaceCount: 2,
    } as GetChildWorkplacesResponse);
  }

  public updateJobs(establishmemntId, data: UpdateJobsRequest): Observable<Establishment> {
    return of({
      created: undefined,
      dataOwnershipRequested: '',
      id: 0,
      linkToParentRequested: null,
      name: 'Test Workplace',
      showSharingPermissionsBanner: false,
      totalVacancies: 0,
      uid: 'mocked-uid',
      updated: undefined,
      updatedBy: '',
      vacancies: 'None',
    } as Establishment);
  }

  public getCapacity(establishmentId: any, all: boolean): Observable<any> {
    return of({
      allServiceCapacities: [
        {
          service: 'Main Service: Some kind of service',
          questions: [
            { question: 'How many places do you have at the moment?', questionId: 101, seq: 1 },
            { question: 'Number of those places being used?', questionId: 107, seq: 2 },
          ],
        },
        {
          service: 'Adult: Residential care',
          questions: [
            { question: 'How many beds do you have?', questionId: 102, seq: 1 },
            { question: 'How many of those beds are being used?', questionId: 105, seq: 2 },
          ],
        },
        {
          service: 'Domiciliary: Home services',
          questions: [{ question: 'Number of people receiving care at the moment', questionId: 109, seq: 1 }],
        },
        {
          service: 'Extra Care: Housing services',
          questions: [{ question: 'Number of people using the service at the moment', questionId: 111, seq: 1 }],
        },
      ],
      mainService: { id: 100, name: 'Some kind of service' },
    });
  }
}

@Injectable()
export class MockEstablishmentServiceWithoutReturn extends MockEstablishmentService {
  public get returnTo(): URLStructure {
    return;
  }
}
@Injectable()
export class MockEstablishmentServiceWithNoEmployerType extends MockEstablishmentService {
  public establishmentObj = {
    address: 'mock establishment address',
    capacities: [],
    created: undefined,
    dataOwner: 'Workplace',
    dataOwnershipRequested: 'mock establishment dataOwnershipRequested',
    dataPermissions: undefined,
    employerType: undefined,
    id: 0,
    isRegulated: false,
    leavers: undefined,
    localAuthorities: [],
    mainService: { name: 'Care', id: 123, isCQC: false },
    name: 'mock establishment name',
    nmdsId: 'mock nmdsId',
    numberOfStaff: 0,
    otherServices: { value: null, services: [] },
    postcode: 'mock establishment postcode',
    primaryAuthority: undefined,
    serviceUsers: [],
    shareWith: this.shareWith,
    starters: undefined,
    totalLeavers: 0,
    totalStarters: 0,
    totalVacancies: 0,
    totalWorkers: 0,
    uid: 'mocked-uid',
    updated: undefined,
    updatedBy: 'mock establishment updatedBy',
    vacancies: undefined,
    showSharingPermissionsBanner: false,
    moneySpentOnAdvertisingInTheLastFourWeeks: '78',
    peopleInterviewedInTheLastFourWeeks: 'None',
    doNewStartersRepeatMandatoryTrainingFromPreviousEmployment: 'No,never',
    wouldYouAcceptCareCertificatesFromPreviousEmployment: 'No,never',
    careWorkersCashLoyaltyForFirstTwoYears: 'No',
    sickPay: 'No',
    pensionContribution: 'No',
    careWorkersLeaveDaysPerYear: '35',
  };

  public static factory(employerTypeHasValue = true, dataOwner: any = 'Workplace') {
    return (httpClient: HttpClient) => {
      const service = new MockEstablishmentServiceWithNoEmployerType(httpClient);
      service.setEmployerTypeHasValue(employerTypeHasValue);
      service.establishmentObj.dataOwner = dataOwner;

      return service;
    };
  }

  public getEstablishment(workplaceUid: string, wdf: boolean = false): Observable<any> {
    return of(this.establishmentObj as Establishment);
  }
  public get returnTo(): URLStructure {
    return;
  }
}
