import { Component, computed, input, OnInit, output, Signal, signal, WritableSignal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { NurseFieldOfPractice, RegisteredNurse } from '@core/model/nurse-field-of-practice.model';
import { AccordionToggleButtonComponent } from './accordion-toggle-button/accordion-toggle-button.component';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';

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
  public outputChoices = output<Record<string, NurseFieldOfPractice[]>>();

  public allNurseFieldsOfPractice: NurseFieldOfPractice[] = this.route.snapshot.data.allNurseFieldsOfPractice;
  public form: FormGroup = this.formBuilder.group({
    nurseFieldOfPractice: this.formBuilder.array(this.allNurseFieldsOfPractice.map(() => null)),
  });

  public isExpanded = false;

  private formValue = toSignal(this.form.valueChanges);
  public currentChoices = computed(() => {
    const checkboxValues = this.formValue()?.nurseFieldOfPractice;
    return this.formValuesToAnswer(checkboxValues);
  });
  public buttonText = computed(() => {
    const atLeastOneChosen = this.currentChoices()?.length > 0;
    return atLeastOneChosen ? ButtonTextChange : ButtonTextAdd;
  });

  constructor(
    private route: ActivatedRoute,
    private formBuilder: FormBuilder,
  ) {}

  ngOnInit(): void {
    this.prefill();
    this.setupOutput();
  }

  private prefill() {
    const previousAnswer = this.worker().nurseFieldOfPractice;
    this.form.patchValue({ nurseFieldOfPractice: this.answerToFormValues(previousAnswer) });
  }

  private setupOutput() {
    const workerUid = this.worker().uid;
    this.form.valueChanges.subscribe(() => {
      this.outputChoices.emit({ [workerUid]: this.currentChoices() });
    });
  }

  private answerToFormValues(chosenFields: Array<NurseFieldOfPractice>): Array<boolean> {
    const chosenFieldIds = new Set(chosenFields.map((field) => field.id));
    return this.allNurseFieldsOfPractice.map((field) => chosenFieldIds.has(field.id));
  }

  private formValuesToAnswer(formValues: Array<boolean>): Array<NurseFieldOfPractice> {
    return this.allNurseFieldsOfPractice.filter((_field, index) => formValues[index]);
  }

  public handleToggle(state: boolean): void {
    this.isExpanded = state;
  }
}
