import { Component, Input, OnInit, OnDestroy } from "@angular/core"
import { FormGroup, FormBuilder, Validators, FormArray } from "@angular/forms"
import { Router } from "@angular/router"

import { MessageService } from "../../core/services/message.service"
import { EstablishmentService } from "../../core/services/establishment.service"

@Component({
  selector: 'app-services-capacity',
  templateUrl: './services-capacity.component.html',
  styleUrls: ['./services-capacity.component.scss']
})
export class ServicesCapacityComponent implements OnInit, OnDestroy {
  constructor(
    private fb: FormBuilder,
    private router: Router,
    private establishmentService: EstablishmentService,
    private messageService: MessageService) {}

  form: FormGroup

  private subscriptions = []
  private capacitiesMap = {
    "2": "bedsTotal",
    "3": "bedsUsed",
    "11": "peopleWithCare"
  }

  submitHandler(): void {
    if (this.form.valid) {
      const data = this.formToApi()
      this.subscriptions.push(
        this.establishmentService.postCapacity(data)
          .subscribe(() => this.router.navigate(["/sharing"])))

    } else {
      this.messageService.clearError()
      this.messageService.show("error", "Please fill the required fields.")
    }
  }

  private formToApi() {
    return Object.entries(this.capacitiesMap).map(
      ([key, value]) => ({ questionId: parseFloat(key), answer: this.form.value[value] }))
  }

  ngOnInit() {
    this.form = this.fb.group({
      bedsTotal: ["", Validators.required],
      bedsUsed: ["", Validators.required],
      peopleWithCare: ["", Validators.required]
    })

    this.capacitiesMap

    this.subscriptions.push(
      this.establishmentService.getCapacity()
        .subscribe(c => this.form.patchValue({ [this.capacitiesMap[c.questionId]]: c.answer }))
    )
  }

  ngOnDestroy() {
    this.subscriptions.forEach(s => s.unsubscribe())
    this.messageService.clearAll()
  }
}
