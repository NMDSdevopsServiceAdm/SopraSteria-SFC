import { DatePipe } from '@angular/common';
import { HttpResponse } from '@angular/common/http';
import { Component } from '@angular/core';
import { ReportService } from '@core/services/report.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-report',
  templateUrl: './admin-report.component.html',
})
export class ReportComponent {
  private subscriptions: Subscription = new Subscription();
  public now = this.datePipe.transform(new Date(), 'yyyy-MM-dd');

  constructor(private reportsService: ReportService, private datePipe: DatePipe) {}

  public downloadLocalAuthorityAdminReport(event: Event) {
    event.preventDefault();
    this.subscriptions.add(
      this.reportsService.getLocalAuthorityAdminReport().subscribe((response) => this.saveFile(response)),
    );
  }
  public downloadDeleteReport(event: Event) {
    event.preventDefault();
    this.subscriptions.add(this.reportsService.getDeleteReport().subscribe((response) => this.saveFile(response)));
  }

  public downloadRegistrationSurveyReport(event: Event): void {
    event.preventDefault();
    this.subscriptions.add(
      this.reportsService.getRegistrationSurveyReport().subscribe((response) => {
        this.saveFile(response);
      }),
    );
  }

  public downloadSatisfactionSurveyReport(event: Event) {
    event.preventDefault();
    this.subscriptions.add(
      this.reportsService.getSatisfactionSurveyReport().subscribe((response) => {
        this.saveFile(response);
      }),
    );
  }

  public downloadWdfSummaryReport(event: Event) {
    event.preventDefault();
    this.subscriptions.add(this.reportsService.getWdfSummaryReport().subscribe((response) => this.saveFile(response)));
  }

  public saveFile(response: HttpResponse<Blob>) {
    const filenameRegEx = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/;
    const header = response.headers.get('content-disposition');
    const filenameMatches = header && header.match(filenameRegEx);
    const filename = filenameMatches && filenameMatches.length > 1 ? filenameMatches[1] : null;
    const blob = new Blob([response.body], { type: 'text/plain;charset=utf-8' });

    saveAs(blob, filename);
  }
}
