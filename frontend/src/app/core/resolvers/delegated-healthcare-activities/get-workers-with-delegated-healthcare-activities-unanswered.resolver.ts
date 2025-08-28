import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot } from '@angular/router';
import { DelegatedHealthcareActivitiesService } from '@core/services/delegated-healthcare-activities.service';
import { EstablishmentService } from '@core/services/establishment.service';
import { PermissionsService } from '@core/services/permissions/permissions.service';
import { of } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable()
export class GetWorkersWhoRequireDelegatedHealthcareActivitiesAnswerResolver {
  constructor(
    private permissionsService: PermissionsService,
    private delegatedHealthcareActivitiesService: DelegatedHealthcareActivitiesService,
    private establishmentService: EstablishmentService,
  ) {}

  resolve(route: ActivatedRouteSnapshot) {
    const queryParams = { pageIndex: 0, itemsPerPage: 15 };

    const workplaceUid = route.paramMap.get('establishmentuid')
      ? route.paramMap.get('establishmentuid')
      : this.establishmentService.establishmentId;

    if (!this.permissionsService.can(workplaceUid, 'canEditWorker')) return of(null);

    return this.delegatedHealthcareActivitiesService
      .getWorkersWhoRequireCarriesOutDelegatedHealthCareActivitiesAnswer(workplaceUid, queryParams)
      .pipe(
        catchError(() => {
          return of(null);
        }),
      );
  }
}
