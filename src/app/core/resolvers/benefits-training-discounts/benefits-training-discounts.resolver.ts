import { Injectable } from '@angular/core';
import { Resolve } from '@angular/router';
import { BenefitsTrainingDiscountsService } from '@core/services/benefits-training-discounts.service';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable()
export class BenefitsTrainingDiscountsResolver implements Resolve<any> {
  constructor(private benefitsTrainingDiscountsService: BenefitsTrainingDiscountsService) {}

  resolve(): Observable<any> {
    return this.benefitsTrainingDiscountsService.getBenefitsTrainingDiscounts().pipe(
      catchError(() => {
        return of(null);
      }),
    );
  }
}
