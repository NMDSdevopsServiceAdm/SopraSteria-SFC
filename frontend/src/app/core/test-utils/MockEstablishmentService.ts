import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ChangeOwner, Establishment, mandatoryTraining, UpdateJobsRequest } from '@core/model/establishment.model';
import { GetChildWorkplacesResponse } from '@core/model/my-workplaces.model';
import { ServiceGroup } from '@core/model/services.model';
import { URLStructure } from '@core/model/url.model';
import { EstablishmentService } from '@core/services/establishment.service';
import { build, fake, perBuild, sequence } from '@jackfranklin/test-data-bot';
import { Observable, of } from 'rxjs';

import { subsid1, subsid2, subsid3 } from './MockUserService';

export const establishmentBuilder = build('Establishment', {
  fields: {
    id: sequence(),
    uid: fake((f) => f.datatype.uuid()),
    name: fake((f) => f.lorem.sentence()),
    address: fake((f) => f.address.streetAddress()),
    postcode: fake((f) => f.address.zipCode('??# #??')),
    isRegulated: perBuild(() => false),
    nmdsId: fake((f) => f.lorem.word()),
    created: new Date(),
    updated: new Date(),
    updatedBy: fake((f) => f.name.firstName()),
    isParent: perBuild(() => false),
    parentId: null,
    mainService: {
      id: 16,
      name: fake((f) => f.lorem.sentence()),
    },
    employerType: {
      value: fake((f) => f.company.companyName()),
    },
    numberOfStaff: 3,
    totalWorkers: 4,
    otherServices: { value: 'Yes', services: [{ category: 'Adult community care', services: [] }] },
    serviceUsers: [],
    capacities: [],
    shareWith: { cqc: null, localAuthorities: null },
    localAuthorities: [],
    primaryAuthority: undefined,
    vacancies: undefined,
    totalVacancies: 0,
    starters: undefined,
    totalStarters: 0,
    leavers: undefined,
    totalLeavers: 0,
    dataOwner: undefined,
    dataPermissions: undefined,
    dataOwnershipRequested: fake((f) => f.name.firstName()),
    moneySpentOnAdvertisingInTheLastFourWeeks: fake((f) => f.finance.amount(1, 10000, 2)),
    peopleInterviewedInTheLastFourWeeks: fake((f) => f.datatype.number(1000)),
    doNewStartersRepeatMandatoryTrainingFromPreviousEmployment: 'Yes, always',
    wouldYouAcceptCareCertificatesFromPreviousEmployment: 'No, never',
    careWorkersCashLoyaltyForFirstTwoYears: fake((f) => f.finance.amount(1, 10000, 2)),
    sickPay: 'Yes',
    careWorkersLeaveDaysPerYear: fake((f) => f.datatype.number(1000)),
    wdf: null,
    isParentParentApprovedBannerViewed: null,
    careWorkforcePathwayWorkplaceAwareness: {
      id: 1,
      title: fake((f) => f.lorem.sentence()),
    },
    careWorkforcePathwayUse: {
      use: 'Yes',
      reasons: [{ id: 1 }, { id: 10, other: 'some specific reason' }],
    },
    staffDoDelegatedHealthcareActivities: null,
  },
});

export const establishmentWithShareWith = (shareWith) => {
  return establishmentBuilder({
    overrides: {
      shareWith,
      otherService: { value: 'Yes', services: [{ category: 'Adult community care', services: [] }] },
    },
  });
};

export const establishmentWithWdfBuilder = (additionalProperties: any = {}) => {
  return establishmentBuilder({
    overrides: {
      wdf: {
        mainService: { isEligible: false, updatedSinceEffectiveDate: true },
        starters: { isEligible: false, updatedSinceEffectiveDate: true },
        leavers: { isEligible: false, updatedSinceEffectiveDate: true },
        vacancies: { isEligible: false, updatedSinceEffectiveDate: true },
        capacities: { isEligible: false, updatedSinceEffectiveDate: true },
        serviceUsers: { isEligible: false, updatedSinceEffectiveDate: true },
        numberOfStaff: { isEligible: false, updatedSinceEffectiveDate: true },
        employerType: { isEligible: false, updatedSinceEffectiveDate: true },
      },
      ...additionalProperties,
    },
  });
};

