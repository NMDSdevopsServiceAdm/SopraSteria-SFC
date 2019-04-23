import { Component, OnInit, OnDestroy } from '@angular/core';
import { DEFAULT_DATE_DISPLAY_FORMAT } from '@core/constants/constants';
import { AuthService } from '@core/services/auth-service';
import { ReportsService } from '@core/services/reports.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-reports',
  templateUrl: './reports.component.html',
  styleUrls: ['./reports.component.scss']
})
export class ReportsComponent implements OnInit, OnDestroy {
  public establishment: any;
  public reportDetails: {};
  public lastLoggedIn = null;
  public dateFormat = DEFAULT_DATE_DISPLAY_FORMAT;
  public displayWDFReport: {};
  public eligibility: {};

  private subscriptions: Subscription = new Subscription();

  constructor(
    private authService: AuthService,
    private reportsService: ReportsService
  ) {}

  ngOnInit() {
    this.establishment = this.authService.establishment;

    this.subscriptions.add(
      this.reportsService.reportDetails$.subscribe(reportDetails => this.reportDetails = reportDetails)
    );

    this.displayWDFReport = false;
  }

  displayWDF(event: Event) {
    if (event) {
      event.preventDefault();
    }

    this.subscriptions.add(
      this.reportsService.getWDFReport()
      .subscribe(res => {
        this.eligibility = res;

        this.reportsService.updateState(this.eligibility);
        this.displayWDFReport = true;
      })
    );
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }

}
