import { Injectable } from '@angular/core';
import { Resolve, Router } from '@angular/router';
import { Registrations } from '@core/model/registrations.model';
import { RegistrationsService } from '@core/services/registrations.service';
import { EMPTY, Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable()
export class GetRejectedRegistrationsResolver implements Resolve<any> {
  constructor(private router: Router, private registrationsService: RegistrationsService) {}

  resolve(): Observable<Registrations[]> {
    return this.registrationsService.getRegistrations('rejected').pipe(
      catchError(() => {
        this.router.navigate(['/problem-with-the-service']);
        return EMPTY;
      }),
    );
  }
}
