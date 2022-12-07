import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { JourneyType } from '@core/breadcrumb/breadcrumb.model';
import { Establishment } from '@core/model/establishment.model';
import { URLStructure } from '@core/model/url.model';
import { Worker } from '@core/model/worker.model';
import { BackService } from '@core/services/back.service';
import { BreadcrumbService } from '@core/services/breadcrumb.service';
import { EstablishmentService } from '@core/services/establishment.service';
import { ReportService } from '@core/services/report.service';
import { WdfConfirmFieldsService } from '@core/services/wdf/wdf-confirm-fields.service';
import { WorkerService } from '@core/services/worker.service';
import dayjs from 'dayjs';
import { Subscription } from 'rxjs';
import { filter, map } from 'rxjs/operators';

@Component({
  selector: 'app-wdf-staff-record',
  templateUrl: './wdf-staff-record.component.html',
})
export class WdfStaffRecordComponent implements OnInit, OnDestroy {
  public worker: Worker;
  public updatedWorker: Worker;
  public workplace: Establishment;
  public workplaceUid: string;
  public primaryWorkplaceUid: string;
  public exitUrl: URLStructure;
  public returnTo: URLStructure;
  public overallWdfEligibility: boolean;
  public wdfStartDate: string;
  public wdfEndDate: string;
  public workerList: string[];
  public isStandalone: boolean;
  private subscriptions: Subscription = new Subscription();

  constructor(
    private route: ActivatedRoute,
    private workerService: WorkerService,
    private establishmentService: EstablishmentService,
    private breadcrumbService: BreadcrumbService,
    private reportService: ReportService,
    protected router: Router,
    protected backService: BackService,
    private wdfConfirmFieldsService: WdfConfirmFieldsService,
  ) {}

  ngOnInit(): void {
    this.primaryWorkplaceUid = this.establishmentService.primaryWorkplace.uid;
    this.workerService.setState(this.route.snapshot.data.worker);
    this.setExitUrl();
    this.refreshSubscription();
    this.getEstablishment();
    this.getWorker(this.route.snapshot.params);
    this.getOverallWdfEligibility();
    this.getListOfWorkers();
    this.setNewWdfReturn();
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  public getListOfWorkers(): void {
    this.workerList = JSON.parse(localStorage.getItem('ListOfWorkers'));
  }

  public getEstablishment(): void {
    this.subscriptions.add(
      this.establishmentService.getEstablishment(this.workplaceUid, true).subscribe((workplace) => {
        this.workplace = workplace;
        this.isStandalone = this.checkIfStandalone();
        this.setBreadcrumbs();
        this.establishmentService.setState(workplace);
      }),
    );
  }

  public getWorker(data): void {
    this.subscriptions.add(
      this.workerService.getWorker(this.workplaceUid, data.id, true).subscribe((worker) => {
        this.worker = worker;
        this.updatedWorker = worker;
      }),
    );
  }

  public getOverallWdfEligibility(): void {
    this.subscriptions.add(
      this.reportService.getWDFReport(this.workplaceUid).subscribe((report) => {
        this.overallWdfEligibility = report.wdf.overall;
        this.wdfStartDate = dayjs(report.effectiveFrom).format('D MMMM YYYY');
        this.wdfEndDate = dayjs(report.effectiveFrom).add(1, 'years').format('D MMMM YYYY');
      }),
    );
  }

  private setExitUrl(): void {
    if (this.route.snapshot.params.establishmentuid) {
      this.workplaceUid = this.route.snapshot.params.establishmentuid;
      this.exitUrl = { url: ['/wdf', 'workplaces', this.workplaceUid], fragment: 'staff-records' };
    } else {
      this.workplaceUid = this.establishmentService.primaryWorkplace.uid;
      this.exitUrl = { url: ['/wdf', 'data'], fragment: 'staff-records' };
    }
  }

  private checkIfStandalone(): boolean {
    if (this.workplace) {
      if (this.primaryWorkplaceUid !== this.workplaceUid) {
        return false;
      }
      return !this.workplace.isParent;
    }
    return true;
  }

  private setBreadcrumbs(): void {
    this.isStandalone
      ? this.breadcrumbService.show(JourneyType.WDF)
      : this.breadcrumbService.show(JourneyType.WDF_PARENT);
  }

  private setNewWdfReturn(): void {
    if (this.route.snapshot.params.establishmentuid) {
      this.returnTo = {
        url: [
          '/wdf',
          'workplaces',
          this.route.snapshot.params.establishmentuid,
          'staff-record',
          this.route.snapshot.params.id,
        ],
      };
    } else {
      this.returnTo = { url: ['/wdf', 'staff-record', this.route.snapshot.params.id] };
    }
    this.workerService.setReturnTo(this.returnTo);
  }

  private refreshSubscription() {
    this.route.params.subscribe((data) => {
      this.getEstablishment();
      this.getWorker(data);
      this.getOverallWdfEligibility();
      this.getListOfWorkers();
      this.setNewWdfReturn();
      this.wdfConfirmFieldsService.clearConfirmFields();
    });
    this.subscriptions.add(
      this.router.events
        .pipe(
          filter((event) => event instanceof NavigationEnd),
          map(() => this.route),
        )
        .subscribe((data) => {
          this.breadcrumbService.show(JourneyType.WDF);
        }),
    );
  }

  public refreshUpdatedWorkerAndWdfEligibility(): void {
    this.subscriptions.add(
      this.workerService.getWorker(this.workplaceUid, this.route.snapshot.params.id, true).subscribe((worker) => {
        this.updatedWorker = worker;
      }),
    );
    this.getOverallWdfEligibility();
  }
}
