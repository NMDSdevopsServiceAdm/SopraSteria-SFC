import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormArray, FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ErrorDetails } from '@core/model/errorSummary.model';
import { Worker } from '@core/model/worker.model';
import { BackService } from '@core/services/back.service';
import { ErrorSummaryService } from '@core/services/error-summary.service';
import { EstablishmentService } from '@core/services/establishment.service';
import { TrainingService } from '@core/services/training.service';

@Component({
  selector: 'app-select-staff',
  templateUrl: './select-staff.component.html',
})
export class SelectStaffComponent implements OnInit {
  @ViewChild('formEl') formEl: ElementRef;
  public workers: Array<Worker>;
  public form: FormGroup;
  public submitted: boolean;
  public primaryWorkplaceUid: string;
  public returnLink: Array<string>;
  public selectAll = false;
  private formErrorsMap: Array<ErrorDetails>;
  private workplaceUid: string;

  constructor(
    public backService: BackService,
    public trainingService: TrainingService,
    private establishmentService: EstablishmentService,
    private formBuilder: FormBuilder,
    private router: Router,
    private errorSummaryService: ErrorSummaryService,
    private route: ActivatedRoute,
  ) {}

  ngOnInit(): void {
    this.workplaceUid = this.route.snapshot.params.establishmentuid;
    this.primaryWorkplaceUid = this.establishmentService.primaryWorkplace.uid;
    this.workers = this.route.snapshot.data.workers.workers.sort((a, b) => a.nameOrId.localeCompare(b.nameOrId));
    this.setupForm();
    this.setupFormErrorsMap();
    this.setReturnLink();
    this.setBackLink();
  }

  ngAfterViewInit(): void {
    this.errorSummaryService.formEl$.next(this.formEl);
  }

  get selectStaff(): FormArray {
    return this.form.get('selectStaff') as FormArray;
  }

  private setupForm = () => {
    const workerFormArray = this.workers.map((worker) => {
      const checked = this.trainingService.selectedStaff?.includes(worker.uid) ? true : false;

      return this.formBuilder.control({
        name: worker.nameOrId,
        workerUid: worker.uid,
        checked,
      });
    });

    this.form = this.formBuilder.group(
      {
        selectStaff: this.formBuilder.array(workerFormArray),
      },
      {
        validator: this.oneCheckboxRequired,
        updateOn: 'submit',
      },
    );

    this.updateSelectAllCheckbox();
  };

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

  public setReturnLink(): void {
    this.returnLink =
      this.workplaceUid === this.primaryWorkplaceUid ? ['/dashboard'] : ['/workplace', this.workplaceUid];
  }

  public setBackLink(): void {
    this.backService.setBackLink({ url: this.returnLink, fragment: 'training-and-qualifications' });
  }

  public selectAllWorkers(isChecked: boolean): void {
    this.selectStaff.controls.forEach((control) => {
      return (control.value.checked = isChecked);
    });
  }

  public selectWorker(control) {
    control.value.checked = !control.value.checked;
    this.updateSelectAllCheckbox();
  }

  public updateSelectAllCheckbox(): void {
    const allWorkersSelected = this.selectStaff.controls.every((control) => control.value.checked === true);
    this.selectAll = allWorkersSelected ? true : false;
  }

  private updateSelectedStaff(): void {
    const selectedStaff = this.selectStaff.controls
      .filter((control) => control.value.checked)
      .map((control) => {
        return control.value.workerUid;
      });

    this.trainingService.updateSelectedStaff(selectedStaff);
  }

  public onSubmit(): void {
    this.oneCheckboxRequired(this.form);
    this.submitted = true;
    this.errorSummaryService.syncFormErrorsEvent.next(true);

    if (this.form.valid) {
      this.updateSelectedStaff();
      this.trainingService.addMultipleTrainingInProgress$.next(true);
      this.router.navigate(['workplace', this.workplaceUid, 'add-multiple-training', 'training-details']);
    } else {
      this.errorSummaryService.scrollToErrorSummary();
    }
  }

  public getFirstErrorMessage(item: string): string {
    const errorType = Object.keys(this.form.get(item).errors)[0];
    return this.errorSummaryService.getFormErrorMessage(item, errorType, this.formErrorsMap);
  }

  public onCancel(): void {
    this.trainingService.resetSelectedStaff();
    this.router.navigate(this.returnLink, { fragment: 'training-and-qualifications' });
  }
}
