import { Component } from '@angular/core';
import { QuestionComponent } from '../question/question.component';
import { UntypedFormBuilder } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { BackLinkService } from '@core/services/backLink.service';
import { ErrorSummaryService } from '@core/services/error-summary.service';
import { WorkerService } from '@core/services/worker.service';
import { EstablishmentService } from '@core/services/establishment.service';

@Component({
  selector: 'app-who-carry-out-delegated-healthcare-activities',
  templateUrl: './who-carry-out-delegated-healthcare-activities.component.html',
})
export class WhoCarryOutDelegatedHealthcareActivitiesComponent extends QuestionComponent {
  public section = 'Employment details';
  public heading = 'Who carries out delegated healthcare activities?';

  public answersAvailable = [
    { tag: 'Yes', value: 'Yes' },
    { tag: 'No', value: 'No' },
    { tag: 'I do not know', value: `Don't know` },
  ];

  constructor(
    protected formBuilder: UntypedFormBuilder,
    protected router: Router,
    protected route: ActivatedRoute,
    protected backLinkService: BackLinkService,
    protected errorSummaryService: ErrorSummaryService,
    protected workerService: WorkerService,
    protected establishmentService: EstablishmentService,
  ) {
    super(formBuilder, router, route, backLinkService, errorSummaryService, workerService, establishmentService);
    this.form = this.formBuilder.group({
      whoCarryOutDelegatedHealthcareActivities: null,
    });
  }

  init(): void {}
}
