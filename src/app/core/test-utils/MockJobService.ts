import { JobService} from '@core/services/job.service';
import { Observable, of } from 'rxjs';
import { Job } from '@core/model/job.model';


export class MockJobService extends JobService {

  public getJobs(): Observable<Job[]> {
    return of([
      {
        id: 0,
        title: 'Job0',
      }, {
        id: 1,
        title: 'Job1',
      }, {
        id: 2,
        title: 'Job2',
      }, {
        id: 3,
        title: 'Job3',
        other: true
      },
    ] as Job[]) ;
  }

}
