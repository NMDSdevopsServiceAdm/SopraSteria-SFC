import { Component } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { BackLinkService } from '@core/services/backLink.service';
import { ErrorSummaryService } from '@core/services/error-summary.service';
import { EstablishmentService } from '@core/services/establishment.service';
import { WorkerService } from '@core/services/worker.service';

import { QuestionComponent } from '../question/question.component';

@Component({
  selector: 'app-nursing-category',
  templateUrl: './nursing-category.component.html',
})
export class NursingCategoryComponent extends QuestionComponent {
  public nursingCategories = [
    'Adult Nurse',
    'Mental Health Nurse',
    'Learning Disabilities Nurse',
    `Children's Nurse`,
    'Enrolled Nurse',
  ];

  constructor(
    protected formBuilder: FormBuilder,
    protected router: Router,
    protected route: ActivatedRoute,
    protected backLinkService: BackLinkService,
    protected errorSummaryService: ErrorSummaryService,
    protected workerService: WorkerService,
    protected establishmentService: EstablishmentService,
  ) {
    super(formBuilder, router, route, backLinkService, errorSummaryService, workerService, establishmentService);

    this.form = this.formBuilder.group({
      nursingCategory: null,
    });
  }

  init() {
    if (this.worker.registeredNurse) {
      this.prefill();
    }

    this.next = this.insideFlow ? this.getRoutePath('nursing-specialism') : this.getSummaryRoute();
  }

  private getSummaryRoute(): string[] {
    const summaryUrl = !this.wdfEditPageFlag ? this.getRoutePath('') : ['wdf', 'staff-record', this.worker.uid];
    summaryUrl.push('nursing-specialism');
    return summaryUrl;
  }

  private prefill(): void {
    this.form.patchValue({
      nursingCategory: this.worker.registeredNurse,
    });
  }

  generateUpdateProps() {
    const { nursingCategory } = this.form.value;

    return nursingCategory
      ? {
          registeredNurse: nursingCategory,
        }
      : null;
  }
}
