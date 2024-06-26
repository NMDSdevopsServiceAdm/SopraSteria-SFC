import { HttpResponse } from '@angular/common/http';
import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Establishment } from '@core/model/establishment.model';
import { Worker } from '@core/model/worker.model';
import { ReportService } from '@core/services/report.service';
import { saveAs } from 'file-saver';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-new-training-link-panel',
  templateUrl: './training-link-panel.component.html',
})
export class NewTrainingLinkPanelComponent implements OnInit, OnDestroy {
  @Input() workplace: Establishment;
  @Input() workers: Worker[];
  @Input() totalRecords: number;
  @Input() canEditEstablishment: boolean;
  @Input() canEditWorker: boolean;

  public establishmentUid: string;
  public isParent: boolean;
  private subscriptions: Subscription = new Subscription();

  constructor(private reportService: ReportService, private router: Router) {}

  ngOnInit(): void {
    this.establishmentUid = this.workplace.uid;
    this.isParent = this.workplace.isParent;
  }

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

  public saveFile(response: HttpResponse<Blob>): void {
    const filenameRegEx = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/;
    const header = response.headers.get('content-disposition');
    const filenameMatches = header && header.match(filenameRegEx);
    const filename = filenameMatches && filenameMatches.length > 1 ? filenameMatches[1] : null;
    const blob = new Blob([response.body], { type: 'text/plain;charset=utf-8' });
    saveAs(blob, filename);
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
}
