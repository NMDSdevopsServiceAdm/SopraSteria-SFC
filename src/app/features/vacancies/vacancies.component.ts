import { Component, Input, OnInit, OnDestroy } from "@angular/core"
import { FormGroup, FormBuilder, Validators, FormArray } from "@angular/forms"
import { Router } from "@angular/router"

import { MessageService } from "../../core/services/message.service"
import { JobService } from "../../core/services/job.service"
import { EstablishmentService } from "../../core/services/establishment.service"
import { Job } from "../../core/model/job.model"

@Component({
  selector: "app-vacancies",
  templateUrl: "./vacancies.component.html",
  styleUrls: ["./vacancies.component.scss"]
})
export class VacanciesComponent implements OnInit, OnDestroy {
  constructor(
    private fb: FormBuilder,
    private router: Router,
    private jobService: JobService,
    private establishmentService: EstablishmentService,
    private messageService: MessageService) {
    this.validatorRecordTotal = this.validatorRecordTotal.bind(this)
    this.validatorRecordJobId = this.validatorRecordJobId.bind(this)
  }

  vacanciesForm: FormGroup
  total: number = 0
  jobsAvailable: Job[] = []

  private subscriptions = []

  noVacanciesReasonOptions = [
    {
      label: "There are no current staff vacancies.",
      value: "no-staff"
    },
    {
      label: "I don't know how many current staff vacancies there are.",
      value: "dont-know"
    }
  ]

  goBack(event) {
    event.preventDefault()
    this.subscriptions.push(
      this.establishmentService.getSharingOptions()
        .subscribe(res => {
          if (res.share.enabled && res.share.with && res.share.with.includes("Local Authority")) {
            this.router.navigate(["/share-local-authority"])

          } else {
            this.router.navigate(["/share-options"])
          }
        })
    )
  }

  submitHandler(): void {
    const { vacancyControl, noVacanciesReason } = this.vacanciesForm.controls

    if (noVacanciesReason.value === "dont-know") {
      this.router.navigate(["/starters"])

    } else {
      if (this.vacanciesForm.valid || noVacanciesReason.value === "no-staff") {
        const vacanciesFromForm = this.vacanciesForm.valid ? this.vacanciesForm.controls.vacancyControl.value : []
        const vacancies = vacanciesFromForm.map(v => ({ jobId: parseFloat(v.jobId), total: v.total }));

        this.subscriptions.push(
          this.establishmentService.postVacancies(vacancies)
            .subscribe(() => {
              this.router.navigate(["/confirm-vacancies"])
            }))

      } else {
        this.messageService.clearError()
        this.messageService.show("error", "Please fill the required fields.")
      }
    }
  }

  jobsLeft(idx) {
    const vacancyControl = <FormArray> this.vacanciesForm.controls.vacancyControl
    const thisVacancy = vacancyControl.controls[idx]
    return this.jobsAvailable.filter(j => !vacancyControl.controls.some(v => v !== thisVacancy && parseFloat(v.value.jobId) === j.id))
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

  validatorRecordTotal(control) {
    return control.value !== null || this.vacanciesForm.controls.noVacanciesReason.value.length ?
      {} : { "total": true }
  }

  validatorRecordJobId(control) {
    return control.value !== null || this.vacanciesForm.controls.noVacanciesReason.value.length ?
      {} : { "jobId": true }
  }

  createVacancyControlItem(jobId=null, total=null): FormGroup {
    return this.fb.group({
      jobId: [jobId, this.validatorRecordJobId],
      total: [total, this.validatorRecordTotal]
    })
  }

  calculateTotal(vacancies) {
    return vacancies.reduce((acc, i) => acc += parseInt(i.total) || 0, 0) || 0
  }

  ngOnInit() {
    this.subscriptions.push(this.jobService.getJobs().subscribe(jobs => this.jobsAvailable = jobs))

    this.vacanciesForm = this.fb.group({
      vacancyControl: this.fb.array([]),
      noVacanciesReason: ""
    })

    const vacancyControl = <FormArray> this.vacanciesForm.controls.vacancyControl

    this.subscriptions.push(
      this.establishmentService.getVacancies().subscribe(vacancies => {
        if (vacancies.length) {
          vacancies.forEach(v => vacancyControl.push(this.createVacancyControlItem(v.jobId.toString(), v.total)))

        } else {
          vacancyControl.push(this.createVacancyControlItem())
        }
      })
    )

    this.total = this.calculateTotal(vacancyControl.value)

    this.subscriptions.push(
      vacancyControl.valueChanges.subscribe(value => {
        this.total = this.calculateTotal(value)

        if (document.activeElement && document.activeElement.getAttribute("type") !== "radio") {
          this.vacanciesForm.patchValue({
            noVacanciesReason: ""
          }, { emitEvent: false })
        }
      })
    )

    this.subscriptions.push(
      this.vacanciesForm.controls.noVacanciesReason.valueChanges.subscribe(() => {
        while (vacancyControl.length > 1) {
          vacancyControl.removeAt(1)
        }

        vacancyControl.reset([], { emitEvent: false })
        this.total = 0
      })
    )

    this.subscriptions.push(
      this.vacanciesForm.valueChanges.subscribe(() => {
        this.messageService.clearAll()
      })
    )
  }

  ngOnDestroy() {
    this.subscriptions.forEach(s => s.unsubscribe())
    this.messageService.clearAll()
  }
}
