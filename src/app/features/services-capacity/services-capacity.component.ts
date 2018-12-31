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

  capacitiesAvailable: object;

  private subscriptions = []

  submitHandler(): void {
    if (this.form.valid) {
      this.subscriptions.push(
        this.establishmentService.postCapacity(this.formToApi())
          .subscribe(() => this.router.navigate(["/share-options"])))

    } else {
      this.messageService.clearError()
      this.messageService.show("error", "Please fill the required fields.")
    }
  }

  private formToApi() {
    return Object.entries(this.form.value).map(([key, value]) => ({ questionId: parseFloat(key), answer: value }))
  }

  ngOnInit() {
    this.form = this.fb.group({})

    this.subscriptions.push(
      this.establishmentService.getCapacity(true)
        .subscribe(data => {
          this.capacitiesAvailable = data.allServiceCapacities

          data.allServiceCapacities.forEach(service => {
            service.questions.forEach(question => {
              let answer = data.capacities.find(cc => question.questionId === cc.questionId)
              answer = answer ? answer.answer : ""
              this.form.registerControl(question.questionId.toString(), this.fb.control(parseFloat(answer), [Validators.required]))
            })
          })
        })
    )
  }

  ngOnDestroy() {
    this.subscriptions.forEach(s => s.unsubscribe())
    this.messageService.clearAll()
  }
}
