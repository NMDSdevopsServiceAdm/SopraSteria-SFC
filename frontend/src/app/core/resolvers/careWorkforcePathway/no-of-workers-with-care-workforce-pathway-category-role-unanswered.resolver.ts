import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot } from '@angular/router';
import { CareWorkforcePathwayService } from '@core/services/care-workforce-pathway.service';
import { EstablishmentService } from '@core/services/establishment.service';
import { PermissionsService } from '@core/services/permissions/permissions.service';
import { of } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable()
export class GetNoOfWorkersWhoRequireCareWorkforcePathwayRoleAnswerResolver {
  constructor(
    private permissionsService: PermissionsService,
    private careWorkforcePathwayService: CareWorkforcePathwayService,
    private establishmentService: EstablishmentService,
  ) {}

  resolve(route: ActivatedRouteSnapshot) {
    const workplaceUid = route.paramMap.get('establishmentuid')
      ? route.paramMap.get('establishmentuid')
      : this.establishmentService.establishmentId;

    if (!this.permissionsService.can(workplaceUid, 'canViewWorker')) return of(null);

    return this.careWorkforcePathwayService.getNoOfWorkersWhoRequireCareWorkforcePathwayRoleAnswer(workplaceUid).pipe(
      catchError(() => {
        return of(null);
      }),
    );
  }
}
