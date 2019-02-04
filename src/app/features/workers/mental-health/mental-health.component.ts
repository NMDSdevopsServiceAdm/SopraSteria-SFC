import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from "@angular/forms"
import { ActivatedRoute, Router } from "@angular/router"

import { MessageService } from "../../../core/services/message.service"
import { WorkerService } from "../../../core/services/worker.service"
import { Worker } from "../../../core/model/worker.model"


@Component({
  selector: 'app-mental-health',
  templateUrl: './mental-health.component.html'
})
export class MentalHealthComponent implements OnInit, OnDestroy {

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private workerService: WorkerService,
    private messageService: MessageService
  ) {
    this.saveHandler = this.saveHandler.bind(this)
  }

  form: FormGroup

  private subscriptions = []
  private worker: Worker
  private workerId: string

  answersAvailable = [ "Yes", "No", "Don't know" ]

  async submitHandler() {
    try {
      await this.saveHandler()

      if (this.isOtherJobsSocialWorker()) {
        this.router.navigate([`/worker/national-insurance-number/${this.workerId}`])

      } else {
        this.router.navigate([`/worker/main-job-start-date/${this.workerId}`])
      }

    } catch (err) {
      // keep typescript transpiler silent
    }
  }

  private isOtherJobsSocialWorker() {
    return this.worker.otherJobs && this.worker.otherJobs.some(j => j.title === "Social Worker")
  }

  saveHandler() {
    return new Promise((resolve, reject) => {
      const { approvedMentalHealthWorker } = this.form.value
      this.messageService.clearError()

      if (this.form.valid) {
        if (approvedMentalHealthWorker) {
          this.worker.approvedMentalHealthWorker = approvedMentalHealthWorker
        }

        this.subscriptions.push(
          this.workerService.updateWorker(this.workerId, this.worker).subscribe(resolve, reject)
        )

      } else {
        this.messageService.show("error", "Please fill required fields.")
        reject()
      }
    })
  }

  goBack(event) {
    event.preventDefault()

    if (this.isOtherJobsSocialWorker()) {
      this.router.navigate([`/worker/other-job-roles/${this.workerId}`])

    } else {
      this.router.navigate([`/worker/edit-staff-record/${this.workerId}`])
    }
  }

  ngOnInit() {
    this.form = this.formBuilder.group({
      approvedMentalHealthWorker: null
    })

    const params = this.route.snapshot.paramMap
    this.workerId = params.has("id") ? params.get("id") : null

    if (this.workerId) {
      this.subscriptions.push(
        this.workerService.getWorker(this.workerId).subscribe(worker => {
          this.worker = worker

          this.form.patchValue({
            approvedMentalHealthWorker: worker.approvedMentalHealthWorker
          })
        })
      )
    }
  }

  ngOnDestroy() {
    this.subscriptions.forEach(s => s.unsubscribe())
    this.messageService.clearAll()
  }
}
