import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve } from '@angular/router';
import { WorkerService } from '@core/services/worker.service';

@Injectable()
export class WorkerResolver implements Resolve<any> {
  constructor(private workerService: WorkerService) {}

  resolve(route: ActivatedRouteSnapshot) {
    return this.workerService.getWorker(route.paramMap.get('id'));
  }
}
