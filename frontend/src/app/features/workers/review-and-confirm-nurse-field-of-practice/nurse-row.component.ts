import { Component, computed, input, OnInit, signal } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { NurseFieldOfPractice, RegisteredNurse } from '@core/model/nurse-field-of-practice.model';
import {
  AccordionToggleButtonComponent,
  ToggleText,
} from '@shared/components/accordion-toggle-button/accordion-toggle-button.component';

const ButtonTextAdd: ToggleText = {
  whenOpen: 'Hide details',
  whenClose: 'Add details',
};

const ButtonTextChange: ToggleText = {
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

  private setupTextChanges() {
    const checkboxes = this.workerForm().get('nurseFieldOfPractice');
    const initialValues = checkboxes?.value ?? [];
    this.currentChoices.set(this.getNurseFieldsFromCheckboxes(initialValues));

    checkboxes!.valueChanges.subscribe((checkboxValues) => {
      this.currentChoices.set(this.getNurseFieldsFromCheckboxes(checkboxValues));
    });
  }

  private getNurseFieldsFromCheckboxes(checkboxValues: Array<boolean>): Array<NurseFieldOfPractice> {
    return this.allNurseFieldsOfPractice.filter((_field, index) => checkboxValues[index]);
  }

  public handleToggle(isExpanded: boolean): void {
    this.isExpanded = isExpanded;
  }
}