@Injectable()
export class MockEstablishmentService extends EstablishmentService {
  public shareWith: any = { cqc: null, localAuthorities: null };
  private returnToUrl = true;
  private childWorkplaces = {
    childWorkplaces: [subsid1, subsid2, subsid3],
    count: 3,
    activeWorkplaceCount: 2,
  };
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
    isParent: false,
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
    careWorkforcePathwayWorkplaceAwareness: {
      id: 1,
      title: 'Aware of how the care workforce pathway works in practice',
    },
    careWorkforcePathwayUse: null,
  };

  public static factory(shareWith: any, returnToUrl = true, estObj: any = {}, childWorkplaces: any = null) {
    return (http: HttpClient) => {
      const service = new MockEstablishmentService(http);
      if (shareWith) {
        service.setShareWith(shareWith);
      }
      service.returnToUrl = returnToUrl;

      if (childWorkplaces) {
        service.childWorkplaces = { childWorkplaces, count: childWorkplaces.length, activeWorkplaceCount: 1 };
      }

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

  public updateServiceUsers(workplaceUid: string, data): Observable<any> {
    return of(null);
  }

  public createAndUpdateMandatoryTraining(establishmentId, data: mandatoryTraining): Observable<any> {
    return of(null);
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

  public _primaryWorkplace: Establishment = {
    address: '',
    capacities: [],
    careWorkforcePathwayWorkplaceAwareness: {
      id: 1,
      title: 'Aware of how the care workforce pathway works in practice',
    },
    careWorkforcePathwayUse: null,
    created: undefined,
    dataOwner: undefined,
    dataOwnershipRequested: '',
    dataPermissions: undefined,
    employerType: { value: 'Private Sector' },
    id: 0,
    isRegulated: false,
    isParent: false,
    leavers: undefined,
    localAuthorities: [],
    mainService: { name: 'Care', id: 123, isCQC: true },
    name: 'Test Workplace',
    nmdsId: 'AB12345',
    numberOfStaff: 0,
    otherServices: { value: null, services: [] },
    postcode: 'AB1 2CD',
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
    locationId: '1-11111111',
    provId: '1-21232433',
  };

  get primaryWorkplace(): Establishment {
    return this._primaryWorkplace;
  }

  set primaryWorkplace(value: Establishment) {
    this._primaryWorkplace = value;
  }

  public getEstablishmentField(establishmentId: string, property: string) {
    return of(this.establishmentObj);
  }

  public updateEstablishmentFieldWithAudit(establishmentId, property: string, data: any): Observable<any> {
    return of('');
  }

  public getExpiresSoonAlertDates(): Observable<any> {
    return of({ expiresSoonAlertDate: '90' });
  }

  public setExpiresSoonAlertDates(establishmentUid, data): Observable<string> {
    return of('');
  }

  public getChildWorkplaces(establishmentUid: string): Observable<GetChildWorkplacesResponse> {
    return of(this.childWorkplaces as GetChildWorkplacesResponse);
  }

  public changeOwnership(establishmentId, data: ChangeOwner): Observable<Establishment> {
    return of(this.establishment);
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

  public getMissingCqcLocations({ locationid: locationId, uid: uid, id: id }): Observable<any> {
    return of({
      showMissingCqcMessage: false,
      missingCqcLocations: {
        count: 0,
        missingCqcLocationIds: [],
      },
      weeksSinceParentApproval: 0,
      childWorkplacesCount: 0,
    });
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

  public getEstablishment(workplaceUid: string, wdf: boolean = false): Observable<any> {
    return of(this.establishmentObj as Establishment);
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
    careWorkforcePathwayWorkplaceAwareness: {
      id: 1,
      title: 'Aware of how the care workforce pathway works in practice',
    },
    careWorkforcePathwayUse: null,
    created: undefined,
    dataOwner: 'Workplace',
    dataOwnershipRequested: 'mock establishment dataOwnershipRequested',
    dataPermissions: undefined,
    employerType: undefined,
    id: 0,
    isRegulated: false,
    isParent: false,
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

  public workplaceOrSubHasTrainingCertificates(workplaceUid: string) {
    return of(null);
  }

  public get returnTo(): URLStructure {
    return;
  }
}

@Injectable()
export class MockEstablishmentServiceCheckCQCDetails extends MockEstablishmentService {
  private cqcDetailsBanner;

  public static factory(checkCqcDetailsBanner = false) {
    return (httpClient: HttpClient) => {
      const service = new MockEstablishmentServiceCheckCQCDetails(httpClient);
      service.cqcDetailsBanner = checkCqcDetailsBanner;
      return service;
    };
  }

  public get checkCQCDetailsBanner(): boolean {
    return this.cqcDetailsBanner;
  }
}

@Injectable()
export class MockEstablishmentServiceWithNoCapacities extends MockEstablishmentService {
  public static factory() {
    return (httpClient: HttpClient) => {
      const service = new MockEstablishmentServiceWithNoCapacities(httpClient);
      return service;
    };
  }

  public getCapacity(establishmentId: any, all: boolean): Observable<any> {
    return of({
      allServiceCapacities: [],
    });
  }
}

@Injectable()
export class MockEstablishmentServiceWithOverrides extends MockEstablishmentService {
  public static factory(overrides: any = {}) {
    return (httpClient: HttpClient) => {
      const service = new MockEstablishmentService(httpClient);

      Object.keys(overrides).forEach((overrideName) => {
        switch (overrideName) {
          case 'returnTo': {
            Object.defineProperty(service, 'returnTo', {
              get: () => overrides['returnTo'],
            });
            break;
          }
          case 'establishment': {
            service.establishmentObj = { ...service.establishmentObj, ...overrides['establishment'] };
            break;
          }
          default: {
            service[overrideName] = overrides[overrideName];
            break;
          }
        }
      });

      return service;
    };
  }
}
