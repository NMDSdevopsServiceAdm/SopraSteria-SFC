import { Component } from '@angular/core';
import { UntypedFormBuilder } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Contracts } from '@core/model/contracts.enum';
import { BackLinkService } from '@core/services/backLink.service';
import { DelegatedHealthcareActivitiesService } from '@core/services/delegated-healthcare-activities.service';
import { ErrorSummaryService } from '@core/services/error-summary.service';
import { EstablishmentService } from '@core/services/establishment.service';
import { WorkerService } from '@core/services/worker.service';

import { QuestionComponent } from '../question/question.component';

@Component({
  selector: 'app-carry-out-delegated-healthcare-activities',
  templateUrl: './carry-out-delegated-healthcare-activities.component.html',
})
export class CarryOutDelegatedHealthcareActivitiesComponent extends QuestionComponent {
  public section = 'Employment details';
  public heading = 'Do they carry out delegated healthcare activities?';
  public options = [
    { label: 'Yes', value: 'Yes' },
    { label: 'No', value: 'No' },
    { label: 'I do not know', value: `Don't know` },
  ];
  public dhaDefinition: string;

  constructor(
    protected formBuilder: UntypedFormBuilder,
    protected router: Router,
    protected route: ActivatedRoute,
    protected backLinkService: BackLinkService,
    protected errorSummaryService: ErrorSummaryService,
    protected workerService: WorkerService,
    protected establishmentService: EstablishmentService,
    private delegatedHealthcareActivitiesService: DelegatedHealthcareActivitiesService,
  ) {
    super(formBuilder, router, route, backLinkService, errorSummaryService, workerService, establishmentService);

    this.form = this.formBuilder.group({
      carryOutDelegatedHealthcareActivities: null,
    });
  }

  init(): void {
    this.dhaDefinition = this.delegatedHealthcareActivitiesService.dhaDefinition;
    this.prefill();
    this.next = this.determineConditionalRouting();
  }

  private prefill(): void {
    const previousAnswer = this.worker?.carryOutDelegatedHealthcareActivities;
    if (previousAnswer) {
      this.form.patchValue({
        carryOutDelegatedHealthcareActivities: previousAnswer,
      });
    }
  }

  private determineConditionalRouting(): string[] {
    return [Contracts.Permanent, Contracts.Temporary].includes(this.worker.contract)
      ? this.getRoutePath('days-of-sickness')
      : this.getRoutePath('contract-with-zero-hours');
  }

  generateUpdateProps() {
    const { carryOutDelegatedHealthcareActivities } = this.form.value;
    if (!carryOutDelegatedHealthcareActivities) {
      return null;
    }

    return {
      carryOutDelegatedHealthcareActivities,
    };
  }
}
