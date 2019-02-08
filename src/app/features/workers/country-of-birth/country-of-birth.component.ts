import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from "@angular/forms"
import { ActivatedRoute, Router } from "@angular/router"

import { MessageService } from "../../../core/services/message.service"
import { WorkerService } from "../../../core/services/worker.service"
import { CountryService, CountryResponse } from "../../../core/services/country.service"
import { Worker } from "../../../core/model/worker.model"


@Component({
  selector: 'app-country-of-birth',
  templateUrl: './country-of-birth.component.html'
})
export class CountryOfBirthComponent implements OnInit, OnDestroy {

  constructor(
    private workerService: WorkerService,
    private countryService: CountryService,
    private messageService: MessageService,
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.saveHandler = this.saveHandler.bind(this)
    this.cobNameValidator = this.cobNameValidator.bind(this)
    this.cobNameFilter = this.cobNameFilter.bind(this)
  }

  form: FormGroup

  private subscriptions = []
  private worker: Worker
  private workerId: string

  availableOtherCountries: CountryResponse[]

  async submitHandler() {
    try {
      await this.saveHandler()

      if (this.worker.countryOfBirth && this.worker.countryOfBirth.value === "United Kingdom") {
        this.router.navigate([`/worker/recruited-from/${this.workerId}`])

      } else {
        this.router.navigate([`/worker/year-arrived-uk/${this.workerId}`])
      }

    } catch (err) {
      // keep typescript transpiler silent
    }
  }

  goBack(event) {
    event.preventDefault()

    if (this.worker.nationality && this.worker.nationality.value === "British") {
      this.router.navigate([`/worker/nationality/${this.workerId}`])

    } else {
      this.router.navigate([`/worker/british-citizenship/${this.workerId}`])
    }
  }

  saveHandler() {
    return new Promise((resolve, reject) => {
      const { cobName, cobKnown } = this.form.controls
      this.messageService.clearError()

      if (this.form.valid) {
        if (cobKnown.value) {
          this.worker.countryOfBirth = { value: cobKnown.value }

          if (cobName.value) {
            this.worker.countryOfBirth.other = {
              country: `${cobName.value.charAt(0).toUpperCase()}${cobName.value.slice(1)}`
            }
          }
        }

        this.subscriptions.push(this.workerService.setWorker(this.worker).subscribe(resolve, reject))

      } else {
        if (cobName.errors) {
          if (Object.keys(cobName.errors).includes("required")) {
            this.messageService.show("error", "Country must be provided.")

          } else if (Object.keys(cobName.errors).includes("validCob")) {
            this.messageService.show("error", "Invalid country of birth.")
          }
        }

        reject()
      }
    })
  }

  cobKnownChangeHandler() {
    this.form.controls.cobName.reset()
  }

  cobNameValidator() {
    if (this.form && this.availableOtherCountries) {
      const { cobKnown } = this.form.value
      const cobName = this.form.controls.cobName.value

      if (cobKnown === "Other") {
        if (cobName) {
          const cobNameLowerCase = cobName.toLowerCase()
          return this.availableOtherCountries.some(c => c.country.toLowerCase() === cobNameLowerCase)
            ? null : { validCob: true }

        } else {
          return { required: true }
        }
      }
    }

    return null
  }

  cobNameFilter(): string[] {
    const { cobName } = this.form.value

    if (this.availableOtherCountries && cobName && cobName.length) {
      const cobNameLowerCase = cobName.toLowerCase()
      return this.availableOtherCountries
        .filter(c => c.country.toLowerCase().startsWith(cobNameLowerCase))
        .filter(c => c.country.toLowerCase() !== cobNameLowerCase)
        .map(c => c.country)
    }

    return []
  }

  ngOnInit() {
    this.form = this.formBuilder.group({
      cobKnown: null,
      cobName: [null, this.cobNameValidator]
    })

    const params = this.route.snapshot.paramMap
    this.workerId = params.has("id") ? params.get("id") : null

    if (this.workerId) {
      this.subscriptions.push(
        this.workerService.getWorker(this.workerId).subscribe(worker => {
          this.worker = worker

          if (worker.countryOfBirth) {
            const { value, other } = worker.countryOfBirth

            this.form.patchValue({
              cobKnown: value,
              cobName: other ? other.country : null
            })
          }
        })
      )
    }

    this.subscriptions.push(
      this.countryService.getCountries().subscribe(res => this.availableOtherCountries = res)
    )
  }

  ngOnDestroy() {
    this.subscriptions.forEach(s => s.unsubscribe())
    this.messageService.clearAll()
  }
}
