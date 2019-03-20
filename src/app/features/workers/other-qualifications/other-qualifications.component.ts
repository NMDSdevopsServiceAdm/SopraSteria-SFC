import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { Worker } from '@core/model/worker.model';
import { MessageService } from '@core/services/message.service';
import { WorkerEditResponse, WorkerService } from '@core/services/worker.service';
import { Subscription } from 'rxjs';
import { take } from 'rxjs/operators';

@Component({
  selector: 'app-other-qualifications',
  templateUrl: './other-qualifications.component.html',
})
export class OtherQualificationsComponent implements OnInit, OnDestroy {
  public answersAvailable = ['Yes', 'No', `Don't know`];
  public backLink: string;
  public form: FormGroup;
  private worker: Worker;
  private subscriptions: Subscription = new Subscription();

  constructor(
    private workerService: WorkerService,
    private messageService: MessageService,
    private formBuilder: FormBuilder,
    private router: Router
  ) {
    this.saveHandler = this.saveHandler.bind(this);
  }

  ngOnInit() {
    this.form = this.formBuilder.group({
      otherQualification: null,
    });

    this.workerService.worker$.pipe(take(1)).subscribe(worker => {
      this.worker = worker;

      if (this.workerService.returnToSummary) {
        this.backLink = 'summary';
      } else {
        this.backLink =
          this.worker.qualificationInSocialCare === 'Yes'
            ? 'social-care-qualification-level'
            : 'social-care-qualification';
      }

      if (this.worker.otherQualification) {
        this.form.patchValue({
          otherQualification: this.worker.otherQualification,
        });
      }
    });
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
    this.messageService.clearAll();
  }

  async submitHandler() {
    try {
      await this.saveHandler();

      const { otherQualification } = this.form.value;

      if (otherQualification === 'Yes') {
        this.router.navigate(['/worker', this.worker.uid, 'other-qualifications-level']);
      } else {
        this.router.navigate(['/worker', this.worker.uid, 'summary']);
      }
    } catch (err) {
      // keep typescript transpiler silent
    }
  }

  saveHandler(): Promise<WorkerEditResponse> {
    return new Promise((resolve, reject) => {
      const { otherQualification } = this.form.controls;
      this.messageService.clearError();

      if (this.form.valid) {
        const props = {
          otherQualification: otherQualification.value,
        };

        this.subscriptions.add(
          this.workerService.updateWorker(this.worker.uid, props).subscribe(data => {
            this.workerService.setState({ ...this.worker, ...data });
            resolve();
          }, reject)
        );
      } else {
        reject();
      }
    });
  }
}
