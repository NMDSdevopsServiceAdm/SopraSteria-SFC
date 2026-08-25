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
  public worker = input.required<RegisteredNurse>();
  public workerIndex = input.required<number>();

  public allNurseFieldsOfPractice: NurseFieldOfPractice[] = this.route.snapshot.data.allNurseFieldsOfPractice;
  public form: FormGroup = this.formBuilder.group({
    nurseFieldOfPractice: this.formBuilder.array(this.allNurseFieldsOfPractice.map(() => null)),
  });
  private formValue = toSignal(this.form.get('nurseFieldOfPractice')!.valueChanges);

  public isExpanded = signal(false);

  public currentChoices = computed(() => {
    const formValue: Array<boolean> = this.formValue();
    return this.allNurseFieldsOfPractice.filter((_field, index) => formValue[index]);
  });
  public buttonText = computed(() => {
    const formValue: Array<boolean> = this.formValue();
    const atLeastOneTick = formValue?.some((x) => x);
    return atLeastOneTick ? ButtonTextChange : ButtonTextAdd;
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
    const previousAnswerIds = new Set(previousAnswer.map((field) => field.id));
    const choices = this.allNurseFieldsOfPractice.map((field) => previousAnswerIds.has(field.id));
    this.form.patchValue({ nurseFieldOfPractice: choices });
  }

  public handleToggle(state: boolean): void {
    this.isExpanded.set(state);
  }
}
