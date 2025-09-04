import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Worker } from '@core/model/worker.model';
import { EstablishmentService } from '@core/services/establishment.service';
import { PermissionsService } from '@core/services/permissions/permissions.service';
import { PreviousRouteService } from '@core/services/previous-route.service';
import { SortByService } from '@core/services/sort-by.service';
import { TabsService } from '@core/services/tabs.service';
import { WorkerService } from '@core/services/worker.service';
import { StaffSummaryDirective } from '@shared/directives/staff-summary/staff-summary.directive';

@Component({
  selector: 'app-staff-summary',
  templateUrl: './staff-summary.component.html',
})
export class StaffSummaryComponent extends StaffSummaryDirective implements OnInit {
  constructor(
    protected permissionsService: PermissionsService,
    protected workerService: WorkerService,
    protected router: Router,
    protected route: ActivatedRoute,
    protected establishmentService: EstablishmentService,
    protected tabsService: TabsService,
    protected previousRouteService: PreviousRouteService,
    protected sortByService: SortByService,
  ) {
    super(permissionsService, workerService, router, route, establishmentService, tabsService, sortByService);
  }

  protected init(): void {
    this.saveAllWorkerIdsInLocalStorage();
  }

  public getWorkerRecordPath(event: Event, worker: Worker) {
    event.preventDefault();
    const path = ['/workplace', this.workplace.uid, 'staff-record', worker.uid, 'staff-record-summary'];
    this.router.navigate(this.wdfView ? [...path, 'wdf-summary'] : path);
  }

  private saveAllWorkerIdsInLocalStorage(): void {
    const listOfAllWorkers = this.route.snapshot?.data?.workers?.listOfAllWorkers as Worker[];

    if (!this.wdfView && listOfAllWorkers?.length > 0) {
      const listOfAllWorkerIds = listOfAllWorkers.map((worker) => worker.uid);
      localStorage.setItem('ListOfWorkers', JSON.stringify(listOfAllWorkerIds));
    }
  }
}
