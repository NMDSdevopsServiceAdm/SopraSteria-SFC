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

    if (this.worker.nurseSpecialisms) {
      if (this.worker.nurseSpecialisms.value === 'Yes') {
        this.form.patchValue({
          hasNurseSpecialism: 'Yes',
        });
      } else if (this.worker.nurseSpecialisms.value === `Don't know`) {
        this.form.patchValue({
          hasNurseSpecialism: `Don't know`,
        });
      } else if (this.worker.nurseSpecialisms.value === `No`) {
        this.form.patchValue({
          hasNurseSpecialism: 'No',
        });
      }
    }

    for (let specialism of this.nursingSpecialisms) {
      const checked =
        this.worker.nurseSpecialisms.specialisms &&
        this.worker.nurseSpecialisms.specialisms.map((s) => s.specialism).includes(specialism);
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
