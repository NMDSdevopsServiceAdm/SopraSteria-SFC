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
import { Subscription } from 'rxjs';
import { isNull } from 'util';

@Component({
  selector: 'app-create-staff-record',
  templateUrl: './create-staff-record.component.html',
  styleUrls: ['./create-staff-record.component.scss'],
})
export class CreateStaffRecordComponent implements OnInit, OnDestroy {
  public contractsAvailable: Array<string> = [];
  public jobsAvailable: Job[] = [];
  public totalWorkers = 0;
  public form: FormGroup;
  public formSubmitted: false;
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
    // this.totalStaffValidator = this.totalStaffValidator.bind(this);
    // this.staffRecordsRequiredValidator = this.staffRecordsRequiredValidator.bind(this);
  }

  get displayAddMore() {
    return this.staffRecordsControl.controls.some(control => {
      return control.get('active').value;
    });
  }

  get staffRecordsControl() {
    return <FormArray>this.form.controls.staffRecords;
  }

  get calculatedTotalStaff() {
    return this.totalWorkers + this.staffRecordsControl.length;
  }

  ngOnInit() {
    this.subscriptions.add(
      this.establishmentService.getStaff().subscribe(establishmentStaff => {
        if (establishmentStaff) {
          this.form.controls.totalStaff.patchValue(establishmentStaff);
          this.form.updateValueAndValidity();
        }
      })
    );
    this.subscriptions.add(
      this.workerService.getAllWorkers().subscribe(workers => {
        if (workers) {
          this.totalWorkers = workers.length;
          this.form.updateValueAndValidity();
        }
      })
    );
    this.subscriptions.add(this.jobService.getJobs().subscribe(jobs => (this.jobsAvailable = jobs)));
    this.contractsAvailable = Object.values(Contracts);

    this.form = this.formBuilder.group({
      totalStaff: [0, [Validators.min(0), Validators.max(999), Validators.required]],
      staffRecords: this.formBuilder.array([this.createStaffRecordsItem()]),
    });

    // this.form.setValidators([this.totalStaffValidator, this.staffRecordsRequiredValidator]);

    // this.form.controls.staffRecords.valueChanges.subscribe(val => {
    //   const updateTotal = this.totalWorkers + val.length;
    //   if (this.form.controls.totalStaff.value < updateTotal) {
    //     this.form.controls.totalStaff.patchValue(updateTotal);
    //     this.form.updateValueAndValidity();
    //   }
    // });
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
      uid: null,
      active: true,
    });
  }

  openStaffRecord(index: number) {
    this.closeStaffRecords();
    this.staffRecordsControl.controls[index].patchValue({ active: true });
  }

  closeStaffRecords() {
    this.staffRecordsControl.controls.forEach(control => {
      control.patchValue({ active: false });
    });
  }

  addStaffRecord() {
    this.closeStaffRecords();
    this.staffRecordsControl.push(this.createStaffRecordsItem());
  }

  deleteStaffRecord(index: number) {
    const staffRecord = <FormGroup>this.staffRecordsControl.controls[index];

    this.subscriptions.add(
      this.workerService.deleteWorker(staffRecord.controls.uid.value, null).subscribe(null, null, () => {
        this.staffRecordsControl.controls.splice(index, 1);
        this.decrementTotalStaff();
      })
    );
  }

  // totalStaffValidator() {
  //   if (this.form) {
  //     const { totalStaff } = this.form.value;
  //     const calculatedTotalStaff =
  //       this.totalWorkers + this.staffRecordsControl.controls.filter(control => control.valid).length;

  //     if (totalStaff > calculatedTotalStaff) {
  //       return {
  //         addMoreRecords: [
  //           { text: `You said you have ${totalStaff} members of staff but you only have ${calculatedTotalStaff}.` },
  //           { text: `You need to complete ${totalStaff - calculatedTotalStaff} more records.` },
  //         ],
  //       };
  //     } else if (totalStaff < calculatedTotalStaff) {
  //       return {
  //         removeRecords: [
  //           { text: `You said you have ${totalStaff} members of staff but you have created more.` },
  //           { text: `You need to update your Number of Staff to ${calculatedTotalStaff} or delete some records.` },
  //         ],
  //       };
  //     }
  //   }

  //   return null;
  // }

  // staffRecordsRequiredValidator() {
  //   if (this.form) {
  //     if (!this.staffRecordsControl.controls.filter(control => control.valid).length) {
  //       return { staffRecordsRequired: true };
  //     }

  //     return null;
  //   }
  // }

  submitHandler() {
    console.log(this.form.valid);
    // this.workerService.setCreateStaffResponse(this.staffRecordsControl.length, 0);
    // this.router.navigate(['/dashboard'], { fragment: 'staff-records' });
  }

  updateTotalStaff(total: number) {
    this.subscriptions.add(
      this.establishmentService.postStaff(total).subscribe(data => {
        this.form.patchValue({ totalStaff: data.numberOfStaff });
        this.form.updateValueAndValidity();
      })
    );
  }

  incrementTotalStaff() {
    if (this.calculatedTotalStaff > this.form.controls.totalStaff.value) {
      this.updateTotalStaff(this.calculatedTotalStaff);
    }
  }

  decrementTotalStaff() {
    if (this.calculatedTotalStaff < this.form.controls.totalStaff.value) {
      this.updateTotalStaff(this.calculatedTotalStaff);
    }
  }

  async saveStaffRecord(index: number) {
    const staffRecord = <FormGroup>this.staffRecordsControl.controls[index];

    Object.keys(staffRecord.controls).forEach(key => {
      staffRecord.get(key).markAsTouched();
    });

    try {
      if (staffRecord.valid) {
        await this.saveHandler(staffRecord);
        this.closeStaffRecords();
      }
    } catch (err) {}
  }

  saveHandler(staffRecord): Promise<WorkerEditResponse> {
    return new Promise((resolve, reject) => {
      const { nameOrId, contract, mainJob, uid } = staffRecord.controls;

      const props = {
        nameOrId: nameOrId.value,
        contract: contract.value,
        mainJob: {
          jobId: parseInt(mainJob.value, 10),
        },
      };

      if (!isNull(uid.value)) {
        this.subscriptions.add(this.workerService.updateWorker(uid.value, props).subscribe(resolve, reject));
      } else {
        this.subscriptions.add(
          this.workerService.createWorker(props as Worker).subscribe(data => {
            staffRecord.patchValue({ uid: data.uid });
            this.incrementTotalStaff();
            resolve();
          }, reject)
        );
      }
    });
  }
}
