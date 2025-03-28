import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, NavigationStart, Router } from '@angular/router';
import { JourneyType } from '@core/breadcrumb/breadcrumb.model';
import { Establishment } from '@core/model/establishment.model';
import { URLStructure } from '@core/model/url.model';
import { Worker } from '@core/model/worker.model';
import { AlertService } from '@core/services/alert.service';
import { BackLinkService } from '@core/services/backLink.service';
import { BreadcrumbService } from '@core/services/breadcrumb.service';
import { DialogService } from '@core/services/dialog.service';
import { EstablishmentService } from '@core/services/establishment.service';
import { PermissionsService } from '@core/services/permissions/permissions.service';
import { WorkerService } from '@core/services/worker.service';
import { Subscription } from 'rxjs';
import { take } from 'rxjs/operators';

import { MoveWorkerDialogComponent } from '../move-worker-dialog/move-worker-dialog.component';

@Component({
  selector: 'app-staff-record',
  templateUrl: './staff-record.component.html',
})
export class StaffRecordComponent implements OnInit, OnDestroy {
  public canDeleteWorker: boolean;
  public canEditWorker: boolean;
  public isParent: boolean;
  public returnToRecord: URLStructure;
  public worker: Worker;
  public workplace: Establishment;
  public hasCompletedStaffRecordFlow: boolean;
  public continueRoute: string[];
  private subscriptions: Subscription = new Subscription();

  constructor(
    private alertService: AlertService,
    private dialogService: DialogService,
    private establishmentService: EstablishmentService,
    private permissionsService: PermissionsService,
    private route: ActivatedRoute,
    private router: Router,
    private workerService: WorkerService,
    protected backLinkService: BackLinkService,
    public breadcrumbService: BreadcrumbService,
  ) {}

  ngOnInit(): void {
    this.hasCompletedStaffRecordFlow = this.workerService.hasCompletedStaffRecordFlow;
    this.workplace = this.route.parent.snapshot.data.establishment;
    this.isParent = this.establishmentService.primaryWorkplace.isParent;

    if (this.hasCompletedStaffRecordFlow) {
      this.continueRoute = ['/workplace', this.workplace.uid, 'staff-record', 'add-another-staff-record'];
      this.trackNavigationToClearHasCompletedStaffRecordFlow();
    }

    this.subscriptions.add(
      this.workerService.worker$.pipe(take(1)).subscribe((worker) => {
        this.worker = worker;
        if (!this.worker?.completed && this.hasCompletedStaffRecordFlow) {
          this.updateCompleted();
        }
      }),
    );

    this.breadcrumbService.show(JourneyType.STAFF_RECORDS_TAB);

    this.subscriptions.add(
      this.workerService.alert$.subscribe((alert) => {
        if (alert) {
          this.alertService.addAlert(alert);
        }
      }),
    );

    this.canDeleteWorker = this.permissionsService.can(this.workplace.uid, 'canDeleteWorker');
    this.canEditWorker = this.permissionsService.can(this.workplace.uid, 'canEditWorker');
  }

  public backLinkNavigation(): URLStructure {
    return this.worker.otherQualification === 'Yes'
      ? { url: ['/workplace', this.workplace.uid, 'staff-record', this.worker.uid, 'other-qualifications-level'] }
      : { url: ['/workplace', this.workplace.uid, 'staff-record', this.worker.uid, 'other-qualifications'] };
  }

  public moveWorker(event: Event): void {
    event.preventDefault();
    this.dialogService.open(MoveWorkerDialogComponent, {
      worker: this.worker,
      workplace: this.workplace,
      primaryWorkplaceUid: this.route.parent.snapshot.data.primaryWorkplace
        ? this.route.parent.snapshot.data.primaryWorkplace.uid
        : null,
    });
  }

  private updateCompleted(): void {
    const props = {
      completed: true,
    };

    this.subscriptions.add(
      this.workerService.updateWorker(this.workplace.uid, this.worker.uid, props).subscribe(
        (data) => {
          this.workerService.setState({ ...this.worker, ...data });
        },
        (error) => {
          console.log(error);
        },
      ),
    );
  }

  private trackNavigationToClearHasCompletedStaffRecordFlow(): void {
    this.subscriptions.add(
      this.router.events.subscribe((event) => {
        if (event instanceof NavigationStart) {
          if (!event.url?.includes('staff-record-summary') && !event.url?.includes('add-another-staff-record')) {
            this.workerService.clearHasCompletedStaffRecordFlow();
          }
        }
      }),
    );
  }

  public setReturnTo(): void {
    this.returnToRecord = {
      url: ['/workplace', this.workplace.uid, 'staff-record', this.worker.uid],
      fragment: 'staff-record',
    };
    this.workerService.setReturnTo(this.returnToRecord);
  }

  ngOnDestroy(): void {
    this.breadcrumbService.removeRoutes();
    this.subscriptions.unsubscribe();
  }
}
