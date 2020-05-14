import { HttpResponse } from '@angular/common/http';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { EstablishmentService } from '@core/services/establishment.service';
import { ReportService } from '@core/services/report.service';
import { saveAs } from 'file-saver';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-trianing-link-panel',
  templateUrl: './trianing-link-panel.component.html',
})
export class TrainingLinkPanelComponent implements OnInit, OnDestroy {
  private subscriptions: Subscription = new Subscription();
  public establishmentUid: string;
  public url: string;
  public fromStaffRecord: boolean;

  public currentDate: Date;

  constructor(
    private reportService: ReportService,
    private establishmentService: EstablishmentService,
    private router: Router,
  ) {}

  ngOnInit() {
    this.url = this.router.url;
    this.currentDate = new Date();

    if (this.url.includes('view-all-mandatory-training')) {
      this.fromStaffRecord = true;
      this.establishmentService.isMandatoryTrainingView.next(true);
    }
    this.subscriptions.add(
      this.establishmentService.establishment$.subscribe(data => {
        if (data && data.id) {
          this.establishmentUid = data.uid;
        }
      }),
    );
  }

  //Download Training Report
  public downloadTrainingReport(event: Event) {
    event.preventDefault();
    this.subscriptions.add(
      this.reportService.getTrainingReport(this.establishmentUid).subscribe(
        response => this.saveFile(response),
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
