import { AfterViewInit, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { JourneyType } from '@core/breadcrumb/breadcrumb.model';
import { SetDates } from '@core/model/admin/local-authorities-return.model';
import { ErrorDefinition, ErrorDetails } from '@core/model/errorSummary.model';
import { LocalAuthoritiesReturnService } from '@core/services/admin/local-authorities-return/local-authorities-return.service';
import { BreadcrumbService } from '@core/services/breadcrumb.service';
import { ErrorSummaryService } from '@core/services/error-summary.service';
import { FormatUtil } from '@core/utils/format-util';
import { DateValidator } from '@shared/validators/date.validator';

@Component({
  selector: 'app-set-dates',
  templateUrl: './set-dates.component.html',
})
export class SetDatesComponent implements OnInit, AfterViewInit {
  @ViewChild('formEl') formEl: ElementRef;
  public form: UntypedFormGroup;
  public submitted: boolean;
  public serverError: string;
  protected serverErrorsMap: Array<ErrorDefinition>;
  public formErrorsMap: Array<ErrorDetails>;

  constructor(
    private formBuilder: UntypedFormBuilder,
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

  public setupFormGroup(date: Date): { day: number; month: number; year: number } {
    return {
      day: date.getDate(),
      month: date.getMonth() + 1,
      year: date.getFullYear(),
    };
  }

  public setValidators(): void {
    const validators = (field: string, before: boolean) => [
      DateValidator.required(),
      DateValidator.dateValid(),
      DateValidator.beforeStartDate(field, before),
    ];

    this.form.get('laReturnStartDate').setValidators(validators('laReturnEndDate', false));
    this.form.get('laReturnEndDate').setValidators(validators('laReturnStartDate', true));
  }

  private setupForm(): void {
    const startDate = new Date(this.route.snapshot.data.dates.laReturnStartDate);
    const endDate = new Date(this.route.snapshot.data.dates.laReturnEndDate);

    this.form = this.formBuilder.group(
      {
        laReturnStartDate: this.formBuilder.group(this.setupFormGroup(startDate)),
        laReturnEndDate: this.formBuilder.group(this.setupFormGroup(endDate)),
      },
      { updateOn: 'submit' },
    );

    this.setValidators();
  }

  private setupFormErrorsMap(): void {
    this.formErrorsMap = [
      {
        item: 'laReturnStartDate',
        type: [
          { name: 'required', message: 'Start date is required' },
          { name: 'dateValid', message: 'Start date is not a valid date' },
          { name: 'afterEndDate', message: 'Start date must be before end date' },
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

  public onSubmit(): void {
    this.submitted = true;
    this.errorSummaryService.syncFormErrorsEvent.next(true);

    if (this.form.invalid) {
      this.errorSummaryService.scrollToErrorSummary();
      return;
    } else {
      const startDate = this.form.get('laReturnStartDate').value;
      const endDate = this.form.get('laReturnEndDate').value;

      const laReturnDates: SetDates = {
        laReturnStartDate: FormatUtil.formatDate(startDate),
        laReturnEndDate: FormatUtil.formatDate(endDate),
      };
      this.localAuthoritiesReturnService
        .setDates(laReturnDates)
        .subscribe(() => this.router.navigate(['sfcadmin', 'local-authorities-return']));
    }
  }
}
