import { Component, ElementRef, OnDestroy, OnInit, Renderer2 } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Contracts } from '@core/model/contracts.enum';
import { Job } from '@core/model/job.model';
import { Worker } from '@core/model/worker.model';
import { BackService } from '@core/services/back.service';
import { EstablishmentService } from '@core/services/establishment.service';
import { JobService } from '@core/services/job.service';
import { WorkerService } from '@core/services/worker.service';
import { Subscription } from 'rxjs';
import { isNull } from 'util';

@Component({
  selector: 'app-create-basic-records',
  templateUrl: './create-basic-records.component.html',
})
export class CreateBasicRecordsComponent implements OnInit, OnDestroy {
  public contracts: Array<string> = [];
  public jobs: Job[] = [];
  public totalStaff: number;
  public totalWorkers = 0;
  public form: FormGroup;
  public submitted = false;
  private subscriptions: Subscription = new Subscription();
  private otherJobRoleCharacterLimit = 120;

  constructor(
    private elementRef: ElementRef,
    private renderer: Renderer2,
    private formBuilder: FormBuilder,
    private router: Router,
    private backService: BackService,
    private establishmentService: EstablishmentService,
    private jobService: JobService,
    private workerService: WorkerService
  ) {
    this.addStaffRecord = this.addStaffRecord.bind(this);

    this.form = this.formBuilder.group({
      staffRecords: this.formBuilder.array([this.createStaffRecordsItem()]),
    });
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

  showOtherField(id: number): boolean {
    const selectedjob = this.jobs.find(job => job.id === +id);
    return selectedjob && selectedjob.other;
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

    this.subscriptions.add(this.jobService.getJobs().subscribe(jobs => (this.jobs = jobs)));
    this.contracts = Object.values(Contracts);

    this.backService.setBackLink({ url: ['/worker/basic-records-start-screen'] });
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }

  public openStaffRecord(event: Event, index: number) {
    event.preventDefault();
    this._openStaffRecord(index);
  }

  public addStaffRecord() {
    this.closeStaffRecords();
    this.staffRecordsControl.push(this.createStaffRecordsItem());
  }

  public deleteStaffRecord(event: Event, index: number) {
    event.preventDefault();
    const staffRecord = <FormGroup>this.staffRecordsControl.controls[index];
    const { uid } = staffRecord.value;

    if (uid) {
      this.subscriptions.add(
        this.workerService.deleteWorker(uid).subscribe(() => {
          this.staffRecordsControl.controls.splice(index, 1);
        })
      );
    } else {
      this.staffRecordsControl.controls.splice(index, 1);
    }
  }

  private createStaffRecordsItem(): FormGroup {
    return this.formBuilder.group({
      nameOrId: [null, Validators.required],
      mainJobRole: [null, Validators.required],
      otherJobRole: [null, [Validators.maxLength(this.otherJobRoleCharacterLimit)]],
      contract: [null, Validators.required],
      uid: null,
      active: true,
    });
  }

  private _openStaffRecord(index: number) {
    this.closeStaffRecords();
    this.staffRecordsControl.controls[index].patchValue({ active: true });
    setTimeout(() => {
      this.renderer.selectRootElement(`#staffRecord_${index}`, true).scrollIntoView({ behavior: 'smooth' });
    });
  }

  private closeStaffRecords() {
    this.staffRecordsControl.controls.forEach(control => {
      control.patchValue({ active: false });
    });
  }

  submitHandler() {
    // TODO: Better validation and accessibility when submitting the form.
    this.submitted = true;

    const active = this.staffRecordsControl.controls.findIndex(group => {
      return group.get('active').value;
    });

    if (this.form.valid || this.staffRecordsControl.length === 0) {
      this.workerService.setCreateStaffResponse(
        this.staffRecordsControl.controls.filter(record => record.get('uid').value).length
      );
      this.router.navigate(['/worker', 'basic-records-save-success']);
    } else {
      const unsavedIndex = this.staffRecordsControl.controls.findIndex(control => {
        return isNull(control.get('uid').value);
      });

      if (unsavedIndex >= 0) {
        this._openStaffRecord(unsavedIndex);
        this.saveStaffRecord(unsavedIndex);
      } else {
        this.elementRef.nativeElement.querySelector('form').scrollIntoView(true);
      }
    }
  }

  public saveStaffRecord(index: number) {
    const staffRecord = <FormGroup>this.staffRecordsControl.controls[index];

    Object.keys(staffRecord.controls).forEach(key => {
      staffRecord.get(key).markAsTouched();
    });

    if (staffRecord.valid) {
      const { nameOrId, contract, mainJobRole, otherJobRole, uid } = staffRecord.controls;

      const props = {
        nameOrId: nameOrId.value,
        contract: contract.value,
        mainJob: {
          jobId: parseInt(mainJobRole.value, 10),
          ...(otherJobRole.value && { other: otherJobRole.value }),
        },
      };

      if (!isNull(uid.value)) {
        this.subscriptions.add(
          this.workerService.updateWorker(uid.value, props).subscribe(
            () => this.closeStaffRecords(),
            error => {
              console.log(error);
            }
          )
        );
      } else {
        this.subscriptions.add(
          this.workerService.createWorker(props as Worker).subscribe(
            data => {
              staffRecord.patchValue({ uid: data.uid });
              this.closeStaffRecords();
            },
            error => {
              console.log(error);
            }
          )
        );
      }
    }
  }
}
