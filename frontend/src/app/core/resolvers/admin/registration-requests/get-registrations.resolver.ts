import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, Router } from '@angular/router';
import { Registrations } from '@core/model/registrations.model';
import { RegistrationsService } from '@core/services/registrations.service';
import { EMPTY, Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable()
export class GetRegistrationsResolver implements Resolve<any> {
  constructor(private router: Router, private registrationsService: RegistrationsService) {}

  resolve(route: ActivatedRouteSnapshot): Observable<Registrations[]> {
    const lastUrlSegmentIndex = route.url.length - 1;
    let status;

    if (lastUrlSegmentIndex === -1) {
      status = 'pending';
    } else {
      status = route.url[lastUrlSegmentIndex].path;
    }

    return this.registrationsService.getRegistrations(status).pipe(
      catchError(() => {
        this.router.navigate(['/problem-with-the-service']);
        return EMPTY;
      }),
    );
  }
}
