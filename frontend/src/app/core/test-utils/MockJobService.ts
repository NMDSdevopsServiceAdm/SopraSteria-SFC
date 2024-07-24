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
