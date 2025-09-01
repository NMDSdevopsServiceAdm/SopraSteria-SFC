import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, ResolveFn } from '@angular/router';
import { DelegatedHealthcareActivitiesService } from '@core/services/delegated-healthcare-activities.service';
import { EstablishmentService } from '@core/services/establishment.service';
import { Observable } from 'rxjs';

@Injectable()
export class CheckIfAnyWorkerHasDHAAnsweredResolver {
  constructor(
    private establishmentService: EstablishmentService,
    private delegatedHealthcareActivitiesService: DelegatedHealthcareActivitiesService,
  ) {}

  resolve(route: ActivatedRouteSnapshot): Observable<boolean> {
    const workplaceUid = route.paramMap.get('establishmentuid')
      ? route.paramMap.get('establishmentuid')
      : this.establishmentService.establishmentId;
    return this.delegatedHealthcareActivitiesService.checkIfAnyWorkerHasDHAAnswered(workplaceUid);
  }
}
