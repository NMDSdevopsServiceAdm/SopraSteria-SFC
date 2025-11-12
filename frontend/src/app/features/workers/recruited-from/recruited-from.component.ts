import { Component } from '@angular/core';
import { UntypedFormBuilder } from '@angular/forms';
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
    standalone: false
})
export class RecruitedFromComponent extends QuestionComponent {
  public availableRecruitments: RecruitmentResponse[];
  public doNotKnowValue = 'I do not know';
  public doNotKnowId = 99;

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
    this.getAndSetRecruitedFromData();

    this.subscriptions.add(
      this.form.get('recruitedFromId').valueChanges.subscribe(() => {
        this.submitted = false;
      }),
    );

    if (this.worker.recruitedFrom) {
      const { value, from } = this.worker.recruitedFrom;
      this.patchFormValue(value, from);
    }
    this.next = this.getRoutePath('adult-social-care-started');
  }

  generateUpdateProps() {
    const { recruitedFromId } = this.form.value;

    if (!recruitedFromId) {
      return null;
    }

    return {
      recruitedFrom: {
        value: this.getRecruitmentKnownValue(recruitedFromId),
        ...(recruitedFromId && {
          from: {
            recruitedFromId: parseInt(recruitedFromId, 10),
          },
        }),
      },
    };
  }

  public getRecruitmentKnownValue(value): string {
    return value === this.doNotKnowId ? 'No' : 'Yes';
  }

  public patchFormValue(value, from): void {
    if (value === 'No') {
      this.form.patchValue({
        recruitedFromId: this.doNotKnowId,
      });
    } else if (value === 'Yes') {
      this.form.patchValue({
        recruitedFromId: from.recruitedFromId,
      });
    }
  }

  public async getAndSetRecruitedFromData(): Promise<void> {
    this.subscriptions.add(
      this.recruitmentService.getRecruitedFrom().subscribe((res) => {
        this.availableRecruitments = res.concat([{ from: this.doNotKnowValue, id: this.doNotKnowId }]);
      }),
    );
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }
}
