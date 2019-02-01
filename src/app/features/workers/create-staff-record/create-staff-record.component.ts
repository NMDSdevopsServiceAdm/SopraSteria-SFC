import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from "@angular/forms"
import { ActivatedRoute, Router } from "@angular/router"

import { MessageService } from "../../../core/services/message.service"
import { WorkerService, WorkerEditResponse } from "../../../core/services/worker.service"
import { JobService } from "../../../core/services/job.service"
import { Contracts } from "../../../core/constants/contracts.enum"
import { Job } from "../../../core/model/job.model"
import { Worker } from "../../../core/model/worker.model"


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
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.saveHandler = this.saveHandler.bind(this)
  }

  form: FormGroup
  jobsAvailable: Job[] = []
  contractsAvailable: Array<string> = []

  private worker: Worker
  private workerId: string
  private subscriptions = []

  private isSocialWorkerSelected(): boolean {
    const { mainJob } = this.form.value
    if (mainJob) {
      return this.jobsAvailable.some(a => a.id === parseInt(mainJob) && a.title === "Social Worker")
    }

    return false
  }

  private getSelectedJobTitle(): string | null {
    const { mainJob } = this.form.value
    if (mainJob) {
      const job = this.jobsAvailable.find(j => parseInt(mainJob) === j.id)

      if (job) {
        return job.title
      }
    }

    return null
  }

  async submitHandler() {
    try {
      const res = await this.saveHandler()
      const workerId = this.workerId || res.uid

      if (this.isSocialWorkerSelected()) {
        this.router.navigate([`/worker/mental-health/${workerId}`])

      } else {
        this.router.navigate([`/worker/main-job-start-date/${workerId}`])
      }

    } catch (err) {
      // keep typescript transpiler silent
    }
  }

  saveHandler(): Promise<WorkerEditResponse> {
    return new Promise((resolve, reject) => {
      const { nameOrId, contract, mainJob } = this.form.controls
      this.messageService.clearError()

      if (this.form.valid) {
        const newWorker = {
          nameOrId: nameOrId.value,
          contract: contract.value,
          mainJob: {
            jobId: parseInt(mainJob.value)
          }
        }

        if (this.workerId) {
          if (this.worker.nameOrId !== newWorker.nameOrId ||
              this.worker.contract !== newWorker.contract ||
              this.worker.mainJob.jobId !== newWorker.mainJob.jobId) {
            this.subscriptions.push(
              this.workerService.updateWorker(this.workerId, newWorker).subscribe(resolve, reject)
            )

          } else {
            resolve()
          }

        } else {
          this.subscriptions.push(
            this.workerService.createWorker(newWorker).subscribe(resolve, reject)
          )
        }

      } else {
        if (nameOrId.errors && nameOrId.errors.required) {
          this.messageService.show("error", "'Full name or ID number' is required.")
        }

        if (mainJob.errors && mainJob.errors.required) {
          this.messageService.show("error", "'Main job role' is required.")
        }

        if (contract.errors && contract.errors.required) {
          this.messageService.show("error", "'Type of contract' is required.")
        }

        reject()
      }
    })
  }

  ngOnInit() {
    this.form = this.formBuilder.group({
      nameOrId: [null, Validators.required],
      mainJob: [null, Validators.required],
      contract: [null, Validators.required]
    })

    const params = this.route.snapshot.paramMap
    this.workerId = params.has("id") ? params.get("id") : null

    if (this.workerId) {
      this.subscriptions.push(
        this.workerService.getWorker(this.workerId).subscribe(worker => {
          this.worker = worker

          this.form.patchValue({
            nameOrId: worker.nameOrId,
            mainJob: worker.mainJob.jobId,
            contract: worker.contract
          })
        })
      )
    }

    this.contractsAvailable = Object.values(Contracts)

    this.subscriptions.push(
      this.jobService.getJobs().subscribe(jobs => this.jobsAvailable = jobs)
    )
  }

  ngOnDestroy() {
    this.subscriptions.forEach(s => s.unsubscribe())
    this.messageService.clearAll()
  }
}
