import { Component, OnInit, OnDestroy } from '@angular/core';
import { AbstractControl, FormGroup, FormBuilder, Validators, ValidationErrors } from "@angular/forms"
import { ActivatedRoute, Router } from "@angular/router"
import * as moment from "moment"

import { DEFAULT_DATE_FORMAT, DEFAULT_DATE_DISPLAY_FORMAT } from "../../../core/constants/constants"
import { MessageService } from "../../../core/services/message.service"
import { WorkerService, WorkerEditResponse } from "../../../core/services/worker.service"
import { Worker } from "../../../core/model/worker.model"
import { DateValidator } from "../../../core/validators/date.validator"


@Component({
  selector: 'app-date-of-birth',
  templateUrl: './date-of-birth.component.html'
})
export class DateOfBirthComponent implements OnInit, OnDestroy {

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private workerService: WorkerService,
    private messageService: MessageService
  ) {
    this.saveHandler = this.saveHandler.bind(this)
    this.formValidator = this.formValidator.bind(this)
  }

  form: FormGroup

  private subscriptions = []
  private worker: Worker
  private workerId: string

  async submitHandler() {
    try {
      const res = await this.saveHandler()
      this.router.navigate([`/worker/home-postcode/${res.uid}`])

    } catch (err) {
      // keep typescript transpiler silent
    }
  }

  saveHandler(): Promise<WorkerEditResponse> {
    return new Promise((resolve, reject) => {
      const { day, month, year } = this.form.value
      this.messageService.clearError()

      if (this.form.valid) {
        this.worker.dateOfBirth = moment(`${year}-${month}-${day}`, DEFAULT_DATE_FORMAT)
          .format(DEFAULT_DATE_FORMAT)
        this.subscriptions.push(
          this.workerService.updateWorker(this.workerId, this.worker).subscribe(resolve, reject)
        )

      } else {
        if (day && month && year) {
          const noBefore = this.calculateLowestAcceptableDate()
          const noAfter = this.calculateHighestAcceptableDate()

          this.messageService.show("error", `The date has to be between ${noBefore.format(DEFAULT_DATE_DISPLAY_FORMAT)} and ${noAfter.format(DEFAULT_DATE_DISPLAY_FORMAT)}.`)

        } else {
          this.messageService.show("error", "Please fill the required fields.")
        }

        reject()
      }
    })
  }

  private calculateLowestAcceptableDate() {
    const date = moment()
    date.year(date.year() - 100)
    return date
  }

  private calculateHighestAcceptableDate() {
    const date = moment()
    date.year(date.year() - 14)
    return date
  }

  formValidator(control: AbstractControl): ValidationErrors {
    if (!this.form) {
      return null
    }

    const { day, month, year } = this.form.value
    const date = moment(`${year}-${month}-${day}`, DEFAULT_DATE_FORMAT)

    if (date.isValid()) {
      const noBefore = this.calculateLowestAcceptableDate()
      const noAfter = this.calculateHighestAcceptableDate()

      if (date.isBetween(noBefore, noAfter, "day", "[]")) {
        return null
      }
    }

    return { dateBetweenValidator: true }
  }

  ngOnInit() {
    this.form = this.formBuilder.group({
      day: ["", Validators.required],
      month: ["", Validators.required],
      year: ["", Validators.required]
    })
    this.form.setValidators([DateValidator.dateValid(this.form), this.formValidator])

    const params = this.route.snapshot.paramMap
    this.workerId = params.has("id") ? params.get("id") : null

    if (this.workerId) {
      this.subscriptions.push(
        this.workerService.getWorker(this.workerId).subscribe(worker => {
          this.worker = worker

          if (worker.dateOfBirth) {
            const date = worker.dateOfBirth.split("-")
            this.form.patchValue({
              year: date[0],
              month: date[1],
              day: date[2],
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
