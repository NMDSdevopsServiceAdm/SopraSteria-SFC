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
  public doNotKnowValue = 'I do not know';
  public doNotKnowId: Number;

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
      recruitedFromId: null,
    });
  }

  init() {
    this.subscriptions.add(
      this.form.get('recruitedFromId').valueChanges.subscribe(() => {
        this.submitted = false;
      }),
    );

    this.getAndSetRecruitedFromData();

    if (this.worker.recruitedFrom) {
      const { value, from } = this.worker.recruitedFrom;
      console.log(value);
      console.log(from);
      this.form.patchValue({
        recruitedFromId: from.recruitedFromId,
      });
    }

    this.next = this.getRoutePath('adult-social-care-started');
  }

  generateUpdateProps() {
    const { recruitedFromId } = this.form.value;

    // if (!recruitedFromId) {
    //   return null;
    // }

    return {
      recruitedFrom: {
        value: this.setRecruitmentKnownValue(recruitedFromId),
        ...(recruitedFromId && {
          from: {
            recruitedFromId: parseInt(recruitedFromId, 10),
          },
        }),
      },
    };
  }

  public setRecruitmentKnownValue(value) {
    if (value === this.doNotKnowId) {
      return 'No';
    } else {
      return 'Yes';
    }
  }

  public getAndSetRecruitedFromData(): void {
    this.subscriptions.add(
      this.recruitmentService.getRecruitedFrom().subscribe((res) => {
        this.availableRecruitments = res.concat([{ from: this.doNotKnowValue, id: res.length + 1 }]);
        this.doNotKnowId = this.availableRecruitments.length;
      }),
    );
  }
}
