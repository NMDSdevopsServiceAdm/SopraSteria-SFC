import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormArray } from "@angular/forms"
import { ActivatedRoute, Router, ParamMap, Params } from "@angular/router"

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

  answersAvailable = ["Yes", "No", "Don't know"]

  async submitHandler() {
    try {
      await this.saveHandler()

      // TODO uncomment when API ready
      // if (this.worker.otherJob === "Social Worker") {
      // this.router.navigate([`/worker/national-insurance-number/${this.workerId}`])

      // } else {
      this.router.navigate([`/worker/main-job-start-date/${this.workerId}`])
      // }

    } catch (err) {
      // keep typescript transpiler silent
    }
  }

  saveHandler() {
    return new Promise((resolve, reject) => {
      if (this.form.valid) {
        this.worker.approvedMentalHealthWorker = this.form.value.approvedMentalHealthWorker
        this.subscriptions.push(
          this.workerService.updateWorker(this.workerId, this.worker).subscribe(resolve)
        )

      } else {
        this.messageService.clearError()
        this.messageService.show("error", "Please fill the required fields.")
        reject()
      }
    })
  }

  ngOnInit() {
    this.form = this.formBuilder.group({
      approvedMentalHealthWorker: ["", Validators.required]
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
