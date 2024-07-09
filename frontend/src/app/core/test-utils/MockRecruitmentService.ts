import { Injectable } from '@angular/core';
import { RecruitmentResponse, RecruitmentService } from '@core/services/recruitment.service';
import { Observable, of } from 'rxjs';

@Injectable()
export class MockRecruitmentService extends RecruitmentService {
  public getRecruitedFrom(): Observable<RecruitmentResponse[]> {
    return of([
      {
        id: 1,
        from: 'Adult care sector: local authority',
      },
      {
        id: 2,
        from: 'Adult care sector: private or voluntary sector',
      },
      {
        id: 3,
        from: 'Health sector',
      },
      {
        id: 4,
        from: "Children's, young people's social care",
      },
      {
        id: 5,
        from: 'Other care sector',
      },
      {
        id: 6,
        from: 'Internal promotion, transfer or career development',
      },
      {
        id: 7,
        from: 'Not previously employed',
      },
      {
        id: 8,
        from: 'Agency',
      },
      {
        id: 9,
        from: 'First job role after education',
      },
      {
        id: 10,
        from: 'Other',
      },
    ]);
  }
}
