import { HttpResponse } from '@angular/common/http';
import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Establishment } from '@core/model/establishment.model';
import { Worker } from '@core/model/worker.model';
import { EstablishmentService } from '@core/services/establishment.service';
import { ReportService } from '@core/services/report.service';
import { WorkerService } from '@core/services/worker.service';
import { saveAs } from 'file-saver';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-training-and-qualifications-tab',
  templateUrl: './training-and-qualifications-tab.component.html',
})
export class TrainingAndQualificationsTabComponent implements OnInit, OnDestroy {
  @Input() workplace: Establishment;

  private subscriptions: Subscription = new Subscription();
  public workers: Worker[];
  public totalRecords;
  public totalExpiredTraining;
  public totalExpiringTraining;
  public missingMandatoryTraining;
  public totalStaff: number;
  public isShowAllTrainings: boolean;
  constructor(
    private workerService: WorkerService,
    private establishmentService: EstablishmentService,
    private reportService: ReportService
  ) {}

  ngOnInit() {
    this.subscriptions.add(
      this.workerService.getAllWorkers(this.workplace.uid).subscribe(
        workers => {
          this.workers = workers;
          this.totalRecords = 0;
          this.totalExpiredTraining = 0;
          this.totalExpiringTraining = 0;
          this.missingMandatoryTraining = 0;
          this.workers.forEach((worker: Worker) => {
            this.totalRecords += worker.trainingCount + worker.qualificationCount;
            this.totalExpiredTraining += worker.expiredTrainingCount;
            this.totalExpiringTraining += worker.expiringTrainingCount;
            this.missingMandatoryTraining += worker.missingMandatoryTrainingCount;
          });
        },
        error => {
          console.error(error.error);
        }
      )
    );
  }
  //Download Training Report
  public downloadTrainingReport(event: Event) {
    event.preventDefault();
    this.subscriptions.add(
      this.reportService.getTrainingReport(this.workplace.uid).subscribe(
        response => this.saveFile(response),
        () => {}
      )
    );
  }
  //set content type and save file
  private saveFile(response: HttpResponse<Blob>) {
    const filenameRegEx = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/;
    const header = response.headers.get('content-disposition');
    const filenameMatches = header && header.match(filenameRegEx);
    const filename = filenameMatches && filenameMatches.length > 1 ? filenameMatches[1] : null;
    const blob = new Blob([response.body], { type: 'text/plain;charset=utf-8' });
    saveAs(blob, filename);
  }

  public showAllTrainings() {
    this.isShowAllTrainings = true;
  }
  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }
}
