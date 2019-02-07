import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from "@angular/forms"
import { ActivatedRoute, Router } from "@angular/router"
import * as moment from "moment"

import { MessageService } from "../../../core/services/message.service"
import { WorkerService } from "../../../core/services/worker.service"
import { Worker } from "../../../core/model/worker.model"


@Component({
  selector: 'app-days-of-sickness',
  templateUrl: './days-of-sickness.component.html'
})
export class DaysOfSicknessComponent implements OnInit, OnDestroy {

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private workerService: WorkerService,
    private messageService: MessageService
  ) {
    this.saveHandler = this.saveHandler.bind(this)
    this.otherChangeHandler = this.otherChangeHandler.bind(this)
    this.valueValidator = this.valueValidator.bind(this)
  }

  form: FormGroup

  private subscriptions = []
  private worker: Worker
  private workerId: string

  async submitHandler() {
    try {
      await this.saveHandler()
      this.router.navigate([`/worker/contract-with-zero-hours/${this.workerId}`])

    } catch (err) {
      // keep typescript transpiler silent
    }
  }

  saveHandler() {
    return new Promise((resolve, reject) => {
      const { valueKnown, value } = this.form.controls
      this.messageService.clearError()

      if (this.form.valid) {
        if (valueKnown.value) {
          this.worker.daysSick = {
            value: valueKnown.value,
            days: Math.round(value.value * 2) / 2,
          }
        }

        this.subscriptions.push(this.workerService.setWorker(this.worker).subscribe(resolve, reject))

      } else {
        if (value.errors.required) {
          this.messageService.show("error", "'Number of days' is required.")

        } else if (value.errors.yearTooEarly) {
          this.messageService.show("error", "Year can't be earlier than 100 year ago.")
        }

        reject()
      }
    })
  }

  otherChangeHandler() {
    this.form.controls.value.reset()
  }

  valueValidator() {
    if (this.form) {
      const { valueKnown } = this.form.value
      const value = this.form.controls.value.value

      if (valueKnown === "Yes" && !value) {
          return { required: true }
      }
    }

    return null
  }

  ngOnInit() {
    this.form = this.formBuilder.group({
      valueKnown: null,
      value: [null, this.valueValidator]
    })

    const params = this.route.snapshot.paramMap
    this.workerId = params.has("id") ? params.get("id") : null

    if (this.workerId) {
      this.subscriptions.push(
        this.workerService.getWorker(this.workerId).subscribe(worker => {
          this.worker = worker

          if (worker.daysSick) {
            this.form.patchValue({
              valueKnown: worker.daysSick.value,
              value: worker.daysSick.days ? worker.daysSick.days : null
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
