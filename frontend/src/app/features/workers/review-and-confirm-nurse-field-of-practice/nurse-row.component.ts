import { Component, computed, input, OnInit, Signal, signal, WritableSignal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { NurseFieldOfPractice, RegisteredNurse } from '@core/model/nurse-field-of-practice.model';
import { AccordionToggleButtonComponent } from './accordion-toggle-button/accordion-toggle-button.component';
import { toSignal } from '@angular/core/rxjs-interop';

const ButtonTextAdd = {
  whenOpen: 'Hide details',
  whenClose: 'Add details',
};

const ButtonTextChange = {
  whenOpen: 'Hide details',
  whenClose: 'Change details',
};

@Component({
  selector: 'app-nurse-row',
  imports: [AccordionToggleButtonComponent, ReactiveFormsModule],
  templateUrl: './nurse-row.component.html',
  styleUrl: './review-and-confirm-nurse-field-of-practice.component.scss',
})
export class NurseRow implements OnInit {
  public readonly worker = input.required<RegisteredNurse>();
  public readonly workerIndex = input.required<number>();

  public readonly allNurseFieldsOfPractice: NurseFieldOfPractice[] = this.route.snapshot.data.allNurseFieldsOfPractice;
  public form: FormGroup = this.formBuilder.group({
    nurseFieldOfPractice: this.formBuilder.array(this.allNurseFieldsOfPractice.map(() => null)),
  });
  private formValue = toSignal<Array<boolean>>(this.form.get('nurseFieldOfPractice')!.valueChanges);

  public isExpanded = false;

  public currentChoices = computed(() => {
    const formValue = this.formValue();
    return this.allNurseFieldsOfPractice.filter((_field, index) => formValue?.[index]);
  });
  public buttonText = computed(() => {
    const atLeastOneChosen = this.currentChoices()?.length > 0;
    return atLeastOneChosen ? ButtonTextChange : ButtonTextAdd;
  });

  constructor(
    protected route: ActivatedRoute,
    protected formBuilder: FormBuilder,
  ) {}

  ngOnInit(): void {
    this.prefill();
  }

  public prefill() {
    const previousAnswer = this.worker().nurseFieldOfPractice;
    this.form.patchValue({ nurseFieldOfPractice: this.answerToFormValues(previousAnswer) });
  }

  public answerToFormValues(chosenFields: Array<NurseFieldOfPractice>): Array<boolean> {
    const chosenFieldIds = new Set(chosenFields.map((field) => field.id));
    return this.allNurseFieldsOfPractice.map((field) => chosenFieldIds.has(field.id));
  }

  public formValuesToAnswer(formValues: Array<boolean>): Array<NurseFieldOfPractice> {
    return this.allNurseFieldsOfPractice.filter((_field, index) => formValues[index]);
  }

  public handleToggle(state: boolean): void {
    this.isExpanded = state;
  }
}
