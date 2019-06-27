import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { GetJobsResponse, Job } from '@core/model/job.model';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class JobService {
  constructor(private http: HttpClient) {}

  public getJobs(): Observable<Job[]> {
    return this.http.get<GetJobsResponse>('/api/jobs').pipe(map(this.sortJobs));
  }

  private sortJobs(response): Job[] {
    const { jobs } = response;
    const otherJobs: Job[] = [];
    const nonOtherJobs: Job[] = [];

    return jobs.reduce((acc, job) => {
      if (job.other) {
        otherJobs.push(job);
      } else {
        nonOtherJobs.push(job);
      }
      return [...nonOtherJobs, ...otherJobs];
    }, []);
  }
}
