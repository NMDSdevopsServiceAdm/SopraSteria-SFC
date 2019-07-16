import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, Router } from '@angular/router';
import { EstablishmentService } from '@core/services/establishment.service';
import { of } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable()
export class WorkplaceResolver implements Resolve<any> {
  constructor(private router: Router, private establishmentService: EstablishmentService) {}

  resolve(route: ActivatedRouteSnapshot) {
    return this.establishmentService.getEstablishment(route.paramMap.get('establishmentuid')).pipe(
      catchError(() => {
        this.router.navigate(['/dashboard'], { fragment: 'workplace' });
        return of(null);
      })
    );
  }
}
