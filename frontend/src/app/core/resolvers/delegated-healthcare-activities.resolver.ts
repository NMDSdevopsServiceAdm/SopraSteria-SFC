import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { DelegatedHealthcareActivitiesService } from '@core/services/delegated-healthcare-activities.service';
import { DelegatedHealthcareActivity } from '@core/model/delegated-healthcare-activites.model';

@Injectable()
export class DelegatedHealthcareActivitiesResolver {
  constructor(private delegatedHealthcareActivitiesService: DelegatedHealthcareActivitiesService) {}
  resolve(): Observable<DelegatedHealthcareActivity[]> {
    return this.delegatedHealthcareActivitiesService.getAllDelegatedHealthcareActivities().pipe(
      catchError(() => {
        return of(null);
      }),
    );
  }
}
