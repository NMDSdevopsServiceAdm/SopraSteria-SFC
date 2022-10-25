import { Component } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { BackService } from '@core/services/back.service';
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
    protected backService: BackService,
    protected errorSummaryService: ErrorSummaryService,
    protected workerService: WorkerService,
    protected establishmentService: EstablishmentService,
  ) {
    super(formBuilder, router, route, backService, errorSummaryService, workerService, establishmentService);

    this.form = this.formBuilder.group({
      nursingCategory: null,
    });
  }

  init() {
    this.registeredNurseFlow = this.route.parent.snapshot.url[0].path === 'registered-nurse-details';
    if (this.worker.registeredNurse) {
      this.prefill();
    }

    this.setUpPageRouting();
  }

  private prefill(): void {
    this.form.patchValue({
      nursingCategory: this.worker.registeredNurse,
    });
  }

  private setUpPageRouting(): void {
    if (this.insideFlow && !this.registeredNurseFlow) {
      this.next = this.getRoutePath('nursing-specialism');
      this.previous = this.getRoutePath('main-job-start-date');
    } else if (this.registeredNurseFlow) {
      this.previous = [
        '/workplace',
        this.workplace.uid,
        'staff-record',
        this.worker.uid,
        'staff-record-summary',
        'staff-details',
      ];
      this.next = [
        '/workplace',
        this.workplace.uid,
        'staff-record',
        this.worker.uid,
        'staff-record-summary',
        'registered-nurse-details',
        'nursing-specialism',
      ];
      this.returnUrl = this.getRoutePath('');
    } else {
      this.previous = this.getRoutePath('');
      this.next = this.getRoutePath('');
    }
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
