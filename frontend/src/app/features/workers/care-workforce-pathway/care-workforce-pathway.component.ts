import { UntypedFormBuilder } from '@angular/forms';
import { QuestionComponent } from '../question/question.component';
import { ActivatedRoute, Router } from '@angular/router';
import { Component } from '@angular/core';
import { BackLinkService } from '@core/services/backLink.service';
import { ErrorSummaryService } from '@core/services/error-summary.service';
import { EstablishmentService } from '@core/services/establishment.service';
import { WorkerService } from '@core/services/worker.service';
import { CareWorkforcePathwayCategory } from '@core/model/careWorkforcePathwayCategory.model';
import { AlertService } from '@core/services/alert.service';
import { CareWorkforcePathwayService } from '@core/services/care-workforce-pathway.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-care-workforce-pathway',
  templateUrl: './care-workforce-pathway.component.html',
})
export class CareWorkforcePathwayComponent extends QuestionComponent {
  public section = 'Training and qualifications';
  public careWorkforcePathwayCategories: CareWorkforcePathwayCategory[];

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
      careWorkforcePathway: null,
    });
  }

  init() {
    // this.insideFlow = true;
    this.next = this.getRoutePath('staff-record-summary');
    this.getCareWorkforcePathwayCategories();
    if (this.worker.careWorkforcePathwayRoleCategory) {
      this.prefill();
    }
  }

  prefill() {
    this.form.patchValue({
      careWorkforcePathway: this.worker.careWorkforcePathwayRoleCategory,
    });
  }

  public getCareWorkforcePathwayCategories(): void {
    this.careWorkforcePathwayCategories = this.careWorkforcePathwayService.getCareWorkforcePathwayCategories();
    // this.subscriptions.add(
    //   this.careWorkforcePathwayService.getCareWorkforcePathwayCategories().subscribe(
    //     (categories) => {
    //       if (categories) {
    //         this.careWorkforcePathwayCategories = categories;
    //       }
    //     },
    //     (error) => {
    //       console.error(error.error);
    //     },
    //   ),
    // );
  }

  generateUpdateProps(): unknown {
    const { careWorkforcePathway } = this.form.value;
    if (!careWorkforcePathway) {
      return null;
    }
    return {
      careWorkforcePathway,
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
