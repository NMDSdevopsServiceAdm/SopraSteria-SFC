import { Component } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { Router } from '@angular/router';
import { BackService } from '@core/services/back.service';
import { ErrorSummaryService } from '@core/services/error-summary.service';
import { WorkerService } from '@core/services/worker.service';

import { QuestionComponent } from '../question/question.component';

@Component({
  selector: 'app-nursing-specialism',
  templateUrl: './nursing-specialism.component.html',
})
export class NursingSpecialismComponent extends QuestionComponent {
  public nursingSpecialism = [
    'Older people (Including dementia, elderly care and end of life care)',
    'Adults',
    'Learning Disability',
    'Mental Health',
    'Community Care',
    'Others',
    'Not applicable',
    `Don't know`,
  ];

  constructor(
    protected formBuilder: FormBuilder,
    protected router: Router,
    protected backService: BackService,
    protected errorSummaryService: ErrorSummaryService,
    protected workerService: WorkerService
  ) {
    super(formBuilder, router, backService, errorSummaryService, workerService);

    this.form = this.formBuilder.group({
      nurseSpecialism: null,
    });
  }

  init() {
    if (!this.workerService.hasJobRole(this.worker, 23)) {
      this.router.navigate(['/worker', this.worker.uid, 'other-job-roles'], { replaceUrl: true });
    }

    if (this.worker.nurseSpecialism && this.worker.nurseSpecialism.specialism) {
      this.form.patchValue({
        nurseSpecialism: this.worker.nurseSpecialism.specialism,
      });
    }

    this.next = this.workerService.hasJobRole(this.worker, 27)
      ? ['/worker', this.worker.uid, 'mental-health-professional']
      : ['/worker', this.worker.uid, 'national-insurance-number'];
    this.previous = ['/worker', this.worker.uid, 'nursing-category'];
  }

  generateUpdateProps() {
    const { nurseSpecialism } = this.form.value;

    return nurseSpecialism
      ? {
          nurseSpecialism: {
            specialism: nurseSpecialism,
          },
        }
      : null;
  }
}
