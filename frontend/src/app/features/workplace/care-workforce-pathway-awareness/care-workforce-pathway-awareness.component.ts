import { Component, OnDestroy, OnInit } from '@angular/core';
import { Question } from '../question/question.component';
import { UntypedFormBuilder } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { BackService } from '@core/services/back.service';
import { ErrorSummaryService } from '@core/services/error-summary.service';
import { EstablishmentService } from '@core/services/establishment.service';
import { WorkplaceFlowSections } from '@core/utils/progress-bar-util';
import { CareWorkforcePathwayService } from '@core/services/care-workforce-pathway.service';
import { CareWorkforcePathwayWorkplaceAwarenessAnswer } from '@core/model/care-workforce-pathway.model';

@Component({
  selector: 'app-care-workforce-pathway-awareness',
  templateUrl: './care-workforce-pathway-awareness.component.html',
})
export class CareWorkforcePathwayAwarenessComponent extends Question implements OnInit, OnDestroy {
  public section = WorkplaceFlowSections.RECRUITMENT_AND_BENEFITS;
  public careWorkforcePathwayAwarenessAnswers: CareWorkforcePathwayWorkplaceAwarenessAnswer[];

  constructor(
    protected formBuilder: UntypedFormBuilder,
    protected router: Router,
    protected backService: BackService,
    protected errorSummaryService: ErrorSummaryService,
    protected establishmentService: EstablishmentService,
    protected careWorkforcePathwayService: CareWorkforcePathwayService,
    protected route: ActivatedRoute,
  ) {
    super(formBuilder, router, backService, errorSummaryService, establishmentService);
  }

  protected init(): void {
    this.setupForm();
    this.getCareWorkforcePathwayAwarenessAnswers();
    this.setPreviousRoute();
    this.prefill();

    this.skipRoute = ['/workplace', this.establishment.uid, 'cash-loyalty'];
  }

  private setPreviousRoute(): void {
    this.previousRoute = ['/workplace', this.establishment.uid, 'accept-previous-care-certificate'];
  }

  private setupForm(): void {
    this.form = this.formBuilder.group(
      {
        careWorkforcePathwayAwareness: null,
      },
      { updateOn: 'submit' },
    );
  }

  private getCareWorkforcePathwayAwarenessAnswers(): void {
    this.careWorkforcePathwayAwarenessAnswers = this.route.snapshot.data.careWorkforcePathwayWorkplaceAwarenessAnswers;
  }

  private prefill(): void {
    const careWorkforcePathwayWorkplaceAwareness = this.establishment.careWorkforcePathwayWorkplaceAwareness;
    if (!careWorkforcePathwayWorkplaceAwareness) {
      return;
    }
    this.form.patchValue({
      careWorkforcePathwayAwareness: careWorkforcePathwayWorkplaceAwareness?.id,
    });
  }

  protected generateUpdateProps(): any {
    const { careWorkforcePathwayAwareness } = this.form.value;
    if (!careWorkforcePathwayAwareness) {
      return null;
    }

    return { careWorkforcePathwayAwareness };
  }

  protected updateEstablishment(props: any): void {
    if (!props) {
      return;
    }
    const cwpData = {
      careWorkforcePathwayWorkplaceAwareness: { id: props.careWorkforcePathwayAwareness },
    };

    this.subscriptions.add(
      this.establishmentService.updateCareWorkforcePathwayAwareness(this.establishment.uid, cwpData).subscribe(
        (data) => this._onSuccess(data),
        (error) => this.onError(error),
      ),
    );
  }

  protected onSuccess(): void {
    const awareAnswersIds = this.careWorkforcePathwayAwarenessAnswers.slice(0, 3).map((answer) => {
      return answer.id;
    });

    const { careWorkforcePathwayAwareness } = this.form.value;

    if (awareAnswersIds.includes(careWorkforcePathwayAwareness)) {
      this.nextRoute = ['/workplace', `${this.establishment.uid}`, 'care-workforce-pathway-use'];
      this.submitAction = { action: 'continue', save: true };
    } else {
      this.nextRoute = this.skipRoute;
    }
  }

  protected setupServerErrorsMap(): void {
    this.serverErrorsMap = [
      {
        name: 400,
        message: 'Failed to update care workforce pathway awareness',
      },
      {
        name: 500,
        message: 'Failed to update care workforce pathway awareness',
      },
    ];
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
}
