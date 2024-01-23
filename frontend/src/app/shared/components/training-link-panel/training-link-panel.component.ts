import { HttpResponse } from '@angular/common/http';
import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Establishment } from '@core/model/establishment.model';
import { Worker } from '@core/model/worker.model';
import { PermissionsService } from '@core/services/permissions/permissions.service';
import { ReportService } from '@core/services/report.service';
import dayjs from 'dayjs';
import { saveAs } from 'file-saver';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-training-link-panel',
  templateUrl: './training-link-panel.component.html',
})
export class TrainingLinkPanelComponent implements OnInit, OnDestroy {
  @Input() workplace: Establishment;
  @Input() workers: Worker[];
  @Input() totalRecords: number;
  @Input() tAndQsLastUpdated: string;

  public establishmentUid: string;
  public canEditEstablishment: boolean;
  public canEditWorker: boolean;
  public url: string;
  public fromStaffRecord: boolean;
  public lastUpdated: string;
  public now = dayjs();
  public isParent: boolean;
  private subscriptions: Subscription = new Subscription();

  constructor(
    private reportService: ReportService,
    private router: Router,
    private permissionsService: PermissionsService,
  ) {}

  ngOnInit(): void {
    this.url = this.router.url;

    this.establishmentUid = this.workplace.uid;
    this.isParent = this.workplace.isParent;
    this.canEditEstablishment = this.permissionsService.can(this.establishmentUid, 'canEditEstablishment');
    this.canEditWorker = this.permissionsService.can(this.workplace.uid, 'canEditWorker');
  }

  //Download Training Report
  public downloadTrainingReport(event: Event): void {
    event.preventDefault();
    this.subscriptions.add(
      this.reportService.getTrainingAndQualificationsReport(this.establishmentUid).subscribe(
        (response) => this.saveFile(response),
        (error) => console.error(error),
      ),
    );
  }

  public downloadParentTrainingReport(event: Event): void {
    event.preventDefault();
    this.subscriptions.add(
      this.reportService.getParentTrainingAndQualificationsReport(this.establishmentUid).subscribe(
        (response) => this.saveFile(response),
        (error) => console.error(error),
      ),
    );
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
