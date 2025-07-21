import { HttpErrorResponse } from '@angular/common/http';
import { AfterViewInit, Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ErrorDetails } from '@core/model/errorSummary.model';
import { Establishment } from '@core/model/establishment.model';
import { BackLinkService } from '@core/services/backLink.service';
import { ErrorSummaryService } from '@core/services/error-summary.service';
import { EstablishmentService } from '@core/services/establishment.service';
import { TotalStaffConstraints, TotalStaffFormService } from '@core/services/total-staff-form.service';
import { VacanciesAndTurnoverService, WorkplaceUpdatePage } from '@core/services/vacancies-and-turnover.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-update-total-number-of-staff',
  templateUrl: './update-total-number-of-staff.component.html',
})
export class UpdateTotalNumberOfStaffComponent implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild('formEl') formEl: ElementRef;
  public form: UntypedFormGroup;
  public formErrorsMap: Array<ErrorDetails>;
  public submitted: boolean;
  public serverError: string;

  private workplace: Establishment;
  private subscriptions: Subscription = new Subscription();
  public min = TotalStaffConstraints.min;
  public max = TotalStaffConstraints.max;

  constructor(
    private formBuilder: UntypedFormBuilder,
    private totalStaffFormService: TotalStaffFormService,
    private route: ActivatedRoute,
    private router: Router,
    private establishmentService: EstablishmentService,
    private backLinkService: BackLinkService,
    private errorSummaryService: ErrorSummaryService,
    private vacanciesAndTurnoverService: VacanciesAndTurnoverService,
  ) {}

  ngOnInit(): void {
    this.workplace = this.route.parent.snapshot.data.establishment;

    this.setupForm();
    this.setupFormError();
    this.setBackLink();
    this.prefill();
    this.vacanciesAndTurnoverService.addToVisitedPages(WorkplaceUpdatePage.TOTAL_STAFF);
  }

  private setupForm(): void {
    this.form = this.totalStaffFormService.createForm(this.formBuilder, true);
  }

  private setBackLink(): void {
    this.backLinkService.showBackLink();
  }

  private setupFormError(): void {
    this.formErrorsMap = this.totalStaffFormService.createFormErrorsMap();
  }

  private prefill(): void {
    this.subscriptions.add(
      this.establishmentService.getEstablishmentField(this.workplace.uid, 'NumberOfStaff').subscribe((data) => {
        this.form.patchValue({ totalStaff: data.numberOfStaff });
      }),
    );
  }

  onSubmit(): void {
    this.submitted = true;
    this.errorSummaryService.syncFormErrorsEvent.next(true);

    if (!this.form.valid) {
      this.errorSummaryService.scrollToErrorSummary();
      return;
    }

    const totalStaffNumber = this.form.get('totalStaff').value;

    const property = 'NumberOfStaff';
    const props = { numberOfStaff: totalStaffNumber };
    this.subscriptions.add(
      this.establishmentService.updateEstablishmentFieldWithAudit(this.workplace.uid, property, props).subscribe(
        (data) => this.onSuccess(data),
        (error) => this.onError(error),
      ),
    );
  }

  onCancel(event: Event): void {
    event.preventDefault();
    this.returnToPreviousPage();
  }

  onSuccess(data: { numberOfStaff: number }): void {
    this.updateWorkplaceState(data.numberOfStaff);
    this.vacanciesAndTurnoverService.addToSubmittedPages(WorkplaceUpdatePage.TOTAL_STAFF);

    this.returnToPreviousPage();
  }

  private updateWorkplaceState(numberOfStaff: number): void {
    const updatedWorkplace = { ...this.establishmentService.establishment, numberOfStaff: numberOfStaff };
    this.establishmentService.setState(updatedWorkplace);
  }

  onError(_error: HttpErrorResponse): void {
    this.form.setErrors({ serverError: true });
    this.serverError = 'Failed to update total number of staff';
  }

  public getFirstErrorMessage(item: string): string {
    const errorType = Object.keys(this.form.get(item).errors)[0];
    return this.errorSummaryService.getFormErrorMessage(item, errorType, this.formErrorsMap);
  }

  public returnToPreviousPage(): void {
    this.router.navigate(['../'], { relativeTo: this.route });
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  ngAfterViewInit(): void {
    this.errorSummaryService.formEl$.next(this.formEl);
  }
}
