import { Injectable } from '@angular/core';
import { Resolve } from '@angular/router';
import { EstablishmentService } from '@core/services/establishment.service';
import { InternationalRecruitmentService } from '@core/services/international-recruitment.service';
import { of } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable()
export class GetNoOfWorkersWhoRequireInternationalRecruitmentAnswersResolver implements Resolve<any> {
  constructor(
    private internationalRecruitmentService: InternationalRecruitmentService,
    private establishmentService: EstablishmentService,
  ) {}

  resolve() {
    const { uid } = this.establishmentService.establishment;
    return this.internationalRecruitmentService.getNoOfWorkersWhoRequireInternationalRecruitmentAnswers(uid).pipe(
      catchError(() => {
        return of(null);
      }),
    );
  }
}
