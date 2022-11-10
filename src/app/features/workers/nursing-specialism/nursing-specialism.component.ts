import { Component } from '@angular/core';
import { FormArray, FormBuilder } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { BackService } from '@core/services/back.service';
import { BackLinkService } from '@core/services/backLink.service';
import { ErrorSummaryService } from '@core/services/error-summary.service';
import { EstablishmentService } from '@core/services/establishment.service';
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
    protected backLinkService: BackLinkService,
    protected errorSummaryService: ErrorSummaryService,
    protected workerService: WorkerService,
    protected establishmentService: EstablishmentService,
  ) {
    super(
      formBuilder,
      router,
      route,
      backService,
      backLinkService,
      errorSummaryService,
      workerService,
      establishmentService,
    );

    this.form = formBuilder.group({
      hasNurseSpecialism: null,
      selectedNurseSpecialisms: formBuilder.array([]),
    });
  }

  get selectedNurseSpecialismsArray() {
    return this.form.get('selectedNurseSpecialisms') as FormArray;
  }

  init() {
    this.registeredNurseFlow = this.route.parent.snapshot.url[0].path === 'registered-nurse-details';
    this.setUpPageRouting();

    let checkedSpecialisms = [];
    if (this.worker.nurseSpecialisms) {
      this.prefill();

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

  private prefill(): void {
    this.form.patchValue({
      hasNurseSpecialism: this.worker.nurseSpecialisms.value,
    });
  }

  private setUpPageRouting() {
    if (this.insideFlow && !this.registeredNurseFlow) {
      this.previous = this.getRoutePath('nursing-category');
      this.next = this.workerService.hasJobRole(this.worker, 27)
        ? this.getRoutePath('mental-health-professional')
        : this.getRoutePath('recruited-from');
    } else if (this.registeredNurseFlow) {
      this.previous = [
        '/workplace',
        this.workplace.uid,
        'staff-record',
        this.worker.uid,
        'staff-record-summary',
        'registered-nurse-details',
        'nursing-category',
      ];
      this.next = this.getRoutePath('');
      this.returnUrl = this.getRoutePath('');
    } else {
      this.previous = this.getRoutePath('');
      this.next = this.getRoutePath('');
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
