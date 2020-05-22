import { EstablishmentService } from '@core/services/establishment.service';
import { Establishment } from '@core/model/establishment.model';
import { Observable, of } from 'rxjs';

export class MockEstablishmentService extends EstablishmentService {
  public get establishment$(): Observable<Establishment> {
    return of({
      id: 0,
      uid: ''
    } as Establishment);
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
