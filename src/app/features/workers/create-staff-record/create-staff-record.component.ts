import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Contracts } from '@core/constants/contracts.enum';
import { Job } from '@core/model/job.model';
import { Worker } from '@core/model/worker.model';
import { EstablishmentService } from '@core/services/establishment.service';
import { JobService } from '@core/services/job.service';
import { MessageService } from '@core/services/message.service';
import { WorkerEditResponse, WorkerService } from '@core/services/worker.service';
import { reject } from 'q';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-create-staff-record',
  templateUrl: './create-staff-record.component.html',
  styleUrls: ['./create-staff-record.component.scss'],
})
export class CreateStaffRecordComponent implements OnInit, OnDestroy {
  public contractsAvailable: Array<string> = [];
  public jobsAvailable: Job[] = [];
  public totalWorkers = 0;
  public establishmentStaff = 0;
  public form: FormGroup;
  private subscriptions: Subscription = new Subscription();

  constructor(
    private establishmentService: EstablishmentService,
    private workerService: WorkerService,
    private jobService: JobService,
    private messageService: MessageService,
    private formBuilder: FormBuilder,
    private router: Router
  ) {
    this.addStaffRecord = this.addStaffRecord.bind(this);
    this.totalStaffValidator = this.totalStaffValidator.bind(this);
  }

  get displayAddMore() {
    const staffRecordsControl = <FormArray>this.form.controls.staffRecords;

    return staffRecordsControl.controls.some(control => {
      return control.get('active').value;
    });
  }

  ngOnInit() {
    this.subscriptions.add(
      this.establishmentService.getStaff().subscribe(establishmentStaff => {
        this.establishmentStaff = establishmentStaff;
        this.form.controls.totalStaff.patchValue(establishmentStaff);
        this.form.updateValueAndValidity();
      })
    );
    this.subscriptions.add(
      this.workerService.getAllWorkers().subscribe(workers => {
        this.totalWorkers = workers.length;
        this.form.updateValueAndValidity();
      })
    );
    this.subscriptions.add(this.jobService.getJobs().subscribe(jobs => (this.jobsAvailable = jobs)));
    this.contractsAvailable = Object.values(Contracts);

    this.form = this.formBuilder.group({
      totalStaff: [null, [Validators.min(1), Validators.max(999), Validators.required]],
      staffRecords: this.formBuilder.array([this.createStaffRecordsItem()]),
    });

    this.form.setValidators(this.totalStaffValidator);

    this.form.controls.staffRecords.valueChanges.subscribe(val => {
      if (this.form.controls.totalStaff.value < val.length) {
        this.form.controls.totalStaff.patchValue(val.length);
      }
    });
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
    this.messageService.clearAll();
  }

  createStaffRecordsItem(): FormGroup {
    return this.formBuilder.group({
      nameOrId: [null, Validators.required],
      mainJob: [null, Validators.required],
      contract: [null, Validators.required],
      active: true,
    });
  }

  addStaffRecord() {
    const staffRecordsControl = <FormArray>this.form.controls.staffRecords;

    this.closeStaffRecords();

    staffRecordsControl.push(this.createStaffRecordsItem());
  }

  deleteStaffRecord(i: number) {
    const staffRecordsControl = <FormArray>this.form.controls.staffRecords;

    staffRecordsControl.controls.splice(i, 1);
  }

  openStaffRecord(i: number) {
    const staffRecordsControl = <FormArray>this.form.controls.staffRecords;

    this.closeStaffRecords();

    staffRecordsControl.controls[i].patchValue({ active: true });
  }

  closeStaffRecords() {
    const staffRecordsControl = <FormArray>this.form.controls.staffRecords;

    staffRecordsControl.controls.forEach(control => {
      control.patchValue({ active: false });
    });
  }

  totalStaffValidator() {
    if (this.form) {
      const { totalStaff, staffRecords } = this.form.value;
      const calculatedTotalStaff = this.totalWorkers + staffRecords.filter(record => record.valid).length;

      if (totalStaff > calculatedTotalStaff) {
        return {
          addMoreRecords: [
            { text: `You said you have ${totalStaff} members of staff but you only have ${calculatedTotalStaff}.` },
            {
              text: `You need to complete ${totalStaff - calculatedTotalStaff} more records.`,
              action: this.addStaffRecord,
            },
          ],
        };
      }
    }

    return null;
  }

  validateRecord(index) {
    const staffRecords = <FormArray>this.form.controls.staffRecords;
    const staffRecord = <FormGroup>staffRecords.controls[index];

    if (staffRecord.valid) {
      this.closeStaffRecords();
    } else {
      Object.keys(staffRecord.controls).forEach(key => {
        staffRecord.get(key).markAsTouched();
      });
    }
  }

  async submitHandler() {
    try {
      const promises = this.form.controls.staffRecords['controls'].map(control =>
        this.saveHandler(control).catch(error => false)
      );

      const response = await Promise.all(promises).then(function(res) {
        const complete = res.filter(value => !!value);
        return { success: complete.length, failed: res.length - complete.length };
      });
      await this.saveTotalStaff().catch(error => false);

      this.workerService.setCreateStaffResponse(response.success, response.failed);

      this.router.navigate(['/dashboard'], { fragment: 'staff-records' });
    } catch (err) {
      // keep typescript transpiler silent
    }
  }

  saveTotalStaff(): Promise<any> {
    return new Promise((resolve, reject) => {
      const { totalStaff } = this.form.controls;

      if (this.form.valid) {
        this.subscriptions.add(
          this.establishmentService.postStaff(parseInt(totalStaff.value, 10)).subscribe(resolve, reject)
        );
      } else {
        reject(false);
      }
    });
  }

  saveHandler(staffRecord): Promise<WorkerEditResponse> {
    return new Promise((resolve, reject) => {
      const { nameOrId, contract, mainJob } = staffRecord.controls;

      if (staffRecord.valid) {
        const worker = {} as Worker;
        const job = this.jobsAvailable.find(j => j.id === parseInt(mainJob.value, 10));

        worker.nameOrId = nameOrId.value;
        worker.contract = contract.value;
        worker.mainJob = {
          jobId: job.id,
          title: job.title,
        };
        this.subscriptions.add(this.workerService.setWorker(worker).subscribe(resolve, reject));
      } else {
        reject(false);
      }
    });
  }
}
