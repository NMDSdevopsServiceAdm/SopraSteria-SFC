import { AfterViewInit, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { JourneyType } from '@core/breadcrumb/breadcrumb.model';
import { SetDates } from '@core/model/admin/local-authorities-return.model';
import { ErrorDefinition, ErrorDetails } from '@core/model/errorSummary.model';
import {
  LocalAuthoritiesReturnService,
} from '@core/services/admin/local-authorities-return/local-authorities-return.service';
import { BreadcrumbService } from '@core/services/breadcrumb.service';
import { ErrorSummaryService } from '@core/services/error-summary.service';
import { DateValidator } from '@shared/validators/date.validator';

@Component({
  selector: 'app-set-dates',
  templateUrl: './set-dates.component.html',
})
export class SetDatesComponent implements OnInit, AfterViewInit {
  @ViewChild('formEl') formEl: ElementRef;
  public form: FormGroup;
  public submitted: boolean;
  public serverError: string;
  protected serverErrorsMap: Array<ErrorDefinition>;
  public formErrorsMap: Array<ErrorDetails>;

  constructor(
    private formBuilder: FormBuilder,
    private localAuthoritiesReturnService: LocalAuthoritiesReturnService,
    private errorSummaryService: ErrorSummaryService,
    private breadcrumbService: BreadcrumbService,
    private route: ActivatedRoute,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.setupForm();
    this.setupFormErrorsMap();
    this.breadcrumbService.show(JourneyType.ADMIN);
  }

  ngAfterViewInit(): void {
    this.errorSummaryService.formEl$.next(this.formEl);
  }

  private setupForm(): void {
    const startDate = new Date(this.route.snapshot.data.dates.laReturnStartDate);
    const endDate = new Date(this.route.snapshot.data.dates.laReturnEndDate);

    this.form = this.formBuilder.group(
      {
        laReturnStartDate: this.formBuilder.group({
          day: startDate.getDate(),
          month: startDate.getMonth() + 1,
          year: startDate.getFullYear(),
        }),
        laReturnEndDate: this.formBuilder.group({
          day: endDate.getDate(),
          month: endDate.getMonth() + 1,
          year: endDate.getFullYear(),
        }),
      },
      { updateOn: 'submit' },
    );
    this.form.get('laReturnStartDate').setValidators([DateValidator.required(), DateValidator.dateValid()]);
    this.form
      .get('laReturnEndDate')
      .setValidators([
        DateValidator.required(),
        DateValidator.dateValid(),
        DateValidator.beforeStartDate(this.form.get('laReturnStartDate').value),
      ]);
  }

  private setupFormErrorsMap(): void {
    this.formErrorsMap = [
      {
        item: 'laReturnStartDate',
        type: [
          { name: 'required', message: 'Start date is required' },
          { name: 'dateValid', message: 'Start date is not a valid date' },
        ],
      },
      {
        item: 'laReturnEndDate',
        type: [
          { name: 'required', message: 'End date is required' },
          { name: 'dateValid', message: 'End date is not a valid date' },
          { name: 'beforeStartDate', message: 'End date must be after start date' },
        ],
      },
    ];
  }

  public getFormErrorMessage(item: string, errorType: string): string {
    return this.errorSummaryService.getFormErrorMessage(item, errorType, this.formErrorsMap);
  }

  private formatSingleDigit(value: number): string {
    return String(value < 10 ? `0${value}` : value);
  }

  public onSubmit(): void {
    this.submitted = true;
    this.errorSummaryService.syncFormErrorsEvent.next(true);

    if (this.form.invalid) {
      this.errorSummaryService.scrollToErrorSummary();
      return;
    } else {
      const { year: startYear, month: startMonth, day: startDay } = this.form.get('laReturnStartDate').value;
      const { year: endYear, month: endMonth, day: endDay } = this.form.get('laReturnEndDate').value;

      const laReturnDates: SetDates = {
        laReturnStartDate: new Date(
          `${this.formatSingleDigit(startYear)}-${this.formatSingleDigit(startMonth)}-${this.formatSingleDigit(
            startDay,
          )}`,
        ),
        laReturnEndDate: new Date(
          `${this.formatSingleDigit(endYear)}-${this.formatSingleDigit(endMonth)}-${this.formatSingleDigit(endDay)}`,
        ),
      };
      this.localAuthoritiesReturnService
        .setDates(laReturnDates)
        .subscribe(() => this.router.navigate(['sfcadmin', 'local-authorities-return']));
    }
  }
}
