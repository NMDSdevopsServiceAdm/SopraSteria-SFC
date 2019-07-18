import { Injectable } from '@angular/core';
import { Resolve, Router } from '@angular/router';
import { EstablishmentService } from '@core/services/establishment.service';
import { of } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable()
export class PrimaryWorkplaceResolver implements Resolve<any> {
  constructor(private router: Router, private establishmentService: EstablishmentService) {}

  resolve() {
    return this.establishmentService.primaryEstablishment$.pipe(
      catchError(() => {
        this.router.navigate(['/dashboard'], { fragment: 'workplace' });
        return of(null);
      })
    );
  }
}
