import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { WDFReport } from '@core/model/reports.model';
import { Worker } from '@core/model/worker.model';
import { EstablishmentService } from '@core/services/establishment.service';
import { ReportService } from '@core/services/report.service';
import { WorkerService } from '@core/services/worker.service';
import { combineLatest } from 'rxjs';
import { take } from 'rxjs/operators';

@Component({
  selector: 'app-wdf-worker',
  templateUrl: './wdf-worker.component.html',
})
export class WdfWorkerComponent implements OnInit {
  public worker: Worker;
  public report: WDFReport;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private workerService: WorkerService,
    private reportService: ReportService,
    private establishmentService: EstablishmentService
  ) {}

  ngOnInit() {
    this.workerService.setState(this.route.snapshot.data.worker);

    combineLatest(
      this.workerService.worker$,
      this.reportService.getWDFReport(this.establishmentService.establishmentId.toString())
    )
      .pipe(take(1))
      .subscribe(([worker, report]) => {
        this.worker = worker;
        this.report = report;
      });
  }

  public saveAndComplete() {
    this.workerService
      .updateWorker(this.worker.uid, {
        completed: true,
      })
      .pipe(take(1))
      .subscribe(() => {
        this.router.navigate(['/reports', 'wdf'], { fragment: 'staff-records' });
      });
  }
}
