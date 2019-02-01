import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from "@angular/forms"
import { ActivatedRoute, Router } from "@angular/router"
import * as moment from "moment"

import { DEFAULT_DATE_FORMAT } from "../../../core/constants/constants"
import { MessageService } from "../../../core/services/message.service"
import { WorkerService, WorkerEditResponse } from "../../../core/services/worker.service"
import { Worker } from "../../../core/model/worker.model"
import { DateValidator } from "../../../core/validators/date.validator"


@Component({
  selector: 'app-main-job-start-date',
  templateUrl: './main-job-start-date.component.html'
})
export class MainJobStartDateComponent implements OnInit, OnDestroy {

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private workerService: WorkerService,
    private messageService: MessageService
  ) {
    this.saveHandler = this.saveHandler.bind(this)
    this.validateCross = this.validateCross.bind(this)
  }

  form: FormGroup

  private subscriptions = []
  private worker: Worker
  private workerId: string

  async submitHandler() {
    try {
      const res = await this.saveHandler()
      this.router.navigate([`/worker/other-job-roles/${res.uid}`])

    } catch (err) {
      // keep typescript transpiler silent
    }
  }

  saveHandler(): Promise<WorkerEditResponse> {
    return new Promise((resolve, reject) => {
      const { day, month, year } = this.form.value
      this.messageService.clearError()

      if (this.form.valid) {
        this.worker.mainJobStartDate = this.dateFromForm().format(DEFAULT_DATE_FORMAT)
        this.subscriptions.push(
          this.workerService.updateWorker(this.workerId, this.worker).subscribe(resolve, reject)
        )

      } else {
        if (this.form.errors) {
          if (this.form.errors.required) {
            this.messageService.show("error", "Please fill the required fields.")

          } else if (this.form.errors.dateValid) {
            this.messageService.show("error", "Invalid date.")

            // TODO cross validation
          // } else if (this.form.errors.dateAgainstDob) {
          //   this.messageService.show("error", "The date can't be too near the Date Of Birth.")

          } else if (this.form.errors.dateInPast) {
            this.messageService.show("error", "The date can't be in the future.")
          }
        }

        reject()
      }
    })
  }

  dateFromForm() {
    const { day, month, year } = this.form.value
    const date = moment(`${year}-${month}-${day}`, DEFAULT_DATE_FORMAT)
    return date
  }

  validateCross() {
    if (this.form && this.worker.dateOfBirth) {
      // TODO cross validation against DOB and year-of-arrival
    //   const jobStartDate = this.dateFromForm()
    //   const validDateToStartWork =
    //     moment(this.worker.dateOfBirth, DEFAULT_DATE_FORMAT).add(14, "y")

    //   if (jobStartDate.isBefore(validDateToStartWork)) {
    //     return { dateAgainstDob: true }
    //   }
    }

    return null
  }

  ngOnInit() {
    this.form = this.formBuilder.group({
      day: [null, Validators.required],
      month: [null, Validators.required],
      year: [null, Validators.required]
    })

    const params = this.route.snapshot.paramMap
    this.workerId = params.has("id") ? params.get("id") : null

    if (this.workerId) {
      this.subscriptions.push(
        this.workerService.getWorker(this.workerId).subscribe(worker => {
          this.worker = worker

          if (worker.mainJobStartDate) {
            const date = worker.mainJobStartDate.split("-")
            this.form.patchValue({
              year: parseInt(date[0]),
              month: parseInt(date[1]),
              day: parseInt(date[2]),
            })
          }

          this.form.setValidators([
            DateValidator.datePastOrToday(),
            this.validateCross
          ])
        })
      )
    }
  }

  ngOnDestroy() {
    this.subscriptions.forEach(s => s.unsubscribe())
    this.messageService.clearAll()
  }
}
