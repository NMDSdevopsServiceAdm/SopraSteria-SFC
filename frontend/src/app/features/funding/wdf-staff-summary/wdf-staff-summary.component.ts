import { Component, Input } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { EstablishmentService } from '@core/services/establishment.service';
import { PermissionsService } from '@core/services/permissions/permissions.service';
import { SortByService } from '@core/services/sort-by.service';
import { TabsService } from '@core/services/tabs.service';
import { WorkerService } from '@core/services/worker.service';
import { StaffSummaryDirective } from '@shared/directives/staff-summary/staff-summary.directive';
import { orderBy } from 'lodash';

@Component({
    selector: 'app-wdf-staff-summary',
    templateUrl: './wdf-staff-summary.component.html',
    standalone: false
})
export class WdfStaffSummaryComponent extends StaffSummaryDirective {
  @Input() overallWdfEligibility: boolean;

  public wdfView = true;
  public workplaceUid: string;

  constructor(
    protected permissionsService: PermissionsService,
    protected workerService: WorkerService,
    protected router: Router,
    protected route: ActivatedRoute,
    protected establishmentService: EstablishmentService,
    protected tabsService: TabsService,
    protected sortByService: SortByService,
  ) {
    super(permissionsService, workerService, router, route, establishmentService, tabsService, sortByService);
  }

  public getWorkerRecordPath(worker) {
    if (this.route.snapshot.params.establishmentuid) {
      this.workplaceUid = this.route.snapshot.params.establishmentuid;
      return ['/funding', 'workplaces', this.workplaceUid, 'staff-record', worker.uid];
    } else {
      this.workplaceUid = this.establishmentService.primaryWorkplace.uid;
      return ['/funding', 'staff-record', worker.uid];
    }
  }

  protected init() {
    this.saveWorkerList();
  }

  ngOnChanges() {
    this.workers = this.workers.map((worker) => {
      worker.jobRole = worker.mainJob.other ? worker.mainJob.other : worker.mainJob.title;
      return worker;
    });
    this.workers = orderBy(this.workers, [(worker) => worker.nameOrId.toLowerCase()], ['asc']);

    this.saveWorkerList();
  }

  public saveWorkerList() {
    const listOfWorkerUids = this.workers.map((worker) => worker.uid);
    localStorage.setItem('ListOfWorkers', JSON.stringify(listOfWorkerUids));
  }

  public navigateToStaffRecords(event: Event): void {
    event.preventDefault();
    if (this.route.snapshot.params.establishmentuid) {
      this.router.navigate(['/subsidiary', this.workplace.uid, 'staff-records']);
    } else {
      this.router.navigate(['dashboard'], { fragment: 'staff-records' });
    }
  }
}
