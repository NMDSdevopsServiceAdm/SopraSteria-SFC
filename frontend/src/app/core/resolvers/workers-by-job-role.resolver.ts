import { Injectable } from '@angular/core';
import { WorkerService } from '@core/services/worker.service';
import { Observable } from 'rxjs';
import { WorkersGroupedByJobRoleResponse } from '@core/model/worker.model';
import { ActivatedRouteSnapshot } from '@angular/router';

@Injectable()
export class WorkersByJobRoleResolver{
  constructor(
    private workerService: WorkerService,
  ) {}

  resolve(route: ActivatedRouteSnapshot): Observable<WorkersGroupedByJobRoleResponse>{
    const establishmentUid = route.paramMap.get('establishmentuid');
    return this.workerService.getAllWorkersGroupedByJobRole(establishmentUid);
  }
}
