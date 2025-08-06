import { Injectable } from '@angular/core';
import { DelegatedHealthcareActivity } from '@core/model/delegated-healthcare-activities.model';
import { DelegatedHealthcareActivitiesService } from '@core/services/delegated-healthcare-activities.service';
import { Observable } from 'rxjs';

@Injectable()
export class GetDelegatedHealthcareActivitiesResolver {
  constructor(private delegatedHealthcareActivitiesService: DelegatedHealthcareActivitiesService) {}

  resolve(): Observable<DelegatedHealthcareActivity[]> {
    return this.delegatedHealthcareActivitiesService.getDelegatedHealthcareActivities();
  }
}
