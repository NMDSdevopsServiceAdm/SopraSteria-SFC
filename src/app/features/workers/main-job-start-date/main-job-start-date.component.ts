import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from "@angular/forms"
import { ActivatedRoute, Router } from "@angular/router"

import { MessageService } from "../../../core/services/message.service"
import { WorkerService, WorkerEditResponse } from "../../../core/services/worker.service"
import { Worker } from "../../../core/model/worker.model"


@Component({
  selector: 'app-main-job-start-date',
  templateUrl: './main-job-start-date.component.html'
})
export class MainJobStartDateComponent implements OnInit, OnDestroy {

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private messageService: MessageService) {
    this.saveHandler = this.saveHandler.bind(this)
  }

  form: FormGroup
  private subscriptions = []

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
        // TODO implement

        // const { day, month, year } = this.form.value
        // this.worker.mainJobStartDate = `${year}-${month}-${day}`
        // this.subscriptions.push(
        //   this.workerService.updateWorker(this.workerId, worker).subscribe(resolve)
        // )

      } else {
        this.messageService.clearError()
        this.messageService.show("error", "Please fill the required fields.")
        reject()
      }
    })
  }

  ngOnInit() {
    // TODO implement
  }

  ngOnDestroy() {
    this.subscriptions.forEach(s => s.unsubscribe())
    this.messageService.clearAll()
  }
}
