import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { JourneyType } from '@core/breadcrumb/breadcrumb.model';
import { Establishment } from '@core/model/establishment.model';
import { URLStructure } from '@core/model/url.model';
import { Worker } from '@core/model/worker.model';
import { BreadcrumbService } from '@core/services/breadcrumb.service';
import { EstablishmentService } from '@core/services/establishment.service';
import { WorkerService } from '@core/services/worker.service';
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

  private subscriptions: Subscription = new Subscription();

  constructor(
    private route: ActivatedRoute,
    private workerService: WorkerService,
    private establishmentService: EstablishmentService,
    private breadcrumbService: BreadcrumbService,
  ) {}

  ngOnInit() {
    this.breadcrumbService.show(JourneyType.WDF);
    this.workplaceUid = this.establishmentService.primaryWorkplace.uid;

    this.subscriptions.add(
      this.establishmentService.getEstablishment(this.workplaceUid, true).subscribe((workplace) => {
        this.workplace = workplace;
        this.establishmentService.setState(workplace);
      }),
    );

    this.subscriptions.add(
      this.workerService.getWorker(this.workplaceUid, this.route.snapshot.params.id, true).subscribe((worker) => {
        this.worker = worker;
        this.isEligible = this.worker.wdf.isEligible && this.worker.wdf.currentEligibility;
        this.exitUrl = { url: ['/wdf', 'data'], fragment: 'staff-records' };
      }),
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
}
