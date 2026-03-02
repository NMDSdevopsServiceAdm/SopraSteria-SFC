import { Component, OnDestroy, OnInit } from '@angular/core';
import { WorkplaceQuestion } from '../question/question.component';
import { YesNoDontKnowOptions } from '@core/model/YesNoDontKnow.enum';
import { WorkplaceFlowSections } from '@core/utils/progress-bar-util';

@Component({
  selector: 'app-staff-opt-out-of-workplace-pension',
  templateUrl: './staff-opt-out-of-workplace-pension.component.html',
  standalone: false,
})
export class StaffOptOutOfWorkplacePensionComponent extends WorkplaceQuestion implements OnInit, OnDestroy {
  public section: string;
  public options = YesNoDontKnowOptions;

  init(): void {
    this.setSectionHeading();
    this.setupForm();
    this.prefill();
    this.setupRoutes();
  }

  public setSectionHeading(): void {
    this.section = WorkplaceFlowSections.PAY_AND_BENEFITS;
  }

  protected setupRoutes(): void {
    this.previousQuestionPage = 'pensions';
    this.skipToQuestionPage = 'staff-benefit-holiday-leave';
    this.nextQuestionPage = this.skipToQuestionPage;
  }

  protected setupForm(): void {
    this.form = this.formBuilder.group(
      {
        staffOptOutOfWorkplacePension: null,
      },
      { updateOn: 'submit' },
    );
  }

  private prefill(): void {
    const staffOptOutOfWorkplacePension = this.establishment.staffOptOutOfWorkplacePension;
    if (staffOptOutOfWorkplacePension) {
      this.form.patchValue({
        staffOptOutOfWorkplacePension,
      });
    }
  }

  protected generateUpdateProps(): any {
    const { staffOptOutOfWorkplacePension } = this.form.value;

    return staffOptOutOfWorkplacePension ?? null;
  }

  protected updateEstablishment(props: string | null): void {
    if (!props) {
      return;
    }

    const updateData = {
      property: 'staffOptOutOfWorkplacePension',
      value: props,
    };

    this.subscriptions.add(
      this.establishmentService.updateSingleEstablishmentField(this.establishment.uid, updateData).subscribe(
        (data) => this._onSuccess(data.data),
        (error) => this.onError(error),
      ),
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
}
