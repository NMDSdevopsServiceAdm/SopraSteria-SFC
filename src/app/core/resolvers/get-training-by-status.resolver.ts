import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, Router } from '@angular/router';
import { EstablishmentService } from '@core/services/establishment.service';
import { TrainingService } from '@core/services/training.service';
import { of } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable()
export class GetTrainingByStatusResolver implements Resolve<any> {
  constructor(
    private router: Router,
    private trainingService: TrainingService,
    private establishmentService: EstablishmentService,
  ) {}

  resolve(route: ActivatedRouteSnapshot) {
    const workplaceUid = this.establishmentService.establishmentId;
    const status = route.data.training;
    return this.trainingService.getAllTrainingByStatus(workplaceUid, status).pipe(
      catchError(() => {
        this.router.navigate(['/problem with the service']);
        return of(null);
      }),
    );
  }
}
