import { Directive } from '@angular/core';
import { UntypedFormBuilder } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { BackLinkService } from '@core/services/backLink.service';
import { ErrorSummaryService } from '@core/services/error-summary.service';
import { EstablishmentService } from '@core/services/establishment.service';
import { WorkerService } from '@core/services/worker.service';
import { AlertService } from '../../../core/services/alert.service';
import { QuestionComponent } from '../question/question.component';

@Directive()
export class FinalQuestionComponent extends QuestionComponent {
  constructor(
    protected formBuilder: UntypedFormBuilder,
    protected router: Router,
    protected route: ActivatedRoute,
    protected backLinkService: BackLinkService,
    protected errorSummaryService: ErrorSummaryService,
    protected workerService: WorkerService,
    protected establishmentService: EstablishmentService,
    protected alertService: AlertService,
  ) {
    super(formBuilder, router, route, backLinkService, errorSummaryService, workerService, establishmentService);
  }

  onSubmit(): void {
    super.onSubmit();
    this.addAlertIfStaffRecordChanged();
  }

  protected addAlert(): void {
    if (this.insideFlow) {
      this.addCompletedStaffFlowAlert();
    }
  }

  protected formValueIsEmpty(): boolean {
    throw new Error('Should be implemented at child component');
  }

  private addAlertIfStaffRecordChanged() {
    if (!this.insideFlow) {
      return;
    }

    const skippedThisQuestion = !this.submitted;

    const thisQuestionNotAnswered = skippedThisQuestion || this.formValueIsEmpty();
    const allOtherQuestionsNotAnswered = !this.workerService.hasAnsweredNonMandatoryQuestion();

    if (thisQuestionNotAnswered && allOtherQuestionsNotAnswered) {
      return;
    }

    // at least one question was anwsered before
    this.addCompletedStaffFlowAlert();
  }

  private addCompletedStaffFlowAlert(): void {
    this.alertService.addAlert({
      type: 'success',
      message: 'Staff record details saved',
    });
  }
}
