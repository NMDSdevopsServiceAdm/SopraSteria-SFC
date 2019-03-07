import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Worker } from '@core/model/worker.model';
import { MessageService } from '@core/services/message.service';
import { RecruitmentResponse, RecruitmentService } from '@core/services/recruitment.service';
import { WorkerEditResponse, WorkerService } from '@core/services/worker.service';
import { Subscription } from 'rxjs';

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
    private route: ActivatedRoute,
    private router: Router,
    private workerService: WorkerService,
    private recruitmentService: RecruitmentService,
    private messageService: MessageService
  ) {
    this.saveHandler = this.saveHandler.bind(this);
    this.recruitedFromIdValidator = this.recruitedFromIdValidator.bind(this);
    this.recruitmentKnownChangeHandler = this.recruitmentKnownChangeHandler.bind(this);
  }

  ngOnInit() {
    this.worker = this.route.parent.snapshot.data.worker;

    this.backLink =
      this.worker.countryOfBirth && this.worker.countryOfBirth.value === 'United Kingdom'
        ? 'country-of-birth'
        : 'year-arrived-uk';

    this.form = this.formBuilder.group({
      recruitmentKnown: null,
      recruitedFromId: [null, this.recruitedFromIdValidator],
    });

    if (this.worker.recruitedFrom) {
      const { value, from } = this.worker.recruitedFrom;
      this.form.patchValue({
        recruitmentKnown: value,
        recruitedFromId: from ? from.recruitedFromId : null,
      });
    }

    this.subscriptions.add(
      this.recruitmentService.getRecruitedFrom().subscribe(res => (this.availableRecruitments = res))
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

      const recruitedObj = this.availableRecruitments.find(
        recruitment => recruitment.id === parseInt(recruitedFromId.value, 10)
      );

      if (this.form.valid) {
        if (recruitmentKnown.value) {
          this.worker.recruitedFrom = {
            value: recruitmentKnown.value,
            from: {
              recruitedFromId: recruitedObj.id,
              from: recruitedObj.from,
            },
          };
        }

        this.subscriptions.add(this.workerService.setWorker(this.worker).subscribe(resolve, reject));
      } else {
        if (recruitedFromId.errors && Object.keys(recruitedFromId.errors).includes('recruitedFromIdValid')) {
          this.messageService.show('error', `'Recruitment from' has to be provided.`);
        }

        reject();
      }
    });
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
