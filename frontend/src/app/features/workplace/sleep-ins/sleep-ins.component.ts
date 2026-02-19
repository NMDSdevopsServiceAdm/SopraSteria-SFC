import { Component, OnDestroy, OnInit } from '@angular/core';
import { WorkplaceQuestion } from '../question/question.component';
import { UntypedFormBuilder } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { BackService } from '@core/services/back.service';
import { ErrorSummaryService } from '@core/services/error-summary.service';
import { EstablishmentService } from '@core/services/establishment.service';
import { WorkplaceFlowSections } from '@core/utils/progress-bar-util';
import { YesNoDontKnowOptions } from '@core/model/YesNoDontKnow.enum';

@Component({
  selector: 'app-sleep-ins',
  templateUrl: './sleep-ins.component.html',
  standalone: false,
})
export class SleepInsComponent extends WorkplaceQuestion implements OnInit, OnDestroy {
  public section: string;
  public options = YesNoDontKnowOptions;

  constructor(
    protected formBuilder: UntypedFormBuilder,
    protected router: Router,
    protected backService: BackService,
    protected errorSummaryService: ErrorSummaryService,
    protected establishmentService: EstablishmentService,
    protected route: ActivatedRoute,
  ) {
    super(formBuilder, router, backService, errorSummaryService, establishmentService);
  }

  init(): void {
    this.setSectionHeading();
    this.setupForm();
    this.setPreviousRoute();
    this.prefill()
    this.skipToQuestionPage = 'do-you-have-vacancies';
  }

  public setSectionHeading() {
    this.section = WorkplaceFlowSections.SERVICES;
  }

  setupForm() {
    this.form = this.formBuilder.group(
      {
        offerSleepIn: null,
      },
      { updateOn: 'submit' },
    );
  }

  private prefill(): void {
    const offerSleepIn = this.establishment.offerSleepIn

    if(!offerSleepIn) return

    this.form.patchValue({
      offerSleepIn
    })
  }

  private setPreviousRoute(): void {
    this.previousQuestionPage = this.establishment.mainService.canDoDelegatedHealthcareActivities
      ? 'what-kind-of-delegated-healthcare-activities'
      : 'service-users';
  }

  protected generateUpdateProps(): any {
    const { offerSleepIn } = this.form.value;

    if (!offerSleepIn) {
      return null;
    }

    return offerSleepIn;
  }

  protected updateEstablishment(props: any): void {
    if (!props) {
      return;
    }

    const offerSleepInData = {
      property: 'offerSleepIn',
      value: props,
    };

    this.subscriptions.add(
      this.establishmentService.updateSingleEstablishmentField(this.establishment.uid, offerSleepInData).subscribe(
        (data) => this._onSuccess(data.data),
        (error) => this.onError(error),
      ),
    );
  }

  protected onSuccess(): void {
    const { offerSleepIn } = this.form.value;

    if (offerSleepIn === YesNoDontKnowOptions[0].label) {
      this.nextQuestionPage = 'how-to-pay-for-sleep-in';
    } else {
      this.nextQuestionPage = this.skipToQuestionPage;
    }
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
}
