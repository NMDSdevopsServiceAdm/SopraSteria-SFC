import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { Worker } from '@core/model/worker.model';
import { MessageService } from '@core/services/message.service';
import { RecruitmentResponse, RecruitmentService } from '@core/services/recruitment.service';
import { WorkerEditResponse, WorkerService } from '@core/services/worker.service';

@Component({
  selector: 'app-recruited-from',
  templateUrl: './recruited-from.component.html',
})
export class RecruitedFromComponent implements OnInit, OnDestroy {
  public availableRecruitments: RecruitmentResponse[];
  public form: FormGroup;
  private subscriptions = [];
  private worker: Worker;
  private workerId: string;

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private workerService: WorkerService,
    private recruitmentService: RecruitmentService,
    private messageService: MessageService,
  ) {
    this.saveHandler = this.saveHandler.bind(this);
    this.recruitedFromIdValidator = this.recruitedFromIdValidator.bind(this);
    this.recruitmentKnownChangeHandler = this.recruitmentKnownChangeHandler.bind(this);
  }

  ngOnInit() {
    this.form = this.formBuilder.group({
      recruitmentKnown: null,
      recruitedFromId: [null, this.recruitedFromIdValidator],
    });

    this.workerId = this.workerService.workerId;

    this.subscriptions.push(
      this.workerService.getWorker(this.workerId).subscribe(worker => {
        this.worker = worker;

        if (worker.recruitedFrom) {
          this.form.patchValue({
            recruitmentKnown: worker.recruitedFrom.value,
            recruitedFromId: worker.recruitedFrom.from ? worker.recruitedFrom.from.recruitedFromId : null,
          });
        }
      }),
    );

    this.subscriptions.push(
      this.recruitmentService.getRecruitedFrom().subscribe(res => (this.availableRecruitments = res)),
    );
  }

  ngOnDestroy() {
    this.subscriptions.forEach(s => s.unsubscribe());
    this.messageService.clearAll();
  }

  async submitHandler() {
    try {
      await this.saveHandler();
      this.router.navigate(['/worker/adult-social-care-started']);
    } catch (err) {
      // keep typescript transpiler silent
    }
  }

  saveHandler(): Promise<WorkerEditResponse> {
    return new Promise((resolve, reject) => {
      const { recruitedFromId, recruitmentKnown } = this.form.controls;
      this.messageService.clearError();

      if (this.form.valid) {
        if (recruitmentKnown.value) {
          this.worker.recruitedFrom = {
            value: recruitmentKnown.value,
            from: {
              recruitedFromId: parseInt(recruitedFromId.value, 10),
            },
          };
        }

        this.subscriptions.push(this.workerService.setWorker(this.worker).subscribe(resolve, reject));
      } else {
        if (recruitedFromId.errors && Object.keys(recruitedFromId.errors).includes('recruitedFromIdValid')) {
          this.messageService.show('error', `'Recruitment from' has to be provided.`);
        }

        reject();
      }
    });
  }

  goBack(event) {
    event.preventDefault();

    if (this.worker.countryOfBirth && this.worker.countryOfBirth.value === 'United Kingdom') {
      this.router.navigate(['/worker/country-of-birth']);
    } else {
      this.router.navigate(['/worker/year-arrived-uk']);
    }
  }

  recruitmentKnownChangeHandler() {
    this.form.controls.recruitedFromId.reset();
  }

  recruitedFromIdValidator() {
    if (this.form) {
      const { recruitmentKnown } = this.form.value;
      const recruitedFromId = this.form.controls.recruitedFromId.value;

      if (recruitmentKnown === 'Yes') {
        return recruitedFromId ? null : { recruitedFromIdValid: true };
      }
    }

    return null;
  }
}
