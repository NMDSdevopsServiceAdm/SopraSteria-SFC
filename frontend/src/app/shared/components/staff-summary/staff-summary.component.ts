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
  standalone: false,
})
export class StaffSummaryComponent extends StaffSummaryDirective implements OnInit {
  public showNewPill: boolean = false;
  public workplaceUid: string;
  public showUpdatePayForMultipleStaffLink = false;
  public updatePayForMultipleStaffLinkText = 'Update pay for multiple staff';

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
    this.showNewPill = !this.workplace?.updatePayForMultiStaffViewed;
    this.workplaceUid = this.workplace.uid;
    const userHasEditPermissions =
      this.permissionsService.can(this.workplaceUid, 'canEditWorker') &&
      this.permissionsService.can(this.workplaceUid, 'canEditEstablishment');
    this.showUpdatePayForMultipleStaffLink = userHasEditPermissions && this.workerCount > 1;
  }

  public getWorkerRecordPath(event: Event, worker: Worker) {
    event.preventDefault();
    const path = ['/workplace', this.workplace.uid, 'staff-record', worker.uid, 'staff-record-summary'];
    this.router.navigate(this.wdfView ? [...path, 'wdf-summary'] : path);
  }

  private setUpdatePayForMultiStaffViewed(): void {
    const data = {
      property: 'updatePayForMultiStaffViewed',
      value: true,
    };
    this.subscriptions.add(
      this.establishmentService.updateSingleEstablishmentField(this.workplaceUid, data).subscribe(),
    );
  }

  public handleOnClick(): void {
    if (this.showNewPill) {
      this.setUpdatePayForMultiStaffViewed();
    }
    this.router.navigate(['workplace', this.workplaceUid, 'staff-record', 'update-pay-for-multiple-staff']);
  }
}
