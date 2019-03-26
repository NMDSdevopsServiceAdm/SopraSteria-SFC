import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { Worker } from '@core/model/worker.model';
import { MessageService } from '@core/services/message.service';
import { WorkerEditResponse, WorkerService } from '@core/services/worker.service';
import { Subscription } from 'rxjs';
import { take } from 'rxjs/operators';

@Component({
  selector: 'app-social-care-qualification',
  templateUrl: './social-care-qualification.component.html',
})
export class SocialCareQualificationComponent implements OnInit, OnDestroy {
  public answersAvailable = ['Yes', 'No', `Don't know`];
  public form: FormGroup;
  public backLink: string;
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
      qualificationInSocialCare: null,
    });

    if (this.workerService.returnToSummary) {
      this.backLink = 'summary';
    } else {
      this.backLink = 'apprenticeship-training';
    }

    this.workerService.worker$.pipe(take(1)).subscribe(worker => {
      this.worker = worker;

      if (this.worker.qualificationInSocialCare) {
        this.form.patchValue({
          qualificationInSocialCare: this.worker.qualificationInSocialCare,
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

      const { qualificationInSocialCare } = this.form.value;

      if (qualificationInSocialCare === 'Yes') {
        this.router.navigate(['/worker', this.worker.uid, 'social-care-qualification-level']);
      } else {
        this.router.navigate(['/worker', this.worker.uid, 'other-qualifications']);
      }
    } catch (err) {
      // keep typescript transpiler silent
    }
  }

  saveHandler(): Promise<WorkerEditResponse> {
    return new Promise((resolve, reject) => {
      const { qualificationInSocialCare } = this.form.controls;
      this.messageService.clearError();

      if (this.form.valid) {
        const props = {
          qualificationInSocialCare: qualificationInSocialCare.value,
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
