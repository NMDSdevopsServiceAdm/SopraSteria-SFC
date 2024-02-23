import { Injectable } from '@angular/core';
import { Resolve, Router, ActivatedRouteSnapshot } from '@angular/router';
import { WorkerService } from '@core/services/worker.service';
import { ParentSubsidiaryViewService } from '@shared/services/parent-subsidiary-view.service';
import { of } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class SubsidiaryWorkerResolver implements Resolve<any> {

  constructor(
    private workerService: WorkerService,
    private parentSubsidiaryViewService: ParentSubsidiaryViewService
  ) { }

  resolve(route: ActivatedRouteSnapshot) {
    const subsidiaryUid = this.parentSubsidiaryViewService.getSubsidiaryUid() ?
      this.parentSubsidiaryViewService.getSubsidiaryUid() :
      route.paramMap.get('subsidiaryUid');
    console.log("SubsidaryUid resolver: ", subsidiaryUid);

    const workerId = route.paramMap.get('id'); //FIX

    if (subsidiaryUid) {
      return this.workerService.getWorker(
        subsidiaryUid,
        workerId);
    }

    return of(null);
  }
}