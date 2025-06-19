import { Component } from '@angular/core';
import { UntypedFormBuilder } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { CareWorkforcePathwayRoleCategory } from '@core/model/careWorkforcePathwayCategory.model';
import { AlertService } from '@core/services/alert.service';
import { BackLinkService } from '@core/services/backLink.service';
import { CareWorkforcePathwayService } from '@core/services/care-workforce-pathway.service';
import { ErrorSummaryService } from '@core/services/error-summary.service';
import { EstablishmentService } from '@core/services/establishment.service';
import { WorkerService } from '@core/services/worker.service';
import { FeatureFlagsService } from '@shared/services/feature-flags.service';

import { FinalQuestionComponent } from '../final-question/final-question.component';

@Component({
  selector: 'app-care-workforce-pathway',
  templateUrl: './care-workforce-pathway.component.html',
})
export class CareWorkforcePathwayRoleComponent extends FinalQuestionComponent {
  public section = 'Training and qualifications';
  public heading = 'Where are they currently on the care workforce pathway?';
  public careWorkforcePathwayCategories: CareWorkforcePathwayRoleCategory[];
  public revealTitle = "What's the care workforce pathway?";
  public cwpQuestionsFlag: boolean;
  public cameFromCWPSummaryPage: boolean;

  constructor(
    protected formBuilder: UntypedFormBuilder,
    protected router: Router,
    protected route: ActivatedRoute,
    protected backLinkService: BackLinkService,
    protected errorSummaryService: ErrorSummaryService,
    protected workerService: WorkerService,
    protected establishmentService: EstablishmentService,
    protected alertService: AlertService,
    private careWorkforcePathwayService: CareWorkforcePathwayService,
    private featureFlagService: FeatureFlagsService,
  ) {
    super(
      formBuilder,
      router,
      route,
      backLinkService,
      errorSummaryService,
      workerService,
      establishmentService,
      alertService,
    );

    this.form = this.formBuilder.group({
      careWorkforcePathwayRoleCategory: null,
    });
  }

  async init() {
    this.getCareWorkforcePathwayRoleCategories();

    if (this.worker.careWorkforcePathwayRoleCategory) {
      this.prefill();
    }

    this.setupPageWhenCameFromCWPSummaryPage();

    this.cwpQuestionsFlag = await this.featureFlagService.configCatClient.getValueAsync('cwpQuestions', false);
    this.featureFlagService.cwpQuestionsFlag = this.cwpQuestionsFlag;
    this.next = this.getRoutePath('staff-record-summary');
  }

  prefill() {
    this.form.patchValue({
      careWorkforcePathwayRoleCategory: this.worker.careWorkforcePathwayRoleCategory.roleCategoryId,
    });
  }

  public getCareWorkforcePathwayRoleCategories(): void {
    this.subscriptions.add(
      this.careWorkforcePathwayService.getCareWorkforcePathwayRoleCategories().subscribe(
        (categories) => {
          if (categories) {
            this.careWorkforcePathwayCategories = categories;
          }
        },
        (error) => {
          console.error(error.error);
        },
      ),
    );
  }

  private setupPageWhenCameFromCWPSummaryPage(): void {
    this.cameFromCWPSummaryPage = Boolean(
      this.return?.url?.some((urlPart) => urlPart?.includes('care-workforce-pathway-workers-summary')),
    );

    if (!this.cameFromCWPSummaryPage) {
      return;
    }

    this.heading = 'Where are your staff on the care workforce pathway?';
    this.returnUrl = this.return.url;
  }

  generateUpdateProps() {
    const { careWorkforcePathwayRoleCategory } = this.form.value;
    if (!careWorkforcePathwayRoleCategory) {
      return null;
    }
    return {
      careWorkforcePathwayRoleCategory: { roleCategoryId: parseInt(careWorkforcePathwayRoleCategory, 10) },
    };
  }

  addAlert(): void {
    if (!this.insideFlow && this.cameFromCWPSummaryPage) {
      this.addRoleCategorySavedAlert();
    }

    super.addAlert();
  }

  private addRoleCategorySavedAlert(): void {
    this.alertService.addAlert({
      type: 'success',
      message: 'Role category saved',
    });
  }

  _onSuccess(data: any) {
    this.workerService.setState({ ...this.worker, ...data });
    this.onSuccess();
    this.navigate().then(() => this.addAlert());
  }

  protected formValueIsEmpty(): boolean {
    const { careWorkforcePathwayRoleCategory } = this.form.value;
    return careWorkforcePathwayRoleCategory === null;
  }
}
