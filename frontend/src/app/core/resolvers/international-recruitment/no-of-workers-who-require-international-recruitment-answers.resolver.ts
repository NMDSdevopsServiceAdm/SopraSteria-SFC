import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve } from '@angular/router';
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

  resolve(route: ActivatedRouteSnapshot) {
    const workplaceUid = route.paramMap.get('establishmentuid')
      ? route.paramMap.get('establishmentuid')
      : this.establishmentService.establishmentId;

    return this.internationalRecruitmentService
      .getNoOfWorkersWhoRequireInternationalRecruitmentAnswers(workplaceUid)
      .pipe(
        catchError(() => {
          return of(null);
        }),
      );
  }
}
