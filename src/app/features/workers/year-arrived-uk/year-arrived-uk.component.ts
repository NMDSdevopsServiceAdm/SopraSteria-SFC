import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from "@angular/forms"
import { ActivatedRoute, Router } from "@angular/router"
import * as moment from "moment"

import { MessageService } from "../../../core/services/message.service"
import { WorkerService } from "../../../core/services/worker.service"
import { Worker } from "../../../core/model/worker.model"


@Component({
  selector: 'app-year-arrived-uk',
  templateUrl: './year-arrived-uk.component.html'
})
export class YearArrivedUkComponent implements OnInit, OnDestroy {

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private workerService: WorkerService,
    private messageService: MessageService
  ) {
    this.saveHandler = this.saveHandler.bind(this)
    this.yearKnownChangeHandler = this.yearKnownChangeHandler.bind(this)
    this.yearValidator = this.yearValidator.bind(this)
  }

  form: FormGroup

  private subscriptions = []
  private worker: Worker
  private workerId: string

  async submitHandler() {
    try {
      await this.saveHandler()
      this.router.navigate([`/worker/recruited-from/${this.workerId}`])

    } catch (err) {
      // keep typescript transpiler silent
    }
  }

  saveHandler() {
    return new Promise((resolve, reject) => {
      const { yearKnown, year } = this.form.controls
      this.messageService.clearError()

      if (this.form.valid) {
        if (yearKnown.value) {
          this.worker.yearArrived = {
            value: yearKnown.value,
            year: year.value
          }
        }

        this.subscriptions.push(this.workerService.setWorker(this.worker).subscribe(resolve, reject))

      } else {
        if (year.errors.required) {
          this.messageService.show("error", "Year is required.")

        } else if (year.errors.yearDigits) {
          this.messageService.show("error", "Year must have 4 digits.")

        } else if (year.errors.yearInFuture) {
          this.messageService.show("error", "Year can't be in future.")

        } else if (year.errors.yearTooEarly) {
          this.messageService.show("error", "Year can't be earlier than 100 year ago.")
        }

        reject()
      }
    })
  }

  yearKnownChangeHandler() {
    this.form.controls.year.reset()
  }

  yearValidator() {
    if (this.form) {
      const { yearKnown, year } = this.form.value

      if (yearKnown === "Yes") {
        if (year) {
          const currentYear = moment().year()

          if (currentYear - year < 0) {
            return { yearInFuture: true }

          } else if (currentYear - year > 100) {
            return { yearTooEarly: true}
          }

          return year.toString().length < 4 ? { yearDigits: true } : null

        } else {
          return { required: true }
        }
      }
    }

    return null
  }

  ngOnInit() {
    this.form = this.formBuilder.group({
      yearKnown: null,
      year: [null, this.yearValidator]
    })

    const params = this.route.snapshot.paramMap
    this.workerId = params.has("id") ? params.get("id") : null

    if (this.workerId) {
      this.subscriptions.push(
        this.workerService.getWorker(this.workerId).subscribe(worker => {
          this.worker = worker

          if (worker.yearArrived) {
            this.form.patchValue({
              yearKnown: worker.yearArrived.value,
              year: worker.yearArrived.year ? worker.yearArrived.year : null
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
