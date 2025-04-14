import { Component, Input, QueryList, ViewChildren } from '@angular/core';
import { UntypedFormArray } from '@angular/forms';
import { Leaver, Starter, Vacancy } from '@core/model/establishment.model';
import lodash from 'lodash';
import { NumberInputWithButtonsComponent } from '../number-input-with-buttons/number-input-with-buttons.component';

@Component({
  selector: 'app-job-role-numbers-table',
  templateUrl: './job-role-numbers-table.component.html',
  styleUrl: './job-role-numbers-table.component.scss',
})
export class JobRoleNumbersTableComponent {
  @ViewChildren('numberInputRef') numberInputs: QueryList<NumberInputWithButtonsComponent>;
  @Input() tableTitle: string;
  @Input() addJobRoleButtonText: string = 'Add job roles';
  @Input() messageWhenNoJobRoleSelected: string = 'No job roles selected';
  @Input() totalNumberDescription: string;

  @Input() jobRoleNumbers: UntypedFormArray;
  @Input() jobRoleErrorMessages: Array<string>;
  @Input() selectedJobRoles: Array<Vacancy | Starter | Leaver>;
  @Input() allowRemoveJobRole: false;
  @Input() submitted: boolean = false;

  public minNumberPerJobRole = 1;
  public maxNumberPerJobRole = 999;
  public totalNumber = 0;

  ngOnInit() {
    const inputValues = this.jobRoleNumbers.value as Array<number | null>;
    this.totalNumber = inputValues.reduce((total, current) => (current ? total + current : total), 0);
  }

  ngAfterViewInit() {
    this.numberInputs.forEach((input) => input.registerOnChange(() => this.updateTotalNumber()));
    this.numberInputs.changes.subscribe(() => {
      // this.setupFormErrorsMap(); // rebuild form errors map as job role index changed
      this.updateTotalNumber();
    });

    // this.errorSummaryService.formEl$.next(this.formEl);
  }

  public handleAddJobRole(): void {}

  private updateTotalNumber(): void {
    const allJobRoleNumbers =
      this.numberInputs?.map((input) => input.currentNumber).filter((number) => !isNaN(number)) ?? [];
    this.totalNumber = lodash.sum(allJobRoleNumbers);
  }
}
