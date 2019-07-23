import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { DialogComponent } from '@core/components/dialog.component';
import { ErrorDetails } from '@core/model/errorSummary.model';
import { Establishment } from '@core/model/establishment.model';
import { Worker } from '@core/model/worker.model';
import { Dialog, DIALOG_DATA } from '@core/services/dialog.service';
import { ErrorSummaryService } from '@core/services/error-summary.service';
import { Reason, WorkerService } from '@core/services/worker.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-delete-worker-dialog',
  templateUrl: './delete-worker-dialog.component.html',
})
export class DeleteWorkerDialogComponent extends DialogComponent implements OnInit, OnDestroy {
  public reasons: Reason[];
  public maxLength = 500;
  public form: FormGroup;
  public submitted = false;
  private formErrorsMap: Array<ErrorDetails>;
  private subscriptions: Subscription = new Subscription();

  constructor(
    @Inject(DIALOG_DATA) public data: { worker: Worker; workplace: Establishment },
    public dialog: Dialog<DeleteWorkerDialogComponent>,
    private router: Router,
    private route: ActivatedRoute,
    private formBuilder: FormBuilder,
    private errorSummaryService: ErrorSummaryService,
    private workerService: WorkerService
  ) {
    super(data, dialog);

    this.form = this.formBuilder.group({
      reason: null,
      details: [null, [Validators.maxLength(this.maxLength)]],
    });
  }

  ngOnInit() {
    this.subscriptions.add(
      this.workerService.getLeaveReasons().subscribe(reasons => {
        this.reasons = reasons;
      })
    );

    this.setupFormErrors();
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }

  public getFormErrorMessage(item: string, errorType: string): string {
    return this.errorSummaryService.getFormErrorMessage(item, errorType, this.formErrorsMap);
  }

  public close() {
    this.dialog.close();
  }

  public onSubmit() {
    this.submitted = true;
    this.errorSummaryService.syncFormErrorsEvent.next(true);

    if (!this.form.valid) {
      this.errorSummaryService.scrollToErrorSummary();
      return;
    }

    const { reason, details } = this.form.controls;
    const deleteReason = reason.value
      ? {
          reason: {
            id: parseInt(reason.value, 10),
            ...(details.value && {
              other: details.value,
            }),
          },
        }
      : null;

    this.subscriptions.add(
      this.workerService
        .deleteWorker(this.data.worker.uid, deleteReason)
        .subscribe(() => this.onSuccess(), error => this.onError(error))
    );
  }

  private onSuccess(): void {
    this.workerService.setLastDeleted(this.data.worker.nameOrId);
    this.router.navigate(['/workplace', this.data.workplace.uid, 'staff-record', 'delete-success'], {
      relativeTo: this.route,
      replaceUrl: true,
    });
    this.close();
  }

  private onError(error): void {
    console.log(error);
  }

  private setupFormErrors(): void {
    this.formErrorsMap = [
      {
        item: 'details',
        type: [
          {
            name: 'maxLength',
            message: `Details must be ${this.maxLength} characters or less`,
          },
        ],
      },
    ];
  }
}
