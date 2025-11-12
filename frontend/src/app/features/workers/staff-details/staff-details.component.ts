import { Component, OnDestroy, OnInit } from '@angular/core';
import { UntypedFormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Contracts } from '@core/model/contracts.enum';
import { Job } from '@core/model/job.model';
import { AlertService } from '@core/services/alert.service';
import { BackLinkService } from '@core/services/backLink.service';
import { ErrorSummaryService } from '@core/services/error-summary.service';
import { EstablishmentService } from '@core/services/establishment.service';
import { WorkerService } from '@core/services/worker.service';

import { QuestionComponent } from '../question/question.component';

@Component({
    selector: 'app-staff-details',
    templateUrl: './staff-details.component.html',
    standalone: false
})
export class StaffDetailsComponent extends QuestionComponent implements OnInit, OnDestroy {
  public contractsAvailable = [
    { value: Contracts.Permanent, tag: 'Permanent' },
    { value: Contracts.Temporary, tag: 'Temporary' },
    { value: Contracts.Pool_Bank, tag: 'Pool, Bank' },
    { value: Contracts.Agency, tag: 'Agency' },
    { value: Contracts.Other, tag: 'Other' },
  ];
  public jobsAvailable: Job[] = [];
  public showInputTextforOtherRole: boolean;
  public canExit = true;
  public editFlow: boolean;
  public inMandatoryDetailsFlow: boolean;
  private isAddingNewWorker: boolean;

  constructor(
    protected formBuilder: UntypedFormBuilder,
    protected router: Router,
    protected route: ActivatedRoute,
    protected backLinkService: BackLinkService,
    protected errorSummaryService: ErrorSummaryService,
    public workerService: WorkerService,
    protected establishmentService: EstablishmentService,
    protected alertService: AlertService,
  ) {
    super(formBuilder, router, route, backLinkService, errorSummaryService, workerService, establishmentService);
    this.form = this.formBuilder.group(
      {
        nameOrId: [null, Validators.required],
        contract: [null, Validators.required],
      },
      { updateOn: 'submit' },
    );
  }

  init(): void {
    this.inMandatoryDetailsFlow = this.route.parent.snapshot.url[0].path === 'mandatory-details';
    this.isAddingNewWorker = !this.worker;

    this.prefillFormIfExistingWorkerOrInfoSetInWorkerService();
    this.getReturnPath();
    this.editFlow = this.inMandatoryDetailsFlow || this.wdfEditPageFlag || !this.insideFlow;
  }

  public setupFormErrorsMap(): void {
    this.formErrorsMap = [
      {
        item: 'nameOrId',
        type: [
          {
            name: 'required',
            message: `Enter their name or ID number`,
          },
        ],
      },
      {
        item: 'contract',
        type: [
          {
            name: 'required',
            message: `Select the type of contract they have`,
          },
        ],
      },
    ];
  }

  generateUpdateProps() {
    const { nameOrId, contract } = this.form.controls;

    return {
      nameOrId: nameOrId.value,
      contract: contract.value,
    };
  }

  prefillFormIfExistingWorkerOrInfoSetInWorkerService(): void {
    const worker = this.worker || this.workerService.newWorkerMandatoryInfo;
    if (worker) {
      this.form.patchValue({
        nameOrId: worker.nameOrId,
        contract: worker.contract,
      });
    }
  }

  private getReturnPath() {
    if (this.inMandatoryDetailsFlow) {
      this.returnUrl = this.getRoutePath('mandatory-details');
      return;
    }
  }

  public onSubmit(): void {
    if (!this.submitAction.save) {
      this.workerService.clearNewWorkerMandatoryInfo();
      this.navigate();
      return;
    }

    if (this.isAddingNewWorker) {
      this.submitNewWorkerDetails();
    } else {
      super.onSubmit();
    }
  }

  private submitNewWorkerDetails(): void {
    this.submitted = true;
    this.errorSummaryService.syncFormErrorsEvent.next(true);
    if (!this.form.valid) {
      this.errorSummaryService.scrollToErrorSummary();
      return;
    }
    const { nameOrId, contract } = this.form.controls;

    this.workerService.setNewWorkerMandatoryInfo(nameOrId.value, contract.value);

    this.router.navigate(['main-job-role'], { relativeTo: this.route.parent });
  }

  private determineConditionalRouting(): string[] {
    const nextRoute = this.determineBaseRoute();
    return nextRoute;
  }

  protected onSuccess(): void {
    if (this.editFlow) {
      this.next = this.determineConditionalRouting();
    } else {
      this.next = this.getRoutePath('mandatory-details');
    }
    !this.editFlow && this.workerService.setAddStaffRecordInProgress(true);
  }
}
