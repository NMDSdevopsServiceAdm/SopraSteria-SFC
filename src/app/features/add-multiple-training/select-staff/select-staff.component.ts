import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormArray, FormBuilder, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { ErrorDetails } from '@core/model/errorSummary.model';
import { Establishment } from '@core/model/establishment.model';
import { Worker } from '@core/model/worker.model';
import { BackService } from '@core/services/back.service';
import { ErrorSummaryService } from '@core/services/error-summary.service';
import { EstablishmentService } from '@core/services/establishment.service';
import { TrainingService } from '@core/services/training.service';
import { WorkerService } from '@core/services/worker.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-select-staff',
  templateUrl: './select-staff.component.html',
})
export class SelectStaffComponent implements OnInit {
  @ViewChild('formEl') formEl: ElementRef;
  public workers: Array<Worker>;
  public form: FormGroup;
  public submitted: boolean;
  private formErrorsMap: Array<ErrorDetails>;
  private workplace: Establishment;
  private subscriptions: Subscription = new Subscription();

  constructor(
    public backService: BackService,
    private workerService: WorkerService,
    private establishmentService: EstablishmentService,
    private formBuilder: FormBuilder,
    public trainingService: TrainingService,
    private router: Router,
    private errorSummaryService: ErrorSummaryService,
  ) {}

  ngOnInit(): void {
    this.workplace = this.establishmentService.primaryWorkplace;
    this.setupForm();
    this.setupFormErrorsMap();
    this.getWorkers();
    this.setBackLink();
  }

  ngAfterViewInit() {
    this.errorSummaryService.formEl$.next(this.formEl);
  }

  get selectStaff(): FormArray {
    return this.form.get('selectStaff') as FormArray;
  }

  private setupForm = async () => {
    this.form = this.formBuilder.group(
      {
        selectAll: null,
        selectStaff: this.formBuilder.array([]),
      },
      {
        validator: this.oneCheckboxRequired,
      },
    );
  };

  private updateForm(): void {
    this.workers.map((worker) => {
      const checked = this.trainingService.selectedStaff?.includes(worker.uid) ? true : false;

      const formControl = this.formBuilder.control({
        name: worker.nameOrId,
        workerUid: worker.uid,
        checked,
      });

      this.selectStaff.push(formControl);
    });

    this.updateSelectAllCheckbox();
  }

  private oneCheckboxRequired(form: FormGroup): void {
    if (form?.value?.selectStaff?.every((staff) => staff.checked === false)) {
      form.controls.selectStaff.setErrors({
        oneCheckboxRequired: true,
      });
    } else {
      form.controls.selectStaff.setErrors(null);
    }
  }

  private setupFormErrorsMap(): void {
    this.formErrorsMap = [
      {
        item: 'selectStaff',
        type: [
          {
            name: 'oneCheckboxRequired',
            message: 'Select the staff who have completed the training',
          },
        ],
      },
    ];
  }

  public setBackLink(): void {
    this.backService.setBackLink({ url: ['/dashboard'], fragment: 'training-and-qualifications' });
  }

  private updateSelectedStaff(): void {
    const selectedStaff = this.selectStaff.controls
      .filter((control) => control.value.checked)
      .map((control) => {
        return control.value.workerUid;
      });

    this.trainingService.updateSelectedStaff(selectedStaff);
  }

  public selectWorker(control) {
    control.value.checked = !control.value.checked;
    this.updateSelectAllCheckbox();
  }

  public selectAllWorkers(): void {
    const isChecked = this.form.value.selectAll ? true : false;
    this.selectStaff.controls.forEach((control) => {
      return (control.value.checked = isChecked);
    });
  }

  private updateSelectAllCheckbox(): void {
    const allWorkersSelected = this.selectStaff.controls.every((control) => control.value.checked === true);
    const selectAllChecked = allWorkersSelected ? true : false;
    this.form.patchValue({
      selectAll: selectAllChecked,
    });
  }

  public onSubmit(): void {
    this.submitted = true;
    this.errorSummaryService.syncFormErrorsEvent.next(true);

    if (this.form.valid) {
      this.updateSelectedStaff();
      this.router.navigate(['add-multiple-training', 'training-details']);
    } else {
      this.errorSummaryService.scrollToErrorSummary();
    }
  }

  private getWorkers(): void {
    this.subscriptions.add(
      this.workerService.getAllWorkers(this.workplace.uid).subscribe((workers) => {
        this.workers = workers.sort((a, b) => a.nameOrId.localeCompare(b.nameOrId));
        this.updateForm();
      }),
    );
  }

  public getFirstErrorMessage(item: string): string {
    const errorType = Object.keys(this.form.get(item).errors)[0];
    return this.errorSummaryService.getFormErrorMessage(item, errorType, this.formErrorsMap);
  }
}
