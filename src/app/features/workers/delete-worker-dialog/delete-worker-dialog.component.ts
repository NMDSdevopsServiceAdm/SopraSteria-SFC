import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Worker } from '@core/model/worker.model';
import { Dialog, DIALOG_DATA } from '@core/services/dialog.service';
import { EstablishmentService } from '@core/services/establishment.service';
import { MessageService } from '@core/services/message.service';
import { WorkerService } from '@core/services/worker.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-delete-worker-dialog',
  templateUrl: './delete-worker-dialog.component.html',
  styleUrls: ['./delete-worker-dialog.component.scss'],
})
export class DeleteWorkerDialogComponent implements OnInit {
  public reasons = [
    { id: 1, reason: 'They moved to another adult social care employer' },
    { id: 2, reason: 'They moved to a role in the health sector' },
    { id: 3, reason: 'They moved to a different sector (e.g. retail)' },
    { id: 4, reason: 'They moved to another role in this organisation' },
    { id: 5, reason: 'The worker chose to leave (destination unknown)' },
    { id: 6, reason: 'The worker retired' },
    { id: 7, reason: 'Employer terminated their employment' },
    { id: 8, reason: 'Other' },
    { id: 9, reason: 'Not known' },
  ];
  private totalStaff: number;
  private form: FormGroup;
  private subscriptions: Subscription = new Subscription();

  constructor(
    @Inject(DIALOG_DATA) public worker: Worker,
    public dialog: Dialog<DeleteWorkerDialogComponent>,
    private formBuilder: FormBuilder,
    private router: Router,
    private messageService: MessageService,
    private establishmentService: EstablishmentService,
    private workerService: WorkerService
  ) {
    this.form = this.formBuilder.group({
      reason: [null, Validators.required],
      details: [null, [Validators.maxLength(300)]],
    });
  }

  ngOnInit() {
    this.subscriptions.add(
      this.establishmentService.getStaff().subscribe(totalStaff => {
        this.totalStaff = totalStaff;
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
        const deleteReason = {
          reason: {
            id: parseInt(reason.value, 10),
            ...(details.value && {
              other: details.value,
            }),
          },
        };
        this.subscriptions.add(
          this.workerService.deleteWorker(this.worker.uid, deleteReason).subscribe(() => {
            this.subscriptions.add(
              this.establishmentService.postStaff(this.totalStaff - 1).subscribe(null, null, resolve)
            );
          }, reject)
        );
      } else {
        if (reason.errors.required) {
          this.messageService.show('error', 'Reason is required.');
        } else if (details.errors.maxLength) {
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
