import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { GetJobsResponse, Job, JobGroup } from '@core/model/job.model';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class JobService {
  static jobGroupSummaryText = {
    'Care providing roles': 'care worker, community support, support worker',
    'Professional and related roles': 'occupational therapist, registered nurse, nursing assistant',
    'Managerial and supervisory roles': 'registered manager, supervisor, team leader',
    'IT, digital and data roles': 'data analyst, IT and digital support, IT manager',
    'Other roles': 'admin, care co-ordinator, learning and development',
  };

  constructor(private http: HttpClient) {}

  public getJobs(): Observable<Job[]> {
    return this.http.get<GetJobsResponse>(`${environment.appRunnerEndpoint}/api/jobs`).pipe(map(this.sortJobs));
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

  public static sortJobsByJobGroup(jobs: Job[]): JobGroup[] {
    const jobGroups: JobGroup[] = Object.entries(JobService.jobGroupSummaryText).map(
      ([groupTitle, descriptionText]) => {
        return {
          title: groupTitle,
          descriptionText: 'Jobs like ' + descriptionText,
          items: [],
        };
      },
    );

    jobs.forEach((job) => {
      const groupForCurrentJob = jobGroups.find((group) => group.title === job.jobRoleGroup);
      groupForCurrentJob.items.push({
        label: job.title,
        id: job.id,
      });
    });

    return jobGroups;
  }
}
