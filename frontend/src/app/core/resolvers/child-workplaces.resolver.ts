import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { GetChildWorkplacesResponse } from '@core/model/my-workplaces.model';
import { EstablishmentService } from '@core/services/establishment.service';
import { WorkplaceService } from '@core/services/workplace.service';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable()
export class ChildWorkplacesResolver {
  constructor(
    private router: Router,
    private establishmentService: EstablishmentService,
    private workplaceService: WorkplaceService,
  ) {}

  resolve(): Observable<GetChildWorkplacesResponse | null> {
    const primaryWorkplaceUid = this.establishmentService.primaryWorkplace.uid;
    const sortByValueFromHomePage = this.workplaceService.getAllWorkplacesSortValue() ?? null;

    return this.establishmentService
      .getChildWorkplaces(primaryWorkplaceUid, {
        pageIndex: 0,
        itemsPerPage: 12,
        getPendingWorkplaces: true,
        sortBy: sortByValueFromHomePage,
      })
      .pipe(
        catchError(() => {
          this.router.navigate(['/problem-with-the-service']);
          return of(null);
        }),
      );
  }
}
