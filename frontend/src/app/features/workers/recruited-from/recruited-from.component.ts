import { Component } from '@angular/core';
import { UntypedFormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { BackLinkService } from '@core/services/backLink.service';
import { ErrorSummaryService } from '@core/services/error-summary.service';
import { EstablishmentService } from '@core/services/establishment.service';
import { RecruitmentResponse, RecruitmentService } from '@core/services/recruitment.service';
import { WorkerService } from '@core/services/worker.service';

import { QuestionComponent } from '../question/question.component';

@Component({
  selector: 'app-recruited-from',
  templateUrl: './recruited-from.component.html',
})
export class RecruitedFromComponent extends QuestionComponent {
  public availableRecruitments: RecruitmentResponse[];

  constructor(
    protected formBuilder: UntypedFormBuilder,
    protected router: Router,
    protected route: ActivatedRoute,
    protected backLinkService: BackLinkService,
    protected errorSummaryService: ErrorSummaryService,
    protected workerService: WorkerService,
    protected establishmentService: EstablishmentService,
    private recruitmentService: RecruitmentService,
  ) {
    super(formBuilder, router, route, backLinkService, errorSummaryService, workerService, establishmentService);

    this.form = this.formBuilder.group({
      recruitmentKnown: null,
      recruitedFromId: null,
    });
  }

  init() {
    this.subscriptions.add(
      this.form.get('recruitmentKnown').valueChanges.subscribe((val) => {
        this.form.get('recruitedFromId').clearValidators();
        if (val === 'Yes') {
          this.form.get('recruitedFromId').setValidators(Validators.required);
        }

        this.form.get('recruitedFromId').updateValueAndValidity();
      }),
    );

    this.subscriptions.add(
      this.form.get('recruitedFromId').valueChanges.subscribe(() => {
        this.submitted = false;
      }),
    );

    this.subscriptions.add(
      this.recruitmentService.getRecruitedFrom().subscribe((res) => (this.availableRecruitments = res)),
    );

    if (this.worker.recruitedFrom) {
      const { value, from } = this.worker.recruitedFrom;
      this.form.patchValue({
        recruitmentKnown: value,
        recruitedFromId: from ? from.recruitedFromId : null,
      });
    }

    this.next = this.getRoutePath('adult-social-care-started');
  }

  setupFormErrorsMap(): void {
    this.formErrorsMap = [
      {
        item: 'recruitedFromId',
        type: [
          {
            name: 'required',
            message: 'Select where they were recruited from',
          },
        ],
      },
    ];
  }

  generateUpdateProps() {
    const { recruitedFromId, recruitmentKnown } = this.form.value;

    if (!recruitmentKnown) {
      return null;
    }

    return {
      recruitedFrom: {
        value: recruitmentKnown,
        ...(recruitedFromId && {
          from: {
            recruitedFromId: parseInt(recruitedFromId, 10),
          },
        }),
      },
    };
  }
}
