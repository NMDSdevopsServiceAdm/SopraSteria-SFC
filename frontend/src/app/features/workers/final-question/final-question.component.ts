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
  protected continueToNextQuestion: boolean = false;

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
    this.handleAddAlertWhenSkippedQuestion();
  }

  public addAlert(): void {
    if (this.insideFlow && !this.continueToNextQuestion) {
      this.addCompletedStaffFlowAlert();
    }
  }

  private handleAddAlertWhenSkippedQuestion(): void {
    if (!this.insideFlow || this.continueToNextQuestion) {
      return;
    }

    const skippedThisQuestion = !this.submitted || this.formValueIsEmpty();

    const hasSavedStaffRecordDetailsBefore = this.workerService.hasAnsweredNonMandatoryQuestion();

    if (skippedThisQuestion && hasSavedStaffRecordDetailsBefore) {
      this.addCompletedStaffFlowAlert();
    }
  }

  protected addCompletedStaffFlowAlert(): void {
    this.alertService.addAlert({
      type: 'success',
      message: 'Staff record details saved',
    });
  }

  protected formValueIsEmpty(): boolean {
    throw new Error('Should be implemented at child component');
  }
}
