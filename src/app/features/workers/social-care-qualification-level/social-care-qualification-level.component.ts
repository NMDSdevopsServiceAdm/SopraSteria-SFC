import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { QualificationLevel } from '@core/model/qualification.model';
import { Worker } from '@core/model/worker.model';
import { MessageService } from '@core/services/message.service';
import { QualificationService } from '@core/services/qualification.service';
import { WorkerEditResponse, WorkerService } from '@core/services/worker.service';
import { Subscription } from 'rxjs';
import { take } from 'rxjs/operators';

@Component({
  selector: 'app-social-care-qualification-level',
  templateUrl: './social-care-qualification-level.component.html',
})
export class SocialCareQualificationLevelComponent implements OnInit, OnDestroy {
  public qualifications: QualificationLevel[];
  public form: FormGroup;
  public backLink: string;
  private worker: Worker;
  private subscriptions: Subscription = new Subscription();

  constructor(
    private workerService: WorkerService,
    private messageService: MessageService,
    private formBuilder: FormBuilder,
    private router: Router,
    private qualificationService: QualificationService
  ) {
    this.saveHandler = this.saveHandler.bind(this);
  }

  ngOnInit() {
    this.form = this.formBuilder.group({
      qualification: [null, Validators.required],
    });

    if (this.workerService.returnToSummary) {
      this.backLink = 'summary';
    } else {
      this.backLink = 'social-care-qualification';
    }

    this.workerService.worker$.pipe(take(1)).subscribe(worker => {
      this.worker = worker;

      if (this.worker.qualificationInSocialCare !== 'Yes') {
        this.router.navigate(['/worker', this.worker.uid, 'social-care-qualification'], { replaceUrl: true });
      }

      if (this.worker.socialCareQualification) {
        this.form.patchValue({
          qualification: this.worker.socialCareQualification.qualificationId,
        });
      }
    });

    this.subscriptions.add(
      this.qualificationService.getQualifications().subscribe(qualifications => {
        this.qualifications = qualifications;
      })
    );
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
    this.messageService.clearAll();
  }

  async submitHandler() {
    try {
      await this.saveHandler();

      this.router.navigate(['/worker', this.worker.uid, 'other-qualifications']);
    } catch (err) {
      // keep typescript transpiler silent
    }
  }

  saveHandler(): Promise<WorkerEditResponse> {
    return new Promise((resolve, reject) => {
      const { qualification } = this.form.controls;
      this.messageService.clearError();

      if (this.form.valid) {
        const props = {
          socialCareQualification: {
            qualificationId: parseInt(qualification.value, 10),
          },
        };

        this.subscriptions.add(
          this.workerService.updateWorker(this.worker.uid, props).subscribe(data => {
            this.workerService.setState({ ...this.worker, ...data });
            resolve();
          }, reject)
        );
      } else {
        if (qualification.errors.required) {
          this.messageService.show('error', 'Please fill required fields.');
        }

        reject();
      }
    });
  }
}
