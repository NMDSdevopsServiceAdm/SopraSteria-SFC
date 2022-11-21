import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ValidationErrors, ValidatorFn } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
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
    protected backLinkService: BackLinkService,
    protected errorSummaryService: ErrorSummaryService,
    protected workerService: WorkerService,
    protected establishmentService: EstablishmentService,
  ) {
    super(formBuilder, router, route, backLinkService, errorSummaryService, workerService, establishmentService);

    this.form = formBuilder.group({
      hasNurseSpecialism: [null, null],
      selectedNurseSpecialisms: [[], null],
    });
  }

  init() {
    this.next = this.getRoutePath('recruited-from');
    this.subscriptions.add(
      this.form.get('hasNurseSpecialism').valueChanges.subscribe((value) => {
        const { selectedNurseSpecialisms } = this.form.controls;
        selectedNurseSpecialisms.clearValidators();
        if (value === 'Yes') {
          selectedNurseSpecialisms.setValidators(this.oneCheckboxRequired());
        }
        selectedNurseSpecialisms.updateValueAndValidity();
      }),
    );

    if (this.worker.nurseSpecialisms) {
      this.prefill();
    }
  }

  private oneCheckboxRequired(): ValidatorFn {
    return (formGroup: FormGroup): ValidationErrors | null => {
      if (formGroup.value.length === 0) {
        return { oneCheckboxRequired: true };
      }
      return null;
    };
  }

  public onCheckBoxClick(target: HTMLInputElement): void {
    const specialism = target.value;
    const selectedNurseSpecialismsControl = this.form.get('selectedNurseSpecialisms');
    const nurseSpecialismsValues = selectedNurseSpecialismsControl.value;

    if (target.checked) {
      nurseSpecialismsValues.push(specialism);
    } else {
      const index = nurseSpecialismsValues.indexOf(specialism);
      nurseSpecialismsValues.splice(index, 1);
    }
    selectedNurseSpecialismsControl.setValue(nurseSpecialismsValues);
  }

  private prefill(): void {
    this.form.patchValue({
      hasNurseSpecialism: this.worker.nurseSpecialisms.value,
      selectedNurseSpecialisms:
        this.worker.nurseSpecialisms.specialisms?.map((specialism) => specialism.specialism) || [],
    });
  }

  generateUpdateProps() {
    const { hasNurseSpecialism, selectedNurseSpecialisms } = this.form.value;

    return {
      nurseSpecialisms: {
        value: hasNurseSpecialism,
        specialisms: selectedNurseSpecialisms.map((specialism) => ({ specialism })),
      },
    };
  }

  setupFormErrorsMap(): void {
    this.formErrorsMap = [
      {
        item: 'selectedNurseSpecialisms',
        type: [
          {
            name: 'oneCheckboxRequired',
            message: 'Select all nursing specialisms they are using in their current role',
          },
        ],
      },
    ];
  }
}
