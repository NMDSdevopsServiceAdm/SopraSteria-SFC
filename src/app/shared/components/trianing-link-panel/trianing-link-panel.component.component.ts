import { HttpResponse } from '@angular/common/http';
import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Establishment } from '@core/model/establishment.model';
import { Worker } from '@core/model/worker.model';
import { PermissionsService } from '@core/services/permissions/permissions.service';
import { ReportService } from '@core/services/report.service';
import { WorkerService } from '@core/services/worker.service';
import { saveAs } from 'file-saver';
import * as moment from 'moment';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-trianing-link-panel',
  templateUrl: './trianing-link-panel.component.html',
})
export class TrainingLinkPanelComponent implements OnInit, OnDestroy {
  @Input() workplace: Establishment;

  public establishmentUid: string;
  public url: string;
  public fromStaffRecord: boolean;
  public lastUpdated: string;
  public now = moment.now();
  private subscriptions: Subscription = new Subscription();

  constructor(
    private reportService: ReportService,
    private workerService: WorkerService,
    private router: Router,
    private permissionsService: PermissionsService,
  ) {}

  ngOnInit() {
    this.url = this.router.url;

    this.establishmentUid = this.workplace.uid;
    if (this.permissionsService.can(this.establishmentUid, 'canViewListOfWorkers')) {
      this.subscriptions.add(
        this.workerService.getAllWorkers(this.establishmentUid).subscribe((workers) => {
          workers.forEach((worker: Worker) => {
            if (worker.trainingCount > 0) {
              if (this.lastUpdated === undefined || this.lastUpdated < worker.trainingLastUpdated) {
                this.lastUpdated = worker.trainingLastUpdated;
              }
            }
          });
        }),
      );
    }
  }

  //Download Training Report
  public downloadTrainingReport(event: Event) {
    event.preventDefault();
    this.subscriptions.add(
      this.reportService.getTrainingReport(this.establishmentUid).subscribe(
        (response) => this.saveFile(response),
        () => {},
      ),
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
  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }
}
