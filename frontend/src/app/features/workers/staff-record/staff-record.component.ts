import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
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
import { VacanciesAndTurnoverService } from '@core/services/vacancies-and-turnover.service';
import { WorkerService } from '@core/services/worker.service';
import { Subscription } from 'rxjs';
import { filter, mergeMap, skip } from 'rxjs/operators';

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
  public workerList: string[];
  public exitUrl: URLStructure;
  public staffSummaryBaseUrl: URLStructure;
  public staffSummaryUrlSuffix: string;
  private subscriptions: Subscription = new Subscription();

  constructor(
    private alertService: AlertService,
    private dialogService: DialogService,
    private establishmentService: EstablishmentService,
    private permissionsService: PermissionsService,
    private route: ActivatedRoute,
    private workerService: WorkerService,
    protected backLinkService: BackLinkService,
    public breadcrumbService: BreadcrumbService,
    private vacanciesAndTurnoverService: VacanciesAndTurnoverService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.hasCompletedStaffRecordFlow = this.workerService.addStaffRecordInProgress;
    this.workplace = this.route.parent.snapshot.data.establishment;
    this.isParent = this.establishmentService.primaryWorkplace.isParent;

    if (this.hasCompletedStaffRecordFlow) {
      this.showContinueButtons();
    }

    this.subscriptions.add(
      this.workerService.worker$.pipe().subscribe((worker) => {
        this.worker = worker;
        if (!this.worker?.completed) {
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

    this.getListOfWorkers();
    this.setPaginationUrls();
    this.setupSubscriptionForPagination();
  }

  private setPaginationUrls() {
    this.exitUrl = { url: ['/dashboard'], fragment: 'staff-records' };
    this.staffSummaryBaseUrl = { url: ['/workplace', this.workplace.uid, 'staff-record'] };
    this.staffSummaryUrlSuffix = 'staff-record-summary';
  }

  private getListOfWorkers(): void {
    this.workerList = JSON.parse(localStorage.getItem('ListOfWorkers'));
  }

  private setupSubscriptionForPagination(): void {
    const dataFromResolver = this.route.parent.data;
    const reloadWorkerOnPageChange = dataFromResolver?.pipe(skip(1)).subscribe((data) => {
      if (!data?.worker) {
        return;
      }
      this.workerService.setState(data.worker);
    });

    const keepBreadcrumbOnPageChange = this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe((_event) => {
        this.breadcrumbService.show(JourneyType.STAFF_RECORDS_TAB);
      });

    this.subscriptions.add(reloadWorkerOnPageChange);
    this.subscriptions.add(keepBreadcrumbOnPageChange);
  }

  private showContinueButtons(): void {
    this.continueRoute = ['/workplace', this.workplace.uid, 'staff-record', 'add-another-staff-record'];
    this.vacanciesAndTurnoverService.clearDoYouWantToAddOrDeleteAnswer();
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
