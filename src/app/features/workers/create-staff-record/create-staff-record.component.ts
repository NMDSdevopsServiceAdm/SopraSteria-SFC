import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormArray } from "@angular/forms"
import { Router } from "@angular/router"

import { MessageService } from "../../../core/services/message.service"
import { WorkerService } from "../../../core/services/worker.service"
import { JobService } from "../../../core/services/job.service"
import { Contracts } from "../../../core/constants/contracts.enum"
import { Job } from "../../../core/model/job.model"


@Component({
  selector: 'app-create-staff-record',
  templateUrl: './create-staff-record.component.html'
})
export class CreateStaffRecordComponent implements OnInit, OnDestroy {

  constructor(
    private workerService: WorkerService,
    private jobService: JobService,
    private messageService: MessageService,
    private formBuilder: FormBuilder,
    private router: Router
  ) {
    this.saveHandler = this.saveHandler.bind(this)
  }

  form: FormGroup
  jobsAvailable: Job[] = []
  contractsAvailable: Array<string> = []

  private subscriptions = []

  async submitHandler() {
    try {
      await this.saveHandler()
      this.router.navigate(["/mental-health"])

    } catch (err) {
      // keep typescript transpiler silent
    }
  }

  saveHandler() {
    return new Promise((resolve, reject) => {
      if (this.form.valid) {
        this.subscriptions.push(
          this.workerService.createWorker(this.form.value).subscribe(resolve))

      } else {
        this.messageService.clearError()
        this.messageService.show("error", "Please fill the required fields.")
        reject()
      }
    })
  }

  ngOnInit() {
    this.form = this.formBuilder.group({
      fullNameOrId: ["", Validators.required],
      jobRole: ["", Validators.required],
      typeOfContract: ["", Validators.required]
    })

    this.contractsAvailable = Object.values(Contracts)

    this.subscriptions.push(
      this.jobService.getJobs()
        .subscribe(jobs => {
          this.jobsAvailable = jobs
        }))
  }

  ngOnDestroy() {
    this.subscriptions.forEach(s => s.unsubscribe())
    this.messageService.clearAll()
  }
}
