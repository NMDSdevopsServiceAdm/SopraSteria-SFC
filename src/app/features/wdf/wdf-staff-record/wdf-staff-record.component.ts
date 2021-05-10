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

@Component({
  selector: 'app-wdf-staff-record',
  templateUrl: './wdf-staff-record.component.html',
})
export class WdfStaffRecordComponent implements OnInit {
  public worker: Worker;
  public workplace: Establishment;
  public workplaceUid: string;
  public isEligible: boolean;
  public exitUrl: URLStructure;
  public overallWdfEligibility: boolean;
  public wdfStartDate: string;
  public wdfEndDate: string;
  public workerList: string[];

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
    this.breadcrumbService.show(JourneyType.WDF);
    this.workplaceUid = this.establishmentService.primaryWorkplace.uid;

    this.route.params.subscribe((data) => {
          this.getEstablishment();
          this.getWorker();
          this.getOverallWdfEligibility();
          this.getListOfWorkers();
        });
    this.getEstablishment();
    this.getWorker();
    this.getOverallWdfEligibility();
    this.getListOfWorkers();
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
  public getListOfWorkers(){
    this.workerList = JSON.parse(localStorage.getItem("ListOfWorkers"));
  }

  public getEstablishment() {
    this.subscriptions.add(
      this.establishmentService.getEstablishment(this.workplaceUid, true).subscribe((workplace) => {
        this.workplace = workplace;
        this.establishmentService.setState(workplace);
      }),
    );
  }

  public getWorker() {
    this.subscriptions.add(
      this.workerService.getWorker(this.workplaceUid, this.route.snapshot.params.id, true).subscribe((worker) => {
        this.worker = worker;
        this.isEligible = this.worker.wdf.isEligible && this.worker.wdf.currentEligibility;
        this.exitUrl = { url: ['/wdf', 'data'], fragment: 'staff-records' };
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
}
