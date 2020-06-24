import { HttpClient } from '@angular/common/http';
import { EstablishmentService } from '@core/services/establishment.service';
import { Establishment, Share } from '@core/model/establishment.model';
import { Observable, of } from 'rxjs';
import { URLStructure } from '@core/model/url.model';

export class MockEstablishmentService extends EstablishmentService {
  private share: any = { enabled: false, with: [] };

  public setShare(newShare: any) {
    this.share = newShare;
  }

  public static factory(newShare: any) {
    return (http: HttpClient) => {
      const service = new MockEstablishmentService(http);
      if (newShare) {
        service.setShare(newShare);
      }
      return service;
    };
  }

  public get establishment$(): Observable<Establishment> {
    return of(this.establishment);
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
      mainService: undefined,
      name: 'mock establishment name',
      nmdsId: 'mock nmdsId',
      numberOfStaff: 0,
      otherServices: [],
      postcode: 'mock establishment postcode',
      primaryAuthority: undefined,
      serviceUsers: [],
      share: {enabled: this.share.enabled, with: this.share.with},
      starters: undefined,
      totalLeavers: 0,
      totalStarters: 0,
      totalVacancies: 0,
      totalWorkers: 0,
      uid: 'mocked-uid',
      updated: undefined,
      updatedBy: 'mock establishment updatedBy',
      vacancies: undefined
    };
  }

  public get returnTo(): URLStructure {
    return {
      url: ['/dashboard'],
      fragment: 'workplace'
    };
  }

  public get establishmentId(): string {
    return '';
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
      name: '',
      nmdsId: '',
      numberOfStaff: 0,
      otherServices: [],
      postcode: '',
      primaryAuthority: undefined,
      serviceUsers: [],
      share: {
        enabled: false,
        with: []
      },
      starters: undefined,
      totalLeavers: 0,
      totalStarters: 0,
      totalVacancies: 0,
      totalWorkers: 0,
      uid: '',
      updated: undefined,
      updatedBy: '',
      vacancies: undefined
    };
  }
}
