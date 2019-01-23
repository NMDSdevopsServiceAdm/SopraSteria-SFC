import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormArray } from "@angular/forms"
import { ActivatedRoute, Router, ParamMap, Params } from "@angular/router"
import * as moment from "moment"

import { DEFAULT_DATE_FORMAT } from "../../../core/constants/constants"
import { MessageService } from "../../../core/services/message.service"
import { WorkerService, WorkerEditResponse } from "../../../core/services/worker.service"
import { Worker } from "../../../core/model/worker.model"

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
      if (this.form.valid) {
        const { day, month, year } = this.form.value
        this.worker.mainJobStartDate = moment(`${year}-${month}-${day}`, DEFAULT_DATE_FORMAT)
          .format(DEFAULT_DATE_FORMAT)
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
      day: ["", Validators.required],
      month: ["", Validators.required],
      year: ["", Validators.required]
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
