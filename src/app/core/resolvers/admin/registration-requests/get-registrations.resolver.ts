import { Injectable } from '@angular/core';
import { Resolve, Router } from '@angular/router';
import { Registrations } from '@core/model/registrations.model';
import { RegistrationsService } from '@core/services/registrations.service';
import { EMPTY, Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable()
export class GetRegistrationsResolver implements Resolve<any> {
  constructor(private router: Router, private registrationsService: RegistrationsService) {}

  resolve(): Observable<Registrations[]> {
    return this.registrationsService.getRegistrations('pending').pipe(
      catchError(() => {
        this.router.navigate(['/sfcadmin']);
        return EMPTY;
      }),
    );
  }
}
