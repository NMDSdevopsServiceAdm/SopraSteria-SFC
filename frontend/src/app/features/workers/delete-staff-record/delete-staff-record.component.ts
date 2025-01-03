import { AfterViewInit, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ErrorDetails } from '@core/model/errorSummary.model';
import { Establishment } from '@core/model/establishment.model';
import { Worker } from '@core/model/worker.model';
import { AlertService } from '@core/services/alert.service';
import { BackLinkService } from '@core/services/backLink.service';
import { ErrorSummaryService } from '@core/services/error-summary.service';
import { EstablishmentService } from '@core/services/establishment.service';
import { PermissionsService } from '@core/services/permissions/permissions.service';
import { Reason, WorkerService } from '@core/services/worker.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-delete-staff-record',
  templateUrl: './delete-staff-record.component.html',
  styleUrls: ['./delete-staff-record.component.scss'],
})
export class DeleteStaffRecordComponent implements OnInit, AfterViewInit {
  @ViewChild('formEl') formEl: ElementRef;

  public form: UntypedFormGroup;
  public submitted: boolean;
  public worker: Worker;
  public workplace: Establishment;
  public reasons: Reason[];
  public formErrorsMap: Array<ErrorDetails>;

  public otherReasonId = 8;
  public confirmationMissingErrorMessage =
    'Confirm that you know this action will permanently delete this staff record and any training and qualification records (and certificates) related to it';

  private subscriptions: Subscription = new Subscription();

  constructor(
    private alertService: AlertService,
    private establishmentService: EstablishmentService,
    private permissionsService: PermissionsService,
    private route: ActivatedRoute,
    private router: Router,
    private errorSummaryService: ErrorSummaryService,
    private workerService: WorkerService,
    private formBuilder: UntypedFormBuilder,
    protected backLinkService: BackLinkService,
  ) {}

  ngOnInit(): void {
    this.worker = this.workerService.worker;
    this.workplace = this.establishmentService.establishment;

    this.subscriptions.add(
      this.workerService.getLeaveReasons().subscribe((reasons) => {
        this.reasons = reasons;
      }),
    );
    this.setBackLink();
    this.setupForm();
    this.setupFormErrorsMap();
  }

  ngAfterViewInit() {
    this.errorSummaryService.formEl$.next(this.formEl);
  }

  private setupForm(): void {
    this.form = this.formBuilder.group({
      reason: [null, { updateOn: 'submit' }],
      details: [null, { validators: [Validators.maxLength(500)], updateOn: 'submit' }],
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
    ];
  }

  public get confirmDeleteCheckbox() {
    return this.form.get('confirmDelete');
  }

  public get selectedReasonId() {
    return this.form.get('reason').value;
  }

  public onSelectReason(reasonId: number) {
    this.form.patchValue({ reason: reasonId });
  }

  public onSubmit(): void {
    this.submitted = true;

    if (this.form.invalid) {
      return;
    }

    const selectedReason = this.selectedReasonId ? { reason: { id: this.selectedReasonId } } : null;
    if (selectedReason && this.form.get('details').value) {
      selectedReason.reason['other'] = this.form.get('details').value;
    }

    this.subscriptions.add(
      this.workerService
        .deleteWorker(this.workplace.uid, this.worker.uid, selectedReason)
        .subscribe(() => this.onSuccess()),
    );
  }

  private onSuccess(): void {
    this.router
      .navigate(['/dashboard'], {
        fragment: 'staff-records',
      })
      .then(() =>
        this.alertService.addAlert({
          type: 'success',
          message: `${this.worker.nameOrId} has been deleted`,
        }),
      );
  }
}
