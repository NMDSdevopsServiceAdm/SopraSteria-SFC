import { Component, OnInit, OnDestroy } from '@angular/core';
import { AbstractControl, FormGroup, FormBuilder, Validators } from "@angular/forms"
import { ActivatedRoute, Router } from "@angular/router"

import { MessageService } from "../../../core/services/message.service"
import { WorkerService, WorkerEditResponse } from "../../../core/services/worker.service"
import { Worker } from "../../../core/model/worker.model"
import { NIN_PATTERN } from "../../../core/constants/constants"


@Component({
  selector: 'app-national-insurance-number',
  templateUrl: './national-insurance-number.component.html'
})
export class NationalInsuranceNumberComponent implements OnInit, OnDestroy {

  constructor(
    private workerService: WorkerService,
    private formBuilder: FormBuilder,
    private messageService: MessageService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.saveHandler = this.saveHandler.bind(this)
  }

  form: FormGroup

  private subscriptions = []
  private worker: Worker
  private workerId: string

  async submitHandler() {
    try {
      await this.saveHandler()
      this.router.navigate([`/worker/date-of-birth/${this.workerId}`])

    } catch (err) {
      // keep typescript transpiler silent
    }
  }

  saveHandler() {
    return new Promise((resolve, reject) => {
      this.messageService.clearError()
      const { nin } = this.form.controls

      if (this.form.valid) {
        const newNin = nin.value ? nin.value.toUpperCase() : nin.value

        if (this.worker.nationalInsuranceNumber !== newNin) {
          this.worker.nationalInsuranceNumber = newNin
          this.subscriptions.push(
            this.workerService.updateWorker(this.workerId, this.worker).subscribe(resolve, reject)
          )

        } else {
          resolve()
        }

      } else {
        if (nin.errors.validNin) {
          this.messageService.show("error", "Invalid National Insurance Number format.")

        } else {
          this.messageService.show("error", "Please fill the required fields.")
        }

        reject()
      }
    })
  }

  ninValidator(control: AbstractControl) {
    return !control.value || NIN_PATTERN.test(control.value.toUpperCase()) ? null : { validNin: true }
  }

  ngOnInit() {
    this.form = this.formBuilder.group({
      nin: [null, this.ninValidator]
    })

    const params = this.route.snapshot.paramMap
    this.workerId = params.has("id") ? params.get("id") : null

    if (this.workerId) {
      this.subscriptions.push(
        this.workerService.getWorker(this.workerId).subscribe(worker => {
          this.worker = worker

          this.form.patchValue({
            nin: worker.nationalInsuranceNumber
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
