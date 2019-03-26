import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormArray } from "@angular/forms"
import { Router } from "@angular/router"

import { MessageService } from "../../core/services/message.service"
import { EstablishmentService } from "../../core/services/establishment.service"

@Component({
  selector: 'app-type-of-employer',
  templateUrl: './type-of-employer.component.html',
  styleUrls: ['./type-of-employer.component.scss']
})
export class TypeOfEmployerComponent implements OnInit, OnDestroy {
  constructor(
    private fb: FormBuilder,
    private router: Router,
    private establishmentService: EstablishmentService,
    private messageService: MessageService) {}

  form: FormGroup
  employerName: string

  options = [
    'Local Authority (adult services)',
    'Local Authority (generic/other)',
    "Private Sector",
    "Voluntary / Charity",
    "Other"
  ]

  private subscriptions = []

  submitHandler() {
    if (this.form.valid) {
      this.subscriptions.push(
        this.establishmentService.postEmployerType(this.form.value)
          .subscribe(() => this.router.navigate(["/select-other-services"])))

    } else {
      this.messageService.clearError()
      this.messageService.show("error", "Please fill the required fields.")
    }
  }

  ngOnInit() {
    this.form = this.fb.group({
      employerType: ["", Validators.required]
    })

    this.subscriptions.push(
      this.establishmentService.getEmployerType().subscribe(d => {
         this.employerName = d.name
         this.form.patchValue(d)
      })
    )
  }

  ngOnDestroy() {
    this.subscriptions.forEach(s => s.unsubscribe())
    this.messageService.clearAll()
  }
}
