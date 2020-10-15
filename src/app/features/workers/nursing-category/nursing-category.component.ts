import { Component } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { BackService } from '@core/services/back.service';
import { ErrorSummaryService } from '@core/services/error-summary.service';
import { WorkerService } from '@core/services/worker.service';

import { QuestionComponent } from '../question/question.component';

@Component({
  selector: 'app-nursing-category',
  templateUrl: './nursing-category.component.html',
})
export class NursingCategoryComponent extends QuestionComponent {
  public nursingCategories = [
    { value: 'Adult Nurse', text: 'Adult nursing' },
    { value: 'Mental Health Nurse', text: 'Mental health nursing' },
    { value: 'Learning Disabilities Nurse', text: 'Learning disability nursing' },
    { value: `Children's Nurse`, text: `Children's nursing` },
    { value: 'Enrolled Nurse', text: 'Enrolled Nurse' },
  ];

  constructor(
    protected formBuilder: FormBuilder,
    protected router: Router,
    protected route: ActivatedRoute,
    protected backService: BackService,
    protected errorSummaryService: ErrorSummaryService,
    protected workerService: WorkerService,
  ) {
    super(formBuilder, router, route, backService, errorSummaryService, workerService);

    this.form = this.formBuilder.group({
      nursingCategory: null,
    });
  }

  init() {
    if (!this.workerService.hasJobRole(this.worker, 23)) {
      this.router.navigate(this.getRoutePath('other-job-roles'), { replaceUrl: true });
    }

    if (this.worker.registeredNurse) {
      this.form.patchValue({
        nursingCategory: this.worker.registeredNurse,
      });
    }

    this.next = this.getRoutePath('nursing-specialism');
    this.previous = this.getRoutePath('other-job-roles');
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
