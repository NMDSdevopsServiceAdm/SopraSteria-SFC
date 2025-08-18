import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { DelegatedHealthcareActivity } from '@core/model/delegated-healthcare-activities.model';
import { DelegatedHealthcareActivitiesService } from '@core/services/delegated-healthcare-activities.service';
import { Observable, of } from 'rxjs';

export const mockDHAs = [
  {
    id: 1,
    title: 'Vital signs monitoring',
    description: 'Like monitoring heart rate as part of the treatment of a condition.',
  },
  {
    id: 2,
    title: 'Specialised medication administration',
    description: 'Like administering warfarin.',
  },
  {
    id: 8,
    title: 'Other delegated healthcare activity',
    description: 'Something else delegated by a regulated healthcare professional',
  },
];

export const mockDHADefinition =
  "We're using the term delegated healthcare to describe activities, usually (but not exclusively) of a clinical nature, that a regulated healthcare professional delegates to a paid care or support worker. Delegated healthcare activities are sometimes called 'tasks' or 'interventions'.";

@Injectable()
export class MockDelegatedHealthcareActivitiesService extends DelegatedHealthcareActivitiesService {
  public _workerHasDHAAnswered: boolean = true;

  getDelegatedHealthcareActivities(): Observable<DelegatedHealthcareActivity[]> {
    return of(mockDHAs);
  }

  checkIfAnyWorkerHasDHAAnswered(_establishmentId: string): Observable<boolean> {
    return of(this._workerHasDHAAnswered);
  }

  public get dhaDefinition(): string {
    return mockDHADefinition;
  }

  public static factory(overrides: any = {}) {
    return (httpClient: HttpClient) => {
      const service = new MockDelegatedHealthcareActivitiesService(httpClient);

      Object.keys(overrides).forEach((overrideName) => {
        if (overrideName === 'workerHasDHAAnswered') {
          service._workerHasDHAAnswered = overrides[overrideName];
          return;
        }
        service[overrideName] = overrides[overrideName];
      });

      return service;
    };
  }
}
