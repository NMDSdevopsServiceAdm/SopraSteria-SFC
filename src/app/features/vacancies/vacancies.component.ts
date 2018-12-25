import { Component, Input, OnInit, OnDestroy } from "@angular/core"
import { FormGroup, FormBuilder, Validators, AbstractControl, ValidatorFn, FormArray } from "@angular/forms"
import { Router } from "@angular/router"

import { JobService } from "../../core/services/job.service"
import { Job } from "../../core/model/job.model"

@Component({
  selector: "app-vacancies",
  templateUrl: "./vacancies.component.html",
  styleUrls: ["./vacancies.component.scss"]
})
export class VacanciesComponent implements OnInit, OnDestroy {
  constructor(private fb: FormBuilder, private router: Router, private jobService: JobService) { }

  vacanciesForm: FormGroup
  total: number = 0

  subscriptions = []
  jobsAvailable: Job[] = []

  noVacanciesReasonOptions = [
    {
      label: "There are no curret staff vacancies.",
      value: "no-staff"
    },
    {
      label: "I don't know how many current staff vacancies there are.",
      value: "dont-know"
    }
  ]

  submitHandler(): void {
    const { vacancyControl, noVacanciesReason } = this.vacanciesForm.controls

    if (noVacanciesReason.value === "dont-know") {
      this.router.navigate(["/starters"])

    } else if (this.vacanciesForm.valid || noVacanciesReason.value === "no-staff") {
      this.jobService.currentVacancies.next(this.vacanciesForm)
      this.router.navigate(["/confirm-vacancies"])

    } else {
      // TODO handle validation errors
    }
  }

  jobsLeft(idx) {
    const vacancyControl = <FormArray> this.vacanciesForm.controls.vacancyControl
    const thisVacancy = vacancyControl.controls[idx]

    return this.jobsAvailable.filter(j => !vacancyControl.controls.some(v => v !== thisVacancy && parseInt(v.value.vacancy) === j.id))
  }

  addVacancy(): void {
    const vacancyControl = <FormArray> this.vacanciesForm.controls.vacancyControl

    vacancyControl.push(
      this.createVacancyControlItem()
    )
  }

  isJobsNotTakenLeft() {
    return this.jobsAvailable.length !== this.vacanciesForm.controls.vacancyControl.value.length
  }

  removeVacancy(index): void {
    (<FormArray> this.vacanciesForm.controls.vacancyControl).removeAt(index)
  }

  createVacancyControlItem(): FormGroup {
    return this.fb.group({
      vacancy: ["", Validators.required],
      amount: ["", Validators.required]
    })
  }

  calculateTotal(vacancies) {
    return vacancies.reduce((acc, i) => acc += parseInt(i.amount) || 0, 0) || 0
  }

  ngOnInit() {
    this.subscriptions.push(this.jobService.getJobs().subscribe(jobs => this.jobsAvailable = jobs))

    if (Object.keys(this.jobService.currentVacancies.value.controls).length === 0) {
      this.vacanciesForm = this.fb.group({
        vacancyControl: this.fb.array([
          this.createVacancyControlItem()
        ]),
        noVacanciesReason: ""
      })
    } else {
      this.vacanciesForm = this.jobService.currentVacancies.value
      this.total = this.calculateTotal(this.vacanciesForm.controls.vacancyControl.value)
    }

    this.vacanciesForm.controls.vacancyControl.valueChanges.subscribe(value => {
      this.total = this.calculateTotal(value)
      this.vacanciesForm.patchValue({
        noVacanciesReason: ""
      }, { emitEvent: false })
    })

    this.vacanciesForm.controls.noVacanciesReason.valueChanges.subscribe(value => {
      const vacancyControl = <FormArray> this.vacanciesForm.controls.vacancyControl
      for (let i = 1; i < vacancyControl.length; i++) {
        vacancyControl.removeAt(i)
      }
      vacancyControl.reset({}, { emitEvent: false })
      this.total = 0
    })
  }

  ngOnDestroy() {
    this.subscriptions.forEach(s => s.unsubscribe())
  }
}
