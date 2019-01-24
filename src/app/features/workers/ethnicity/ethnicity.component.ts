import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from "@angular/forms"
import { ActivatedRoute, Router } from "@angular/router"

import { MessageService } from "../../../core/services/message.service"
import { WorkerService, WorkerEditResponse } from "../../../core/services/worker.service"
import { EthnicityService } from "../../../core/services/ethnicity.service"
import { Worker } from "../../../core/model/worker.model"
import { Ethnicity } from "../../../core/model/ethnicity.model"


@Component({
  selector: 'app-ethnicity',
  templateUrl: './ethnicity.component.html'
})
export class EthnicityComponent implements OnInit, OnDestroy {

  constructor(
    private workerService: WorkerService,
    private ethnicityService: EthnicityService,
    private messageService: MessageService,
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.saveHandler = this.saveHandler.bind(this)
  }

  form: FormGroup
  ethnicities: any = {}

  private workerId: string
  private worker: Worker
  private subscriptions = []

  ethnicityGroups() {
    return Object.keys(this.ethnicities)
  }

  async submitHandler() {
    try {
      const res = await this.saveHandler()
      this.router.navigate([`/worker/nationality/${res.uid}`])

    } catch (err) {
      // keep typescript transpiler silent
    }
  }

  saveHandler(): Promise<WorkerEditResponse> {
    return new Promise((resolve, reject) => {
      if (this.form.valid) {
        this.worker.ethnicity = this.form.value.ethnicity
        this.workerService.updateWorker(this.workerId, this.worker).subscribe(resolve, reject)

      } else {
        this.messageService.clearError()
        this.messageService.show("error", "Please fill the required fields.")
        reject()
      }
    })
  }

  ngOnInit() {
    this.form = this.formBuilder.group({
      ethnicity: ["", Validators.required]
    })

    const params = this.route.snapshot.paramMap
    this.workerId = params.has("id") ? params.get("id") : null

    if (this.workerId) {
      this.subscriptions.push(
        this.workerService.getWorker(this.workerId).subscribe(worker => {
          this.form.patchValue({
            ethnicity: worker.ethnicity
          })
        })
      )
    }

    this.subscriptions.push(
      this.ethnicityService.getEthnicities().subscribe(res => this.ethnicities = res.byGroup)
    )
  }

  ngOnDestroy() {
    this.subscriptions.forEach(s => s.unsubscribe())
    this.messageService.clearAll()
  }
}
