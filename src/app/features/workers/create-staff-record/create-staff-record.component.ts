import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormArray } from "@angular/forms"
import { Router } from "@angular/router"

import { MessageService } from "../../../core/services/message.service"
import { WorkerService } from "../../../core/services/worker.service"

@Component({
  selector: 'app-create-staff-record',
  templateUrl: './create-staff-record.component.html'
})
export class CreateStaffRecordComponent implements OnInit, OnDestroy {

  constructor(
    private workerService: WorkerService,
    private messageService: MessageService,
    private formBuilder: FormBuilder,
    private router: Router
  ) {}

  form: FormGroup

  private subscriptions = []

  rolesAvailable = [
    {
      key: "role1",
      label: "role1"
    }
  ]

  contractsAvailable = [
    {
      key: "permanent",
      label: "Permanent"
    },
    {
      key: "temporary",
      label: "Temporary"
    },
    {
      key: "poolbank",
      label: "Pool/Bank"
    },
    {
      key: "agency",
      label: "Agency"
    },
    {
      key: "other",
      label: "Other"
    }
  ]

  submitHandler() {
    if (this.form.valid) {
    this.subscriptions.push(
      this.workerService.createWorker(this.form.value).subscribe(() => {
        this.router.navigate(["/mental-health"])
      }))

    } else {
        this.messageService.clearError()
        this.messageService.show("error", "Please fill the required fields.")
    }
  }

  ngOnInit() {
    this.form = this.formBuilder.group({
      fullNameOrId: ["", Validators.required],
      jobRole: ["", Validators.required],
      typeOfContract: ["", Validators.required]
    })
  }

  ngOnDestroy() {
    this.subscriptions.forEach(s => s.unsubscribe())
    this.messageService.clearAll()
  }
}
