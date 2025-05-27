import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot } from '@angular/router';
import { EstablishmentService } from '@core/services/establishment.service';
import { InternationalRecruitmentService } from '@core/services/international-recruitment.service';
import { PermissionsService } from '@core/services/permissions/permissions.service';
import { of } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable()
export class GetNoOfWorkersWhoRequireInternationalRecruitmentAnswersResolver  {
  constructor(
    private internationalRecruitmentService: InternationalRecruitmentService,
    private establishmentService: EstablishmentService,
    private permissionsService: PermissionsService,
  ) {}

  resolve(route: ActivatedRouteSnapshot) {
    const workplaceUid = route.paramMap.get('establishmentuid')
      ? route.paramMap.get('establishmentuid')
      : this.establishmentService.establishmentId;

    if (!this.permissionsService.can(workplaceUid, 'canViewWorker')) return of(null);

    return this.internationalRecruitmentService
      .getNoOfWorkersWhoRequireInternationalRecruitmentAnswers(workplaceUid)
      .pipe(
        catchError(() => {
          return of(null);
        }),
      );
  }
}
