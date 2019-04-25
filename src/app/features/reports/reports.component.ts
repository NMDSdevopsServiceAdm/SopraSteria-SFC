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
  public form: FormGroup;
  public establishment: any;
  public reportDetails: {};
  public lastLoggedIn = null;
  public dateFormat = DEFAULT_DATE_DISPLAY_FORMAT;
  public displayWDFReport: {};
  public eligibility: {};

  private subscriptions: Subscription = new Subscription();

  constructor(
    private authService: AuthService,
    private reportsService: ReportsService,
    private formBuilder: FormBuilder,
  ) {
    this.formValidator = this.formValidator.bind(this);
  }

  ngOnInit() {
    this.form = this.formBuilder.group({
      day: null,
      month: null,
      year: null,
    });
    this.form.setValidators(Validators.compose([this.form.validator, DateValidator.dateValid(), this.formValidator]));

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

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }

  formValidator(formGroup: FormGroup): ValidationErrors {
    if (this.form) {
      const { day, month, year } = this.form.value;

      if (day && month && year) {
        const date = moment()
          .year(year)
          .month(month - 1)
          .date(day);
        if (date.isValid()) {
          // TODO: https://trello.com/c/sYDV6vTN
          // Cross Validation

        }
      }
    }

    return null;
  }

}
