import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { JourneyType } from '@core/breadcrumb/breadcrumb.model';
import { Establishment } from '@core/model/establishment.model';
import { URLStructure } from '@core/model/url.model';
import { Worker } from '@core/model/worker.model';
import { BreadcrumbService } from '@core/services/breadcrumb.service';
import { EstablishmentService } from '@core/services/establishment.service';
import { ReportService } from '@core/services/report.service';
import { WorkerService } from '@core/services/worker.service';
import * as moment from 'moment';
import { Subscription } from 'rxjs';
import { filter, map } from 'rxjs/operators';

@Component({
  selector: 'app-wdf-staff-record',
  templateUrl: './wdf-staff-record.component.html',
})
export class WdfStaffRecordComponent implements OnInit {
  public worker: Worker;
  public workplace: Establishment;
  public workplaceUid: string;
  public primaryWorkplaceUid: string;
  public isEligible: boolean;
  public exitUrl: URLStructure;
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
  ) {}

  ngOnInit() {
    this.primaryWorkplaceUid = this.establishmentService.primaryWorkplace.uid;
    this.setExitUrl();

    this.refreshSubscription();
    this.getEstablishment();
    this.getWorker(this.route.snapshot.params);
    this.getOverallWdfEligibility();
    this.getListOfWorkers();
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  public getListOfWorkers() {
    this.workerList = JSON.parse(localStorage.getItem('ListOfWorkers'));
  }

  public getEstablishment() {
    this.subscriptions.add(
      this.establishmentService.getEstablishment(this.workplaceUid, true).subscribe((workplace) => {
        this.workplace = workplace;
        this.isStandalone = this.checkIfStandalone();
        this.setBreadcrumbs();
        this.establishmentService.setState(workplace);
      }),
    );
  }

  public getWorker(data) {
    this.subscriptions.add(
      this.workerService.getWorker(this.workplaceUid, data.id, true).subscribe((worker) => {
        this.worker = worker;
        this.isEligible = this.worker.wdf.isEligible && this.worker.wdf.currentEligibility;
      }),
    );
  }

  public getOverallWdfEligibility() {
    this.subscriptions.add(
      this.reportService.getWDFReport(this.workplaceUid).subscribe((report) => {
        this.overallWdfEligibility = report.wdf.overall;
        this.wdfStartDate = moment(report.effectiveFrom).format('D MMMM YYYY');
        this.wdfEndDate = moment(report.effectiveFrom).add(1, 'years').format('D MMMM YYYY');
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

  private refreshSubscription() {
    this.route.params.subscribe((data) => {
      this.getEstablishment();
      this.getWorker(data);
      this.getOverallWdfEligibility();
      this.getListOfWorkers();
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
}
