import { Injectable } from '@angular/core';
import { Router, Resolve, RouterStateSnapshot, ActivatedRouteSnapshot } from '@angular/router';
import { WorkersWithPayDataResponse } from '@core/model/worker.model';
import { WorkerService } from '@core/services/worker.service';
import { Observable, of } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class WorkersWithPayDataResolver implements Resolve<WorkersWithPayDataResponse> {
  constructor(private workerService: WorkerService) {}

  resolve(route: ActivatedRouteSnapshot): Observable<WorkersWithPayDataResponse> {
    const establishmentUid = route.paramMap.get('establishmentuid');
    return this.workerService.getWorkersWithPayData(establishmentUid);
  }
}
