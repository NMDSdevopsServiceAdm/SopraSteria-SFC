import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormArray, FormGroup, FormBuilder, Validators } from "@angular/forms"
import { ActivatedRoute, Router } from "@angular/router"
import { Subscription } from "rxjs"

import { MessageService } from "../../../core/services/message.service"
import { WorkerService } from "../../../core/services/worker.service"
import { JobService } from "../../../core/services/job.service"
import { Worker } from "../../../core/model/worker.model"
import { Job } from "../../../core/model/job.model"


@Component({
  selector: 'app-other-job-roles',
  templateUrl: './other-job-roles.component.html'
})
export class OtherJobRolesComponent implements OnInit, OnDestroy {

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private workerService: WorkerService,
    private messageService: MessageService,
    private jobService: JobService
  ) {
    this.saveHandler = this.saveHandler.bind(this)
  }

  form: FormGroup
  availableJobRoles: Job[]

  private subscriptions: Subscription[] = []
  private worker: Worker
  private workerId: string

  async submitHandler() {
    try {
      await this.saveHandler()

      if (this.isOtherJobsSocialWorker() && this.worker.mainJob.title !== "Social Worker") {
        this.router.navigate([`/worker/mental-health/${this.workerId}`])

      } else {
        this.router.navigate([`/worker/national-insurance-number/${this.workerId}`])
      }

    } catch (err) {
      // keep typescript transpiler silent
    }
  }

  private isOtherJobsSocialWorker(): boolean {
    return this.form.value.selectedJobRoles.some(j => j.checked && j.title === "Social Worker")
  }

  saveHandler() {
    return new Promise((resolve, reject) => {
      this.messageService.clearError()

      if (this.form.valid) {
        this.worker.otherJobs = this.form.value.selectedJobRoles.filter(j => j.checked).map(j => ({ jobId: j.jobId }))
        this.subscriptions.push(
          this.workerService.updateWorker(this.workerId, this.worker).subscribe(resolve, reject)
        )

      } else {
        reject()
      }
    })
  }

  onChange(control) {
    control.value.checked = !control.value.checked
  }

  ngOnInit() {
    this.form = this.formBuilder.group({
      selectedJobRoles: this.formBuilder.array([])
    })

    const params = this.route.snapshot.paramMap
    this.workerId = params.has("id") ? params.get("id") : null

    this.subscriptions.push(
      this.jobService.getJobs().subscribe(availableJobRoles => {
        if (this.workerId) {
          this.subscriptions.push(
            this.workerService.getWorker(this.workerId).subscribe(worker => {
              this.worker = worker

              const jobs = worker.otherJobs ?
                availableJobRoles.map(j => this.formBuilder.control({jobId: j.id, title: j.title, checked: worker.otherJobs.some(o => o.jobId === j.id)})) :
                availableJobRoles.map(j => this.formBuilder.control({jobId: j.id, title: j.title, checked: false}))
              jobs.forEach(j => (this.form.controls.selectedJobRoles as FormArray).push(j))
            })
          )
        }
      })
    )
  }

  ngOnDestroy() {
    this.subscriptions.forEach(s => s.unsubscribe())
    this.messageService.clearAll()
  }
}
