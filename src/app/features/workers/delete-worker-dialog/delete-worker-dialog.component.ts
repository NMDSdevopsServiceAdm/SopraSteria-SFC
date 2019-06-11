import { Component, Inject, OnDestroy, OnInit, HostListener } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ErrorDetails } from '@core/model/errorSummary.model';
import { Worker } from '@core/model/worker.model';
import { Dialog, DIALOG_DATA } from '@core/services/dialog.service';
import { ErrorSummaryService } from '@core/services/error-summary.service';
import { Reason, WorkerService } from '@core/services/worker.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-delete-worker-dialog',
  templateUrl: './delete-worker-dialog.component.html',
})
export class DeleteWorkerDialogComponent implements OnInit, OnDestroy {
  public reasons: Reason[];
  public maxLength = 500;
  public form: FormGroup;
  public submitted = false;
  private formErrorsMap: Array<ErrorDetails>;
  private subscriptions: Subscription = new Subscription();

  constructor(
    @Inject(DIALOG_DATA) public worker: Worker,
    public dialog: Dialog<DeleteWorkerDialogComponent>,
    private router: Router,
    private formBuilder: FormBuilder,
    private errorSummaryService: ErrorSummaryService,
    private workerService: WorkerService
  ) {
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

  @HostListener('document:keydown', ['$event']) onKeydownHandler(event: KeyboardEvent) {
      if (event.keyCode === 27) {
          this.dialog.close();
      }
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
        .deleteWorker(this.worker.uid, deleteReason)
        .subscribe(() => this.onSuccess(), error => this.onError(error))
    );
  }

  private onSuccess(): void {
    this.workerService.setLastDeleted(this.worker.nameOrId);
    this.router.navigate(['/worker', 'delete-success'], { replaceUrl: true });
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
