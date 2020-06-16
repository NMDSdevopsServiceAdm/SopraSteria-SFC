import { EstablishmentService } from '@core/services/establishment.service';
import { Establishment } from '@core/model/establishment.model';
import { Observable, of } from 'rxjs';
import { URLStructure } from '@core/model/url.model';

export class MockEstablishmentService extends EstablishmentService {
  public get establishment$(): Observable<Establishment> {
    return of(this.establishment);
  }

  public get establishment(): Establishment {
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
      share: undefined,
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
