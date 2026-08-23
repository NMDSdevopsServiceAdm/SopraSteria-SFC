import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { WorkerService } from '@core/services/worker.service';
import { NurseFieldOfPractice } from '@core/model/nurse-field-of-practice.model';

@Injectable()
export class AllNurseFieldsOfPracticeResolver {
  constructor(private workerService: WorkerService) {}
  resolve(): Observable<NurseFieldOfPractice[]> {
    return this.workerService.getAllNurseFieldsOfPractice().pipe(
      catchError(() => {
        return of([]);
      }),
    );
  }
}
