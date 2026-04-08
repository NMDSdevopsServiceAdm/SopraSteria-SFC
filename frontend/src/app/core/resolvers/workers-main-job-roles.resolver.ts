import { Injectable } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot } from '@angular/router';
import { EstablishmentService, WorkersMainJobRolesResponse } from '@core/services/establishment.service';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class WorkersMainJobRolesResolver implements Resolve<WorkersMainJobRolesResponse['mainJobRoles']> {
  constructor(private establishmentService: EstablishmentService) {}

  resolve(route: ActivatedRouteSnapshot): Observable<WorkersMainJobRolesResponse['mainJobRoles']> {
    const establishmentUid = route.paramMap.get('establishmentuid')!;
    return this.establishmentService
      .getMainJobRoleForAllWorkers(establishmentUid)
      .pipe(map((response) => response.mainJobRoles));
  }
}
