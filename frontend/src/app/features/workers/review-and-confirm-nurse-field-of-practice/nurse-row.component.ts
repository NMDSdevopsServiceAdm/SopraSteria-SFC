import { Component, computed, input, OnInit, output, signal } from '@angular/core';
import { FormArray, FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { NurseFieldOfPractice, RegisteredNurse } from '@core/model/nurse-field-of-practice.model';
import { AccordionToggleButtonComponent } from './accordion-toggle-button/accordion-toggle-button.component';

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
  public readonly workerForm = input.required<FormGroup>();
  public outputChoices = output<Record<string, NurseFieldOfPractice[]>>();

  public allNurseFieldsOfPractice: NurseFieldOfPractice[] = this.route.snapshot.data.allNurseFieldsOfPractice;

  public isExpanded = false;

  public currentChoices = signal<NurseFieldOfPractice[]>([]);

  public buttonText = computed(() => {
    const atLeastOneChosen = this.currentChoices()?.length > 0;
    return atLeastOneChosen ? ButtonTextChange : ButtonTextAdd;
  });

  constructor(private route: ActivatedRoute) {}

  ngOnInit(): void {
    this.setupTextChanges();
  }

  public get formArray(): FormArray<FormControl<boolean>> {
    const array = this.workerForm().get('nurseFieldOfPractice') as FormArray<FormControl<boolean>>;
    return array;
  }

  private setupTextChanges() {
    const initialFormValues = this.formArray?.value ?? [];
    this.currentChoices.set(this.formValuesToAnswer(initialFormValues));

    this.formArray!.valueChanges.subscribe((newFormValues) => {
      this.currentChoices.set(this.formValuesToAnswer(newFormValues));
    });
  }

  private formValuesToAnswer(formValues: Array<boolean>): Array<NurseFieldOfPractice> {
    return this.allNurseFieldsOfPractice.filter((_field, index) => formValues[index]);
  }

  public handleToggle(state: boolean): void {
    this.isExpanded = state;
  }
}
