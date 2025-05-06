import { AfterViewInit, Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ErrorDetails } from '@core/model/errorSummary.model';
import { Establishment } from '@core/model/establishment.model';
import { Worker } from '@core/model/worker.model';
import { AlertService } from '@core/services/alert.service';
import { BackLinkService } from '@core/services/backLink.service';
import { ErrorSummaryService } from '@core/services/error-summary.service';
import { EstablishmentService } from '@core/services/establishment.service';
import { VacanciesAndTurnoverService } from '@core/services/vacancies-and-turnover.service';
import { Reason, WorkerService } from '@core/services/worker.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-delete-staff-record',
  templateUrl: './delete-staff-record.component.html',
  styleUrls: ['./delete-staff-record.component.scss'],
})
export class DeleteStaffRecordComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('formEl') formEl: ElementRef;

  public form: UntypedFormGroup;
  public submitted: boolean;
  public worker: Worker;
  public workplace: Establishment;
  public reasons: Reason[];
  public formErrorsMap: Array<ErrorDetails>;
  public detailsText: string;

  public otherReasonId = 8;
  public otherReasonDetailMaxLength = 500;
  public confirmationMissingErrorMessage =
    'Confirm that you know this action will permanently delete this staff record and any training and qualification records (and certificates) related to it';
  public totalNumberOfStaffBeforeDelete: number;

  private subscriptions: Subscription = new Subscription();

  constructor(
    private alertService: AlertService,
    private establishmentService: EstablishmentService,
    private router: Router,
    private errorSummaryService: ErrorSummaryService,
    private workerService: WorkerService,
    private formBuilder: UntypedFormBuilder,
    private backLinkService: BackLinkService,
    private route: ActivatedRoute,
    private vacanciesAndTurnoverService: VacanciesAndTurnoverService,
  ) {}

  ngOnInit(): void {
    this.worker = this.workerService.worker;
    this.workplace = this.establishmentService.establishment;
    this.reasons = this.route.snapshot.data?.reasonsForLeaving;
    this.totalNumberOfStaffBeforeDelete = this.route.snapshot.data?.totalNumberOfStaff;

    this.setupForm();
    this.setupFormErrorsMap();
    this.setBackLink();
  }

  ngAfterViewInit() {
    this.errorSummaryService.formEl$.next(this.formEl);
  }

  private setupForm(): void {
    this.form = this.formBuilder.group({
      reason: [null],
      details: [null, { validators: [Validators.maxLength(this.otherReasonDetailMaxLength)], updateOn: 'submit' }],
      confirmDelete: [null, { validators: [Validators.requiredTrue], updateOn: 'submit' }],
    });
  }

  private setBackLink(): void {
    this.backLinkService.showBackLink();
  }

  private setupFormErrorsMap(): void {
    this.formErrorsMap = [
      {
        item: 'confirmDelete',
        type: [
          {
            name: 'required',
            message: this.confirmationMissingErrorMessage,
          },
        ],
      },
      {
        item: 'details',
        type: [
          {
            name: 'maxlength',
            message: `Provide details must be ${this.otherReasonDetailMaxLength} characters or fewer`,
          },
        ],
      },
    ];
  }

  public getFirstErrorMessage(item: string): string {
    const errorType = Object.keys(this.form.get(item).errors)[0];
    return this.errorSummaryService.getFormErrorMessage(item, errorType, this.formErrorsMap);
  }

  public get selectedReasonId() {
    return this.form.get('reason').value;
  }

  public onInputDetails(event: Event) {
    event.preventDefault();
    this.detailsText = (event.target as HTMLTextAreaElement).value;
  }

  public onSubmit(): void {
    this.submitted = true;

    if (this.form.invalid) {
      this.errorSummaryService.scrollToErrorSummary();
      return;
    }

    const leaveReason = this.buildLeaveReasonProp();

    this.subscriptions.add(
      this.workerService
        .deleteWorker(this.workplace.uid, this.worker.uid, leaveReason)
        .subscribe(() => this.onSuccess()),
    );
  }

  private buildLeaveReasonProp() {
    if (!this.selectedReasonId) {
      return null;
    }
    const reasonProp = { id: this.selectedReasonId };

    if (this.selectedReasonId === this.otherReasonId && this.form.get('details').value) {
      reasonProp['other'] = this.form.get('details').value;
    }
    return { reason: reasonProp };
  }

  private onSuccess(): void {
    this.vacanciesAndTurnoverService.clearDoYouWantToAddOrDeleteAnswer();

    const nextPage =
      this.totalNumberOfStaffBeforeDelete > 1
        ? 'delete-another-staff-record'
        : 'update-workplace-details-after-deleting-staff';

    this.router.navigate(['/workplace', this.workplace.uid, 'staff-record', nextPage]).then(() =>
      this.alertService.addAlert({
        type: 'success',
        message: `Staff record deleted (${this.worker.nameOrId})`,
      }),
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
}
