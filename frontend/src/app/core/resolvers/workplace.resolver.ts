import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Router } from '@angular/router';
import { EstablishmentService } from '@core/services/establishment.service';
import { of } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable()
export class WorkplaceResolver  {
  constructor(private router: Router, private establishmentService: EstablishmentService) {}

  resolve(route: ActivatedRouteSnapshot) {
    const withFunding = route.data?.withFunding ? true : false;

    return this.establishmentService
      .getEstablishment(
        route.paramMap.get('establishmentuid')
          ? route.paramMap.get('establishmentuid')
          : this.establishmentService.establishmentId,
        withFunding,
      )
      .pipe(
        catchError(() => {
          this.router.navigate(['/dashboard'], { fragment: 'workplace' });
          return of(null);
        }),
      );
  }
}
