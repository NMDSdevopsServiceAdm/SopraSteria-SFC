import { UntypedFormBuilder } from '@angular/forms';
import { QuestionComponent } from '../question/question.component';
import { ActivatedRoute, Router } from '@angular/router';
import { Component } from '@angular/core';
import { BackLinkService } from '@core/services/backLink.service';
import { ErrorSummaryService } from '@core/services/error-summary.service';
import { EstablishmentService } from '@core/services/establishment.service';
import { WorkerService } from '@core/services/worker.service';
import { CareWorkforcePathwayRoleCategory } from '@core/model/careWorkforcePathwayCategory.model';
import { AlertService } from '@core/services/alert.service';
import { CareWorkforcePathwayService } from '@core/services/care-workforce-pathway.service';
import { FeatureFlagsService } from '@shared/services/feature-flags.service';

@Component({
  selector: 'app-care-workforce-pathway',
  templateUrl: './care-workforce-pathway.component.html',
})
export class CareWorkforcePathwayRoleComponent extends QuestionComponent {
  public section = 'Training and qualifications';
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
    private alertService: AlertService,
    private careWorkforcePathwayService: CareWorkforcePathwayService,
    private featureFlagService: FeatureFlagsService,
  ) {
    super(formBuilder, router, route, backLinkService, errorSummaryService, workerService, establishmentService);

    this.form = this.formBuilder.group({
      careWorkforcePathwayRoleCategory: null,
    });
  }

  async init() {
    this.getCareWorkforcePathwayRoleCategories();

    if (this.worker.careWorkforcePathwayRoleCategory) {
      this.prefill();
    }

    this.cwpQuestionsFlag = await this.featureFlagService.configCatClient.getValueAsync('cwpQuestionsFlag', false);
    this.featureFlagService.cwpQuestionsFlag = this.cwpQuestionsFlag;
    this.next = this.getRoutePath('staff-record-summary');

    this.setupPageWhenCameFromCWPSummaryPage();
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

  onSubmit(): void {
    super.onSubmit();

    if (!this.submitted && this.insideFlow) {
      this.addCompletedStaffFlowAlert();
    }
  }

  addAlert(): void {
    if (this.insideFlow) {
      this.addCompletedStaffFlowAlert();
    }
  }

  addCompletedStaffFlowAlert(): void {
    this.alertService.addAlert({
      type: 'success',
      message: 'Staff record saved',
    });
  }
}
