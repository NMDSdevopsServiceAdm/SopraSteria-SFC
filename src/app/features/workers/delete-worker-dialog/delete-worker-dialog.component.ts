import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Worker } from '@core/model/worker.model';
import { Dialog, DIALOG_DATA } from '@core/services/dialog.service';
import { EstablishmentService } from '@core/services/establishment.service';
import { MessageService } from '@core/services/message.service';
import { Reason, WorkerService } from '@core/services/worker.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-delete-worker-dialog',
  templateUrl: './delete-worker-dialog.component.html',
  styleUrls: ['./delete-worker-dialog.component.scss'],
})
export class DeleteWorkerDialogComponent implements OnInit {
  public reasons: Reason[];
  private totalStaff: number;
  private form: FormGroup;
  private subscriptions: Subscription = new Subscription();

  constructor(
    @Inject(DIALOG_DATA) public worker: Worker,
    public dialog: Dialog<DeleteWorkerDialogComponent>,
    private formBuilder: FormBuilder,
    private messageService: MessageService,
    private establishmentService: EstablishmentService,
    private workerService: WorkerService
  ) {
    this.form = this.formBuilder.group({
      reason: null,
      details: [null, [Validators.maxLength(500)]],
    });
  }

  ngOnInit() {
    this.subscriptions.add(
      this.establishmentService.getStaff().subscribe(totalStaff => {
        this.totalStaff = totalStaff;
      })
    );

    this.subscriptions.add(
      this.workerService.getLeaveReasons().subscribe(reasons => {
        this.reasons = reasons;
      })
    );
  }

  close() {
    this.dialog.close();
  }

  async submitHandler() {
    try {
      await this.saveHandler();
      this.dialog.close(this.worker.nameOrId);
    } catch (err) {
      // keep typescript transpiler silent
    }
  }

  saveHandler(): Promise<any> {
    return new Promise((resolve, reject) => {
      const { reason, details } = this.form.controls;
      this.messageService.clearError();

      if (this.form.valid) {
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
          this.workerService.deleteWorker(this.worker.uid, deleteReason).subscribe(() => {
            this.subscriptions.add(
              this.establishmentService.postStaff(this.totalStaff - 1).subscribe(null, null, resolve)
            );
          }, reject)
        );
      } else {
        if (details.errors.maxLength) {
          this.messageService.show(
            'error',
            `Other Details can not be longer than ${details.errors.maxLength.requiredLength} characters`
          );
        }
        reject();
      }
    });
  }
}
