import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from "@angular/forms"
import { ActivatedRoute, Router } from "@angular/router"

import { MessageService } from "../../../core/services/message.service"
import { WorkerService } from "../../../core/services/worker.service"
import { Worker } from "../../../core/model/worker.model"

@Component({
  selector: 'app-disability',
  templateUrl: './disability.component.html'
})
export class DisabilityComponent implements OnInit, OnDestroy {

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

  answersAvailable = [ "Yes", "No", "Undisclosed", "Don't know" ]

  async submitHandler() {
    try {
      await this.saveHandler()
      this.router.navigate([`/worker/ethnicity/${this.workerId}`])

    } catch (err) {
      // keep typescript transpiler silent
    }
  }

  saveHandler() {
    return new Promise((resolve, reject) => {
      const { disability } = this.form.value
      this.messageService.clearError()

      if (this.form.valid) {
        if (this.worker.disability !== disability) {
          this.worker.disability = disability
          this.subscriptions.push(
            this.workerService.updateWorker(this.workerId, this.worker).subscribe(resolve, reject)
          )

        } else {
          resolve()
        }

      } else {
        this.messageService.show("error", "Please fill the required fields.")
        reject()
      }
    })
  }

  ngOnInit() {
    this.form = this.formBuilder.group({
      disability: null
    })

    const params = this.route.snapshot.paramMap
    this.workerId = params.has("id") ? params.get("id") : null

    if (this.workerId) {
      this.subscriptions.push(
        this.workerService.getWorker(this.workerId).subscribe(worker => {
          this.worker = worker

          if (worker.disability) {
            this.form.patchValue({
              disability: worker.disability
            })
          }
        })
      )
    }
  }

  ngOnDestroy() {
    this.subscriptions.forEach(s => s.unsubscribe())
    this.messageService.clearAll()
  }
}
