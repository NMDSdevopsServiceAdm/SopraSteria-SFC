import { Component, ElementRef, OnDestroy, OnInit } from '@angular/core';
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
  selector: 'app-create-basic-records',
  templateUrl: './create-basic-records.component.html',
  styleUrls: ['./create-basic-records.component.scss'],
})
export class CreateBasicRecordsComponent implements OnInit, OnDestroy {
  public contractsAvailable: Array<string> = [];
  public jobsAvailable: Job[] = [];
  public totalStaff: number;
  public totalWorkers = 0;
  public form: FormGroup;
  public submitted = false;
  private subscriptions: Subscription = new Subscription();

  constructor(
    private establishmentService: EstablishmentService,
    private workerService: WorkerService,
    private jobService: JobService,
    private messageService: MessageService,
    private formBuilder: FormBuilder,
    private router: Router,
    private elementRef: ElementRef
  ) {
    this.addStaffRecord = this.addStaffRecord.bind(this);
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
    return (
      this.totalWorkers + this.staffRecordsControl.controls.filter(control => !isNull(control.get('uid').value)).length
    );
  }

  ngOnInit() {
    this.subscriptions.add(
      this.establishmentService.getStaff().subscribe(establishmentStaff => {
        this.totalStaff = establishmentStaff ? establishmentStaff : 0;
      })
    );

    this.subscriptions.add(
      this.workerService.getAllWorkers().subscribe(workers => {
        this.totalWorkers = workers ? workers.length : 0;
      })
    );

    this.subscriptions.add(this.jobService.getJobs().subscribe(jobs => (this.jobsAvailable = jobs)));
    this.contractsAvailable = Object.values(Contracts);

    this.form = this.formBuilder.group({
      staffRecords: this.formBuilder.array([this.createStaffRecordsItem()]),
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
      uid: null,
      active: true,
    });
  }

  openStaffRecord(index: number) {
    this.closeStaffRecords();
    this.staffRecordsControl.controls[index].patchValue({ active: true });
    setTimeout(() => {
      this.elementRef.nativeElement.querySelector(`.staff-record:nth-of-type(${index + 1})`).scrollIntoView(true);
    });
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
    const uid = staffRecord.controls.uid.value;

    if (uid) {
      this.subscriptions.add(
        this.workerService.deleteWorker(staffRecord.controls.uid.value).subscribe(() => {
          this.staffRecordsControl.controls.splice(index, 1);
        })
      );
    } else {
      this.staffRecordsControl.controls.splice(index, 1);
    }
  }

  submitHandler() {
    this.submitted = true;

    if (this.form.valid || this.staffRecordsControl.length === 0) {
      this.workerService.setCreateStaffResponse(this.staffRecordsControl.length);
      this.router.navigate(['/worker', 'basic-records-save-success']);
    } else {
      const unsavedIndex = this.staffRecordsControl.controls.findIndex(control => {
        return isNull(control.get('uid').value);
      });

      if (unsavedIndex >= 0) {
        this.openStaffRecord(unsavedIndex);
        this.saveStaffRecord(unsavedIndex);
      } else {
        this.elementRef.nativeElement.querySelector('form').scrollIntoView(true);
      }
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
            resolve();
          }, reject)
        );
      }
    });
  }
}
