import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { Establishment } from '@core/model/establishment.model';
import { Worker } from '@core/model/worker.model';
import { BackService } from '@core/services/back.service';
import { EstablishmentService } from '@core/services/establishment.service';
import { TrainingService } from '@core/services/training.service';
import { WorkerService } from '@core/services/worker.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-select-staff',
  templateUrl: './select-staff.component.html',
})
export class SelectStaffComponent implements OnInit {
  public workers: Array<Worker>;
  public form: FormGroup;
  public allWorkersSelected = false;
  private workplace: Establishment;
  private subscriptions: Subscription = new Subscription();

  constructor(
    public backService: BackService,
    private workerService: WorkerService,
    private establishmentService: EstablishmentService,
    private formBuilder: FormBuilder,
    private trainingService: TrainingService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.workplace = this.establishmentService.primaryWorkplace;
    this.getWorkers();
    this.setBackLink();
  }

  get selectStaff(): FormArray {
    return this.form.get('selectStaff') as FormArray;
  }

  private setupForm = () => {
    this.form = this.formBuilder.group({
      selectAll: null,
      selectStaff: this.formBuilder.array([]),
    });

    this.workers.map((worker) => {
      const checked = this.trainingService.selectedStaff?.includes(worker.uid) ? true : false;

      const formControl = this.formBuilder.control({
        name: worker.nameOrId,
        workerUid: worker.uid,
        checked,
      });
      this.selectStaff.push(formControl);
    });
  };

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
    if (this.allWorkersSelected) {
      this.selectStaff.controls.forEach((control) => {
        return (control.value.checked = false);
      });
    } else {
      this.selectStaff.controls.forEach((control) => {
        return (control.value.checked = true);
      });
    }
    this.allWorkersSelected = !this.allWorkersSelected;
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
    console.log(this.trainingService.selectedStaff);
    this.router.navigate(['add-multiple-training', 'training-details']);
  }

  private getWorkers(): void {
    this.subscriptions.add(
      this.workerService.getAllWorkers(this.workplace.uid).subscribe((workers) => {
        this.workers = workers.sort((a, b) => a.nameOrId.localeCompare(b.nameOrId));
        this.setupForm();
      }),
    );
  }
}
