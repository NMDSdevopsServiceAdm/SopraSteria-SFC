import { HttpResponse } from '@angular/common/http';
import { Component, Input, OnChanges, OnDestroy, OnInit, SimpleChanges } from '@angular/core';
import { Router } from '@angular/router';
import { Establishment } from '@core/model/establishment.model';
import { Worker } from '@core/model/worker.model';
import { PermissionsService } from '@core/services/permissions/permissions.service';
import { ReportService } from '@core/services/report.service';
import { FeatureFlagsService } from '@shared/services/feature-flags.service';
import { saveAs } from 'file-saver';
import moment from 'moment';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-training-link-panel',
  templateUrl: './training-link-panel.component.html',
})
export class TrainingLinkPanelComponent implements OnInit, OnDestroy, OnChanges {
  @Input() workplace: Establishment;
  @Input() workers: Worker[];

  public establishmentUid: string;
  public canEditEstablishment: boolean;
  public url: string;
  public fromStaffRecord: boolean;
  public lastUpdated: string;
  public now = moment.now();
  private subscriptions: Subscription = new Subscription();
  private newTrainingAndQualificationsReport: boolean;

  constructor(
    private reportService: ReportService,
    private router: Router,
    private permissionsService: PermissionsService,
    private featureFlagsService: FeatureFlagsService,
  ) {}

  ngOnInit() {
    this.url = this.router.url;

    this.establishmentUid = this.workplace.uid;
    this.canEditEstablishment = this.permissionsService.can(this.establishmentUid, 'canEditEstablishment');

    this.featureFlagsService.configCatClient
      .getValueAsync('newTrainingAndQualificationsReport', false)
      .then((value) => {
        this.newTrainingAndQualificationsReport = value;
      });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if ('workers' in changes) {
      this.lastUpdatedCheck();
    }
  }

  public lastUpdatedCheck(): void {
    if (this.workers) {
      this.workers.forEach((worker: Worker) => {
        if (worker.trainingCount > 0) {
          if (this.lastUpdated === undefined || new Date(this.lastUpdated) < new Date(worker.trainingLastUpdated)) {
            this.lastUpdated = worker.trainingLastUpdated;
          }
        }
      });
    }
  }

  //Download Training Report
  public downloadTrainingReport(event: Event): void {
    event.preventDefault();

    if (this.newTrainingAndQualificationsReport) {
      this.subscriptions.add(
        this.reportService.getTrainingAndQualificationsReport(this.establishmentUid).subscribe(
          (response) => this.saveFile(response),
          (error) => console.error(error),
        ),
      );
    } else {
      this.subscriptions.add(
        this.reportService.getTrainingReport(this.establishmentUid).subscribe(
          (response) => this.saveFile(response),
          (error) => console.error(error),
        ),
      );
    }
  }

  //set content type and save file
  public saveFile(response: HttpResponse<Blob>) {
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
