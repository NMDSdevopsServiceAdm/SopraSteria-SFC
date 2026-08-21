import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { WorkerService } from '@core/services/worker.service';
import { RegisteredNurse } from '@core/model/nurse-field-of-practice.model';
import { ActivatedRouteSnapshot } from '@angular/router';

@Injectable()
export class RegisteredNursesResolver {
  constructor(private workerService: WorkerService) {}
  resolve(route: ActivatedRouteSnapshot): Observable<RegisteredNurse[]> {
    const workplaceUid = route.paramMap.get('establishmentuid')!;
    return this.workerService.getAllRegisteredNurses(workplaceUid).pipe(
      catchError(() => {
        return of([]);
      }),
    );
  }
}
