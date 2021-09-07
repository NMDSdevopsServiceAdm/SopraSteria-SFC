import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup } from '@angular/forms';
import { Establishment } from '@core/model/establishment.model';
import { Worker } from '@core/model/worker.model';
import { BackService } from '@core/services/back.service';
import { EstablishmentService } from '@core/services/establishment.service';
import { TrainingService } from '@core/services/training.service';
import { WorkerService } from '@core/services/worker.service';
import { sortBy } from 'lodash';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-select-staff',
  templateUrl: './select-staff.component.html',
})
export class SelectStaffComponent implements OnInit {
  public workers: Array<Worker>;
  public form: FormGroup;
  private workplace: Establishment;
  private subscriptions: Subscription = new Subscription();

  constructor(
    public backService: BackService,
    private workerService: WorkerService,
    private establishmentService: EstablishmentService,
    private formBuilder: FormBuilder,
    private trainingService: TrainingService,
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

  public onSubmit(): void {
    console.log('submitted');
    // this.updateState();
    // this.router.navigate(this.nextPage.url);
    // this.registrationSurveyService.submitSurvey();
  }

  private getWorkers(): void {
    this.subscriptions.add(
      this.workerService.getAllWorkers(this.workplace.uid).subscribe((workers) => {
        this.workers = sortBy(workers, ['']);
        this.setupForm();
      }),
    );
  }
}
