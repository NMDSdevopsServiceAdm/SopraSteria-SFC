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
    return this.http.get<GetJobsResponse>('/api/jobs').pipe(map(res => res.jobs));
  }
}
