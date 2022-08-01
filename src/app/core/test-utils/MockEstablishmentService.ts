import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Establishment, UpdateJobsRequest } from '@core/model/establishment.model';
import { GetChildWorkplacesResponse } from '@core/model/my-workplaces.model';
import { ServiceGroup } from '@core/model/services.model';
import { URLStructure } from '@core/model/url.model';
import { EstablishmentService } from '@core/services/establishment.service';
import { Observable, of } from 'rxjs';

import { subsid1, subsid2, subsid3 } from './MockUserService';

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
    employerType: { other: 'mock employerType other', value: 'mock employerType value' },
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

  public getAllServices(): Observable<ServiceGroup[]> {
    return of([{ category: 'any', value: null, services: [{ id: 123, name: 'Mock Service' }] }]);
  }

  public get establishment(): Establishment {
    return this.establishmentObj;
  }

  public get inStaffRecruitmentFlow(): boolean {
    return false;
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
      employerType: { other: '', value: '' },
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
    dataOwner: undefined,
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
    careWorkersLeaveDaysPerYear: '35',
  };

  public get returnTo(): URLStructure {
    return;
  }
}
