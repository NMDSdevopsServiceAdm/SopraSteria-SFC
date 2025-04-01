import { Injectable } from '@angular/core';
import { Job } from '@core/model/job.model';
import { JobService } from '@core/services/job.service';
import { Observable, of } from 'rxjs';
import { AllJobs } from '../../../../src/mockdata/jobs';

@Injectable()
export class MockJobService extends JobService {
  public getJobs(): Observable<Job[]> {
    return of(AllJobs);
  }
}

export const MockJobRoles = [
  {
    id: 4,
    title: 'Allied health professional (not occupational therapist)',
    jobRoleGroup: 'Professional and related roles',
  },
  {
    id: 10,
    title: 'Care worker',
    jobRoleGroup: 'Care providing roles',
  },
  {
    id: 23,
    title: 'Registered nurse',
    jobRoleGroup: 'Professional and related roles',
  },
  {
    id: 27,
    title: 'Social worker',
    jobRoleGroup: 'Professional and related roles',
  },
  {
    id: 20,
    title: 'Other (directly involved in providing care)',
    jobRoleGroup: 'Care providing roles',
  },
];
