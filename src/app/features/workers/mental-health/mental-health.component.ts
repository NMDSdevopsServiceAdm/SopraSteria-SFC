import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormArray } from "@angular/forms"
import { Router } from "@angular/router"

import { MessageService } from "../../../core/services/message.service"
import { WorkerService } from "../../../core/services/worker.service"


@Component({
  selector: 'app-mental-health',
  templateUrl: './mental-health.component.html'
})
export class MentalHealthComponent implements OnInit, OnDestroy {

  constructor(
    private workerService: WorkerService,
    private formBuilder: FormBuilder,
    private messageService: MessageService,
    private router: Router
  ) {
    this.saveHandler = this.saveHandler.bind(this)
  }

  form: FormGroup

  private subscriptions = []

  async submitHandler() {
    try {
      // TODO implement

    } catch (err) {
      // keep typescript transpiler silent
    }
  }

  saveHandler() {
    return new Promise((resolve, reject) => {
      // TODO implement
      resolve()
    })
  }


  ngOnInit() {
    this.form = this.formBuilder.group({
      answer: ["", Validators.required]
    })

    // TODO call some API and get current setting
  }

  ngOnDestroy() {
    this.subscriptions.forEach(s => s.unsubscribe())
    this.messageService.clearAll()
  }
}
