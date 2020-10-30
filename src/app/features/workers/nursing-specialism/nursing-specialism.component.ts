import { Component } from '@angular/core';
import { FormArray, FormBuilder } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { BackService } from '@core/services/back.service';
import { ErrorSummaryService } from '@core/services/error-summary.service';
import { WorkerService } from '@core/services/worker.service';

import { QuestionComponent } from '../question/question.component';

@Component({
  selector: 'app-nursing-specialism',
  templateUrl: './nursing-specialism.component.html',
})
export class NursingSpecialismComponent extends QuestionComponent {
  public nursingSpecialisms = [
    'Older people (including dementia, elderly care and end of life care)',
    'Adults',
    'Learning Disability',
    'Mental Health',
    'Community Care',
    'Others',
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

    this.form = formBuilder.group({
      hasNurseSpecialism: null,
      selectedNurseSpecialisms: formBuilder.array([]),
    });
  }

  get selectedNurseSpecialismsArray() {
    return this.form.get('selectedNurseSpecialisms') as FormArray;
  }

  init() {
    if (!this.workerService.hasJobRole(this.worker, 23)) {
      this.router.navigate(this.getRoutePath('other-job-roles'), { replaceUrl: true });
    }

    this.next = this.workerService.hasJobRole(this.worker, 27)
      ? this.getRoutePath('mental-health-professional')
      : this.getRoutePath('flu-jab');
    this.previous = this.getRoutePath('nursing-category');

    let checkedSpecialisms = [];
    if (this.worker.nurseSpecialisms) {
      this.form.patchValue({
        hasNurseSpecialism: this.worker.nurseSpecialisms.value,
      });

      checkedSpecialisms = this.worker.nurseSpecialisms.specialisms
        ? this.worker.nurseSpecialisms.specialisms
            .filter((specialism) => this.nursingSpecialisms.includes(specialism.specialism))
            .map((specialism) => specialism.specialism)
        : [];
    }

    for (const specialism of this.nursingSpecialisms) {
      const checked = checkedSpecialisms.includes(specialism);
      this.selectedNurseSpecialismsArray.push(
        this.formBuilder.control({
          specialism,
          checked,
        }),
      );
    }
  }

  generateUpdateProps() {
    const { hasNurseSpecialism, selectedNurseSpecialisms } = this.form.value;

    return {
      nurseSpecialisms: {
        value: hasNurseSpecialism,
        specialisms: selectedNurseSpecialisms
          .filter((j) => j.checked)
          .map((j) => {
            return { specialism: j.specialism };
          }),
      },
    };
  }
}
