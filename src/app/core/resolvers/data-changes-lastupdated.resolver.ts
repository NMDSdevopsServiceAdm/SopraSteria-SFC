import { Injectable } from '@angular/core';
import { Resolve, Router } from '@angular/router';
import { DataChangeService } from '@core/services/data-change.service';
import { EstablishmentService } from '@core/services/establishment.service';
import { of } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable()
export class DataChangeLastUpdatedResolver implements Resolve<any> {
  constructor(
    private dataChangeService: DataChangeService,
    private establishmentService: EstablishmentService,
    private router: Router,
  ) {}

  resolve() {
    const establishmentId = this.establishmentService.establishmentId;
    return this.dataChangeService.getDataChangesLastUpdate(establishmentId).pipe(
      catchError(() => {
        this.router.navigate(['/problem-with-the-service']);
        return of(null);
      }),
    );
  }
}
