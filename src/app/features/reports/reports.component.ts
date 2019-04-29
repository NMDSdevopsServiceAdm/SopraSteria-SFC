import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, ValidationErrors, Validators } from '@angular/forms';
import { DEFAULT_DATE_DISPLAY_FORMAT } from '@core/constants/constants';
import { DateValidator } from '@core/validators/date.validator';
import { AuthService } from '@core/services/auth-service';
import { ReportsService } from '@core/services/reports.service';
import * as moment from 'moment';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-reports',
  templateUrl: './reports.component.html',
  styleUrls: ['./reports.component.scss']
})
export class ReportsComponent implements OnInit, OnDestroy {
  public updateEligibilityForm: FormGroup;
  public establishment: any;
  public reportDetails: {};
  public lastLoggedIn = null;
  public dateFormat = DEFAULT_DATE_DISPLAY_FORMAT;
  public displayWDFReport: {};
  public eligibility: {};
  public newDate: string;

  private subscriptions: Subscription = new Subscription();

  constructor(
    private authService: AuthService,
    private reportsService: ReportsService,
    private formBuilder: FormBuilder,
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
        this.displayWDFReport = true;
        this.eligibility['displayWDFReport'] = this.displayWDFReport;
        this.reportsService.updateState(this.eligibility);
      })
    );
  }

  updateEffectiveFrom() {
    const date = this.updateEligibilityForm.get('date').value;
    const hour = this.updateEligibilityForm.get('hour').value;
    const minute = this.updateEligibilityForm.get('minute').value;
    const second = this.updateEligibilityForm.get('second').value;

    this.newDate = '';

    if (date.length > 0) {
      this.newDate = date + 'T' + hour + ':' + minute + ':' + second + 'Z';
    }

    debugger;

    this.subscriptions.add(
      this.reportsService.getWDFReport(this.newDate)
      .subscribe(res => {
        debugger;
      })
    );
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }

}
