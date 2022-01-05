import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Establishment } from '@core/model/establishment.model';
import { ServiceGroup } from '@core/model/services.model';
import { URLStructure } from '@core/model/url.model';
import { EstablishmentService } from '@core/services/establishment.service';
import { Observable, of } from 'rxjs';

@Injectable()
export class MockEstablishmentService extends EstablishmentService {
  private shareWith: any = { cqc: null, localAuthorities: null };

  public static factory(shareWith: any) {
    return (http: HttpClient) => {
      const service = new MockEstablishmentService(http);
      if (shareWith) {
        service.setShareWith(shareWith);
      }
      return service;
    };
  }

  public setShareWith(shareWith: any) {
    this.shareWith = shareWith;
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
    return {
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
    };
  }

  public get returnTo(): URLStructure {
    return {
      url: ['/dashboard'],
      fragment: 'workplace',
    };
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
}
