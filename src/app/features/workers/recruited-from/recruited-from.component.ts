import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { Worker } from '@core/model/worker.model';
import { MessageService } from '@core/services/message.service';
import { RecruitmentResponse, RecruitmentService } from '@core/services/recruitment.service';
import { WorkerEditResponse, WorkerService } from '@core/services/worker.service';
import { Subscription } from 'rxjs';
import { take } from 'rxjs/operators';

@Component({
  selector: 'app-recruited-from',
  templateUrl: './recruited-from.component.html',
})
export class RecruitedFromComponent implements OnInit, OnDestroy {
  public availableRecruitments: RecruitmentResponse[];
  public backLink: string;
  public form: FormGroup;
  private worker: Worker;
  private subscriptions: Subscription = new Subscription();

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private workerService: WorkerService,
    private recruitmentService: RecruitmentService,
    private messageService: MessageService
  ) {
    this.saveHandler = this.saveHandler.bind(this);
    this.recruitedFromIdValidator = this.recruitedFromIdValidator.bind(this);
  }

  ngOnInit() {
    this.form = this.formBuilder.group({
      recruitmentKnown: null,
      recruitedFromId: [null, this.recruitedFromIdValidator],
    });

    this.workerService.worker$.pipe(take(1)).subscribe(worker => {
      this.worker = worker;

      if (this.workerService.returnToSummary) {
        this.backLink = 'summary';
      } else {
        this.backLink =
          this.worker.countryOfBirth && this.worker.countryOfBirth.value === 'United Kingdom'
            ? 'country-of-birth'
            : 'year-arrived-uk';
      }

      if (this.worker.recruitedFrom) {
        const { value, from } = this.worker.recruitedFrom;
        this.form.patchValue({
          recruitmentKnown: value,
          recruitedFromId: from ? from.recruitedFromId : null,
        });
      }
    });

    this.subscriptions.add(
      this.recruitmentService.getRecruitedFrom().subscribe(res => (this.availableRecruitments = res))
    );

    this.subscriptions.add(
      this.form.controls.recruitmentKnown.valueChanges.subscribe(val => {
        this.form.controls.recruitedFromId.reset();
        this.form.controls.recruitedFromId.updateValueAndValidity();
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
      this.router.navigate(['/worker', this.worker.uid, 'adult-social-care-started']);
    } catch (err) {
      // keep typescript transpiler silent
    }
  }

  saveHandler(): Promise<WorkerEditResponse> {
    return new Promise((resolve, reject) => {
      const { recruitedFromId, recruitmentKnown } = this.form.controls;
      this.messageService.clearError();

      if (this.form.valid) {
        const props = {
          ...(recruitmentKnown.value && {
            recruitedFrom: {
              value: recruitmentKnown.value,
              ...(recruitedFromId.value && {
                from: {
                  recruitedFromId: parseInt(recruitedFromId.value, 10),
                },
              }),
            },
          }),
        };

        this.subscriptions.add(
          this.workerService.updateWorker(this.worker.uid, props).subscribe(data => {
            this.workerService.setState({ ...this.worker, ...data });
            resolve();
          }, reject)
        );
      } else {
        if (recruitedFromId.errors.recruitedFromIdValid) {
          this.messageService.show('error', `'Recruitment from' has to be provided.`);
        }

        reject();
      }
    });
  }

  recruitedFromIdValidator() {
    if (this.form) {
      const { recruitmentKnown, recruitedFromId } = this.form.value;

      if (recruitmentKnown === 'Yes') {
        return recruitedFromId ? null : { recruitedFromIdValid: true };
      }
    }

    return null;
  }
}
