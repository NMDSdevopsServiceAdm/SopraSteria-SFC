import { Injectable } from '@angular/core';
import { Resolve, Router } from '@angular/router';
import { GetChildWorkplacesResponse } from '@core/model/my-workplaces.model';
import { EstablishmentService } from '@core/services/establishment.service';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable()
export class ChildWorkplacesResolver implements Resolve<any> {
  constructor(private router: Router, private establishmentService: EstablishmentService) {}

  resolve(): Observable<GetChildWorkplacesResponse | null> {
    const primaryWorkplaceUid = this.establishmentService.primaryWorkplace.uid;

    return this.establishmentService.getChildWorkplaces(primaryWorkplaceUid, { pageIndex: 0, itemsPerPage: 12 }).pipe(
      catchError(() => {
        this.router.navigate(['/problem-with-the-service']);
        return of(null);
      }),
    );
  }
}
