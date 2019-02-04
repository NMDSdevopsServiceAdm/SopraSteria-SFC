import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from "@angular/forms"
import { ActivatedRoute, Router } from "@angular/router"

import { MessageService } from "../../../core/services/message.service"
import { WorkerService } from "../../../core/services/worker.service"
import { RecruitmentService, RecruitmentResponse } from "../../../core/services/recruitment.service"
import { Worker } from "../../../core/model/worker.model"


@Component({
  selector: 'app-recruited-from',
  templateUrl: './recruited-from.component.html'
})
export class RecruitedFromComponent implements OnInit, OnDestroy {

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private workerService: WorkerService,
    private recruitmentService: RecruitmentService,
    private messageService: MessageService
  ) {
    this.saveHandler = this.saveHandler.bind(this)
    this.recruitedFromIdValidator = this.recruitedFromIdValidator.bind(this)
    this.recruitmentKnownChangeHandler = this.recruitmentKnownChangeHandler.bind(this)
  }

  form: FormGroup

  private subscriptions = []
  private worker: Worker
  private workerId: string

  availableRecruitments: RecruitmentResponse[]

  async submitHandler() {
    try {
      await this.saveHandler()
      this.router.navigate([`/worker/adult-social-care-started/${this.workerId}`])

    } catch (err) {
      // keep typescript transpiler silent
    }
  }

  saveHandler() {
    return new Promise((resolve, reject) => {
      const { recruitedFromId, recruitmentKnown } = this.form.controls
      this.messageService.clearError()

      if (this.form.valid) {
        if (recruitmentKnown.value) {
          this.worker.recruitedFrom = {
            value: recruitmentKnown.value,
            from: {
              recruitedFromId: parseInt(recruitedFromId.value)
            }
          }
        }

        this.subscriptions.push(
          this.workerService.updateWorker(this.workerId, this.worker).subscribe(resolve, reject)
        )

      } else {
        if (recruitedFromId.errors &&
            Object.keys(recruitedFromId.errors).includes("recruitedFromIdValid")) {
          this.messageService.show("error", "'Recruitment from' has to be provided.")
        }

        reject()
      }
    })
  }

  goBack(event) {
    event.preventDefault()

    if (this.worker.countryOfBirth && this.worker.countryOfBirth.value === "United Kingdom") {
      this.router.navigate([`/worker/country-of-birth/${this.workerId}`])

    } else {
      this.router.navigate([`/worker/year-arrived-uk/${this.workerId}`])
    }
  }

  recruitmentKnownChangeHandler() {
    this.form.controls.recruitedFromId.reset()
  }

  recruitedFromIdValidator() {
    if (this.form) {
      const { recruitmentKnown } = this.form.value
      const recruitedFromId = this.form.controls.recruitedFromId.value

      if (recruitmentKnown === "Yes") {
        return recruitedFromId ? null : { recruitedFromIdValid: true }
      }
    }

    return null
  }

  ngOnInit() {
    this.form = this.formBuilder.group({
      recruitmentKnown: null,
      recruitedFromId: [null, this.recruitedFromIdValidator]
    })

    const params = this.route.snapshot.paramMap
    this.workerId = params.has("id") ? params.get("id") : null

    if (this.workerId) {
      this.subscriptions.push(
        this.workerService.getWorker(this.workerId).subscribe(worker => {
          this.worker = worker

          if (worker.recruitedFrom) {
            this.form.patchValue({
              recruitmentKnown: worker.recruitedFrom.value,
              recruitedFromId: worker.recruitedFrom.from ?
                worker.recruitedFrom.from.recruitedFromId : null
            })
          }
        })
      )
    }

    this.subscriptions.push(
      this.recruitmentService.getRecruitedFrom().subscribe(res => this.availableRecruitments = res)
    )
  }

  ngOnDestroy() {
    this.subscriptions.forEach(s => s.unsubscribe())
    this.messageService.clearAll()
  }
}
