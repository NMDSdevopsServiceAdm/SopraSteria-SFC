import {
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  Output,
  QueryList,
  ViewChildren,
  AfterViewInit,
} from '@angular/core';
import { UntypedFormArray } from '@angular/forms';
import { StarterLeaverVacancy } from '@core/model/establishment.model';
import lodash from 'lodash';
import { NumberInputWithButtonsComponent } from '../number-input-with-buttons/number-input-with-buttons.component';

@Component({
  selector: 'app-job-role-numbers-table',
  templateUrl: './job-role-numbers-table.component.html',
  styleUrl: './job-role-numbers-table.component.scss',
})
export class JobRoleNumbersTableComponent implements AfterViewInit {
  @ViewChildren('numberInputRef') numberInputs: QueryList<NumberInputWithButtonsComponent>;
  @Input() tableTitle: string;
  @Input() addJobRoleButtonText: string = 'Add job roles';
  @Input() messageWhenNoJobRoleSelected: string = 'No job roles selected';
  @Input() totalNumberDescription: string;

  @Input() jobRoleNumbers: UntypedFormArray;
  @Input() jobRoleErrorMessages: Record<number, string>;
  @Input() selectedJobRoles: Array<StarterLeaverVacancy>;
  @Input() allowRemoveJobRole: boolean = true;
  @Input() submitted: boolean = false;

  @Output() addJobRole = new EventEmitter();
  @Output() removeJobRole = new EventEmitter();

  public minNumberPerJobRole = 1;
  public maxNumberPerJobRole = 999;
  public totalNumber = 0;

  constructor(protected cd: ChangeDetectorRef) {}

  ngAfterViewInit() {
    this.updateTotalNumber();
    this.numberInputs.forEach((input) => input.registerOnChange(() => this.updateTotalNumber()));
    this.numberInputs.changes.subscribe(() => {
      this.updateTotalNumber();
    });
  }

  public handleAddJobRole(): void {
    this.addJobRole.emit();
  }

  public handleRemoveJobRole(index: number): void {
    this.removeJobRole.emit(index);
  }

  private updateTotalNumber(): void {
    const allJobRoleNumbers =
      this.numberInputs?.map((input) => input.currentNumber).filter((number) => !isNaN(number)) ?? [];
    this.totalNumber = lodash.sum(allJobRoleNumbers);
    this.cd.detectChanges();
  }

  public get currentValues(): StarterLeaverVacancy[] {
    return this.selectedJobRoles.map((job, index) => {
      const { jobId, title } = job;
      const currentNumber = this.numberInputs.get(index).currentNumber;
      return {
        jobId,
        title,
        total: isNaN(currentNumber) ? null : currentNumber,
      };
    });
  }
}
