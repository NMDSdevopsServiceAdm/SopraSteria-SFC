import { Component, OnInit } from '@angular/core';
import { Establishment } from '@core/model/establishment.model';
import { WDFReport } from '@core/model/reports.model';
import { URLStructure } from '@core/model/url.model';
import { Worker } from '@core/model/worker.model';
import { EstablishmentService } from '@core/services/establishment.service';
import { ReportService } from '@core/services/report.service';
import { WorkerService } from '@core/services/worker.service';
import { sortBy } from 'lodash';
import { combineLatest } from 'rxjs';
import { take } from 'rxjs/operators';

@Component({
  selector: 'app-wdf',
  templateUrl: './wdf.component.html',
})
export class WdfComponent implements OnInit {
  public workplace: Establishment;
  public workers: Array<Worker>;
  public report: WDFReport;
  public returnUrl: URLStructure;

  constructor(
    private reportService: ReportService,
    private establishmentService: EstablishmentService,
    private workerService: WorkerService
  ) {}

  ngOnInit() {
    this.returnUrl = { url: ['/reports', 'wdf'] };

    combineLatest(
      this.establishmentService.establishment$,
      this.workerService.getAllWorkers(),
      this.reportService.getWDFReport(this.establishmentService.establishmentId.toString())
    )
      .pipe(take(1))
      .subscribe(([establishment, workers, report]) => {
        this.workplace = establishment;
        this.workers = sortBy(workers, ['wdfEligible']);
        this.report = report;
      });
  }
}
