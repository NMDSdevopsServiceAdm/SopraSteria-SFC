import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormGroup } from '@angular/forms';
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
  public formInvalid: boolean;
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
    this.getWorkers();
    this.setBackLink();
    this.setupFormErrorsMap();
  }

  ngAfterViewInit() {
    this.errorSummaryService.formEl$.next(this.formEl);
  }

  get selectStaff(): FormArray {
    return this.form.get('selectStaff') as FormArray;
  }

  private setupForm = async () => {
    const formControls = await Promise.all(
      this.workers.map(async (worker) => {
        const checked = this.trainingService.selectedStaff?.includes(worker.uid) ? true : false;

        const formControl = this.formBuilder.control({
          name: worker.nameOrId,
          workerUid: worker.uid,
          checked,
        });

        return formControl;
      }),
    );

    this.form = this.formBuilder.group({
      selectAll: null,
      selectStaff: this.formBuilder.array(formControls, this.minLengthArray(1)),
    });

    // this.updateSelectAllCheckbox();
    console.log(this.form);
  };

  minLengthArray(min: number) {
    return (c: AbstractControl): { [key: string]: any } => {
      if (c.value.length >= min) return null;

      return { minLengthArray: { valid: false } };
    };
  }

  private setupFormErrorsMap(): void {
    this.formErrorsMap = [
      {
        item: 'selectStaff',
        type: [
          {
            name: 'required',
            message: 'Select the staff who have completed the training',
          },
        ],
      },
    ];
  }

  private oneCheckboxRequired(form: FormGroup) {
    console.log(form.get('selectStaff').value);
    if (form.get('selectStaff').value.length === 0) {
      form.controls.selectStaff.setErrors({
        oneCheckboxRequired: true,
      });
    } else {
      form.controls.selectStaff.setErrors(null);
    }
  }

  public setBackLink(): void {
    this.backService.setBackLink({ url: ['/dashboard'], fragment: 'training-and-qualifications' });
  }

  public updateState(): void {
    this.updateSelectAllCheckbox();
    const selectedStaff = this.selectStaff.controls
      .filter((control) => control.value.checked)
      .map((control) => {
        return control.value.workerUid;
      });

    this.trainingService.updateSelectedStaff(selectedStaff);
  }

  public selectWorker(control) {
    control.value.checked = !control.value.checked;
    this.updateState();
  }

  public selectAllWorkers(): void {
    if (this.form.value.selectAll) {
      this.selectStaff.controls.forEach((control) => {
        return (control.value.checked = true);
      });
    } else {
      this.selectStaff.controls.forEach((control) => {
        return (control.value.checked = false);
      });
    }
    this.updateState();
  }

  private updateSelectAllCheckbox(): void {
    const allWorkersSelected = this.selectStaff.controls.every((control) => control.value.checked === true);
    if (allWorkersSelected) {
      this.form.patchValue({
        selectAll: true,
      });
    } else {
      this.form.patchValue({
        selectAll: false,
      });
    }
  }

  public onSubmit(): void {
    this.checkIfFormInvalid();
    this.submitted = true;
    this.errorSummaryService.syncFormErrorsEvent.next(true);

    console.log(this.form.valid);

    if (this.formInvalid) {
      this.errorSummaryService.scrollToErrorSummary();
      console.log('not valid');
      // this.router.navigate(['add-multiple-training', 'training-details']);
    } else {
      console.log('valid');
    }
  }

  private getWorkers(): void {
    this.subscriptions.add(
      this.workerService.getAllWorkers(this.workplace.uid).subscribe((workers) => {
        this.workers = workers.sort((a, b) => a.nameOrId.localeCompare(b.nameOrId));
        this.setupForm();
      }),
    );
  }

  public getFirstErrorMessage(item: string): string {
    const errorType = Object.keys(this.form.get(item).errors)[0];
    return this.errorSummaryService.getFormErrorMessage(item, errorType, this.formErrorsMap);
  }

  private checkIfFormInvalid(): void {
    // this.formInvalid = this.selectStaff.controls.every((control) => control.value.checked === false);
  }
}
