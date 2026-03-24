import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { JourneyType } from '@core/breadcrumb/breadcrumb.model';
import { Establishment } from '@core/model/establishment.model';
import { Worker } from '@core/model/worker.model';
import { BreadcrumbService } from '@core/services/breadcrumb.service';
import { EstablishmentService } from '@core/services/establishment.service';
import { PermissionsService } from '@core/services/permissions/permissions.service';
import { WorkerService } from '@core/services/worker.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-view-subsidiary-staff-records',
  templateUrl: './view-subsidiary-staff-records.component.html',
  standalone: false,
})
export class ViewSubsidiaryStaffRecordsComponent implements OnInit, OnDestroy {
  public workplace: Establishment;
  public workers: Worker[];
  public workerCount: number;
  public canAddWorker: boolean;
  public staffLastUpdatedDate: string;
  public showNewPill: boolean;
  private subscriptions: Subscription = new Subscription();

  constructor(
    private breadcrumbService: BreadcrumbService,
    private permissionsService: PermissionsService,
    private workerService: WorkerService,
    private route: ActivatedRoute,
    private router: Router,
    private establishmentService: EstablishmentService,
  ) {}

  ngOnInit(): void {
    this.breadcrumbService.show(JourneyType.SUBSIDIARY);
    this.workerService.setAddStaffRecordInProgress(false);

    this.workers = this.route.snapshot.data.workers?.workers;
    this.workerCount = this.route.snapshot.data.workers?.workerCount;

    this.workplace = this.route.snapshot.data.establishment;
    this.canAddWorker = this.permissionsService.can(this.workplace.uid, 'canAddWorker');

    this.staffLastUpdatedDate = this.workers.length > 0 && this.getStaffLastUpdatedDate();
    this.showNewPill = !this.workplace?.updatePayForMultiStaffViewed;
  }

  private getStaffLastUpdatedDate(): string {
    const lastUpdatedDates = this.workers.map((worker) => new Date(worker.updated).getTime());
    return new Date(Math.max(...lastUpdatedDates)).toISOString();
  }

  private setUpdatePayForMultiStaffViewed(): void {
    const data = {
      property: 'updatePayForMultiStaffViewed',
      value: true,
    };
    this.subscriptions.add(
      this.establishmentService.updateSingleEstablishmentField(this.workplace.uid, data).subscribe(),
    );
  }

  handleOnClick(event: Event): void {
    if (this.showNewPill) {
      this.setUpdatePayForMultiStaffViewed();
    }

    this.router.navigate(['workplace', this.workplace.uid, 'update-pay-multiple-staff']);
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
}
