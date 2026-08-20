import { Component } from '@angular/core';
import { UntypedFormBuilder } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { BackLinkService } from '@core/services/backLink.service';
import { ErrorSummaryService } from '@core/services/error-summary.service';
import { EstablishmentService } from '@core/services/establishment.service';
import { WorkerService } from '@core/services/worker.service';

import { QuestionComponent } from '../question/question.component';
import { NurseFieldOfPractice } from '@core/model/nurse-field-of-practice.model';
import { WorkerFlowSections } from '@core/utils/progress-bar-util';

@Component({
  selector: 'app-nursing-category',
  templateUrl: './nursing-category.component.html',
  standalone: false,
})
export class NursingCategoryComponent extends QuestionComponent {
  public allNurseFieldsOfPractice: NurseFieldOfPractice[];
  public section: WorkerFlowSections = WorkerFlowSections.EMPLOYMENT_DETAILS;
  public sectionHeading: string;

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
    this.allNurseFieldsOfPractice = this.route.snapshot.data?.allNurseFieldsOfPractice ?? [];
    this.setupForm();
  }

  init() {
    this.sectionHeading = this.section;

    this.setupForm();

    if (this.worker.nurseFieldOfPractice) {
      this.prefill();
    }

    this.next = this.insideFlow ? this.getRoutePath('recruited-from') : this.getSummaryRoute();
  }

  private get chosenFields(): Array<NurseFieldOfPractice> {
    const { nurseFieldOfPractice } = this.form.value;

    return this.allNurseFieldsOfPractice.filter((_field, index) => nurseFieldOfPractice[index]);
  }

  private setupForm(): void {
    const choices = this.allNurseFieldsOfPractice.map(() => null);
    this.form = this.formBuilder.group({
      nurseFieldOfPractice: this.formBuilder.array(choices),
    });
  }

  private getSummaryRoute(): string[] {
    const summaryUrl = this.determineBaseRoute();
    return summaryUrl;
  }

  private prefill(): void {
    if (!this.worker.nurseFieldOfPractice?.length) {
      this.return;
    }
    const currentValues = new Set(this.worker.nurseFieldOfPractice?.map((field) => field.id));

    const checkboxValues = this.allNurseFieldsOfPractice.map((field) => currentValues.has(field.id));

    this.form.patchValue({
      nurseFieldOfPractice: checkboxValues,
    });
  }

  generateUpdateProps() {
    const formHasChanged = this.form.dirty;

    if (!formHasChanged) {
      return null;
    }

    return { nurseFieldOfPractice: this.chosenFields };
  }
}
