import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { WDFReport } from '@core/model/reports.model';
import { AuthService } from '@core/services/auth.service';
import { ReportsService } from '@core/services/reports.service';
import * as moment from 'moment';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-reports',
  templateUrl: './reports.component.html',
})
export class ReportsComponent implements OnInit, OnDestroy {
  public updateEligibilityForm: FormGroup;
  public establishment: any;
  public reportDetails: WDFReport;
  public displayWDFReport: {};
  public eligibility: {};
  public newDate: string;
  public effectiveFromDateNextYear: string;

  private subscriptions: Subscription = new Subscription();

  constructor(
    private authService: AuthService,
    private reportsService: ReportsService,
    private formBuilder: FormBuilder
  ) {}

  ngOnInit() {
    this.updateEligibilityForm = this.formBuilder.group({
      date: null,
      hour: null,
      minute: null,
      second: null,
    });

    this.establishment = this.authService.establishment;

    this.subscriptions.add(
      this.reportsService.reportDetails$.subscribe(reportDetails => (this.reportDetails = reportDetails))
    );

    this.displayWDFReport = false;
  }

  setEffectiveFromDate(effectiveFrom: Date) {
    this.effectiveFromDateNextYear = moment(effectiveFrom)
      .add(1, 'years')
      .format('YYYY');
  }

  displayWDF(event: Event) {
    if (event) {
      event.preventDefault();
    }

    this.subscriptions.add(
      this.reportsService.getWDFReport(null).subscribe(res => {
        this.setEffectiveFromDate(res.effectiveFrom);

        this.eligibility = res;
        this.displayWDFReport = true;
        this.eligibility['displayWDFReport'] = this.displayWDFReport;
        this.eligibility['effectiveFromDateNextYear'] = this.effectiveFromDateNextYear;
        this.reportsService.updateState(this.eligibility);
      })
    );
  }

  updateEffectiveFrom() {
    const { date, hour, minute, second } = this.updateEligibilityForm.value;

    if (date === null || date === '') {
      this.newDate = '';
    } else {
      this.newDate = date + 'T' + hour + ':' + minute + ':' + second + 'Z';
    }

    this.subscriptions.add(this.reportsService.getWDFReport(null, this.newDate).subscribe(res => {}));
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }
}
