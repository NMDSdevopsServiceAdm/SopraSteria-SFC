import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from "@angular/forms"
import { ActivatedRoute, Router } from "@angular/router"
import * as moment from "moment"

import { MessageService } from "../../../core/services/message.service"
import { WorkerService } from "../../../core/services/worker.service"
import { Worker } from "../../../core/model/worker.model"


@Component({
  selector: 'app-adult-social-care-started',
  templateUrl: './adult-social-care-started.component.html'
})
export class AdultSocialCareStartedComponent implements OnInit, OnDestroy {

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
      this.router.navigate([`/worker/days-of-sickness/${this.workerId}`])

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
          this.worker.socialCareStartDate = {
            value: valueKnown.value,
            year: value.value
          }
        }

        this.subscriptions.push(this.workerService.setWorker(this.worker).subscribe(resolve, reject))

      } else {
        if (value.errors.required) {
          this.messageService.show("error", "Year is required.")

        } else if (value.errors.yearDigits) {
          this.messageService.show("error", "Year must have 4 digits.")

        } else if (value.errors.yearInFuture) {
          this.messageService.show("error", "Year can't be in the future.")

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
      const { valueKnown, value } = this.form.value

      if (valueKnown === "Yes") {
        if (value) {
          const currentYear = moment().year()

          if (currentYear - value < 0) {
            return { yearInFuture: true }

          } else if (currentYear - value > 100) {
            return { yearTooEarly: true}
          }

          return value.toString().length < 4 ? { yearDigits: true } : null

        } else {
          return { required: true }
        }
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

          if (worker.socialCareStartDate) {
            this.form.patchValue({
              valueKnown: worker.socialCareStartDate.value,
              value: worker.socialCareStartDate.year ? worker.socialCareStartDate.year : null
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
