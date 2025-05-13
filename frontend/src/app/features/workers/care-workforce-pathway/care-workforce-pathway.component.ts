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

@Component({
  selector: 'app-care-workforce-pathway',
  templateUrl: './care-workforce-pathway.component.html',
})
export class CareWorkforcePathwayComponent extends QuestionComponent {
  public section = 'Training and qualifications';
  public careWorkforcePathwayCategories: CareWorkforcePathwayRoleCategory[];

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
  ) {
    super(formBuilder, router, route, backLinkService, errorSummaryService, workerService, establishmentService);

    this.form = this.formBuilder.group({
      careWorkforcePathwayRoleCategory: null,
    });
  }

  init() {
    // this.insideFlow = true;
    this.next = this.getRoutePath('staff-record-summary');
    this.getCareWorkforcePathwayRoleCategories();

    if (this.worker.careWorkforcePathwayRoleCategory) {
      this.prefill();
    }
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
