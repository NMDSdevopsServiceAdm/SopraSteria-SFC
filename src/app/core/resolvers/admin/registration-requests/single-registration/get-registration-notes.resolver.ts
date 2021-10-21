import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, Router } from '@angular/router';
import { Note } from '@core/model/registrations.model';
import { RegistrationsService } from '@core/services/registrations.service';
import { EMPTY, Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable()
export class GetRegistrationNotesResolver implements Resolve<any> {
  constructor(private router: Router, private registrationsService: RegistrationsService) {}

  resolve(route: ActivatedRouteSnapshot): Observable<Note[]> {
    const lastUrlSegmentIndex = route.url.length - 1;
    const establishmentUid = route.url[lastUrlSegmentIndex].path;

    return this.registrationsService.getRegistrationNotes(establishmentUid).pipe(
      catchError(() => {
        this.router.navigate(['/problem-with-the-service']);
        return EMPTY;
      }),
    );
  }
}
