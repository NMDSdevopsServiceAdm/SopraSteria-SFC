import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot } from '@angular/router';
import { CareWorkforcePathwayService } from '@core/services/care-workforce-pathway.service';
import { EstablishmentService } from '@core/services/establishment.service';
import { PermissionsService } from '@core/services/permissions/permissions.service';
import { catchError, of } from 'rxjs';

@Injectable()
export class GetWorkersWhoMeetNewToCareCriteriaResolver {
  constructor(
    private permissionsService: PermissionsService,
    private careWorkforcePathwayService: CareWorkforcePathwayService,
    private establishmentService: EstablishmentService,
  ) {}

  resolve(route: ActivatedRouteSnapshot) {
    const workplaceUid = route.paramMap.get('establishmentuid')
      ? route.paramMap.get('establishmentuid')
      : this.establishmentService.establishmentId;

    if (!this.permissionsService.can(workplaceUid, 'canEditWorker')) return of([]);

    return this.careWorkforcePathwayService.getWorkersWhoMeetNewToCareCriteria(workplaceUid).pipe(
      catchError(() => {
        return of([]);
      }),
    );
  }
}
