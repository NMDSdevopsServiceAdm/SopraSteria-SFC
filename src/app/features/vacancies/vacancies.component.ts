import { Component, Input, OnInit, OnDestroy } from "@angular/core"
import { FormGroup, FormBuilder, Validators, FormArray } from "@angular/forms"
import { Router } from "@angular/router"

import { MessageService } from "../../core/services/message.service"
import { JobService } from "../../core/services/job.service"
import { EstablishmentService } from "../../core/services/establishment.service"
import { Job } from "../../core/model/job.model"

@Component({
  selector: "app-vacancies",
  templateUrl: "./vacancies.component.html"
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

  form: FormGroup
  total: number = 0
  jobsAvailable: Job[] = []

  private subscriptions = []

  noRecordsReasons = [
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
    const { recordsControl, noRecordsReason } = this.form.controls

    if (noRecordsReason.value === "dont-know") {
      this.router.navigate(["/starters"])

    } else {
      if (this.form.valid || noRecordsReason.value === "no-staff") {
        const vacanciesFromForm = this.form.valid ? this.form.controls.recordsControl.value : []
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
    const recordsControl = <FormArray> this.form.controls.recordsControl
    const thisVacancy = recordsControl.controls[idx]
    return this.jobsAvailable.filter(j => !recordsControl.controls.some(v => v !== thisVacancy && parseFloat(v.value.jobId) === j.id))
  }

  addVacancy(): void {
    const recordsControl = <FormArray> this.form.controls.recordsControl

    recordsControl.push(
      this.createVacancyControlItem()
    )
  }

  isJobsNotTakenLeft() {
    return this.jobsAvailable.length !== this.form.controls.recordsControl.value.length
  }

  removeVacancy(index): void {
    (this.form.controls.recordsControl as FormArray).removeAt(index)
  }

  validatorRecordTotal(control) {
    return control.value !== null || this.form.controls.noRecordsReason.value.length ?
      {} : { "total": true }
  }

  validatorRecordJobId(control) {
    return control.value !== null || this.form.controls.noRecordsReason.value.length ?
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

    this.form = this.fb.group({
      recordsControl: this.fb.array([]),
      noRecordsReason: ""
    })

    const recordsControl = <FormArray> this.form.controls.recordsControl

    this.subscriptions.push(
      this.establishmentService.getVacancies().subscribe(vacancies => {
        if (vacancies.length) {
          vacancies.forEach(v => recordsControl.push(this.createVacancyControlItem(v.jobId.toString(), v.total)))

        } else {
          recordsControl.push(this.createVacancyControlItem())
        }
      })
    )

    this.total = this.calculateTotal(recordsControl.value)

    this.subscriptions.push(
      recordsControl.valueChanges.subscribe(value => {
        this.total = this.calculateTotal(value)

        if (document.activeElement && document.activeElement.getAttribute("type") !== "radio") {
          this.form.patchValue({
            noRecordsReason: ""
          }, { emitEvent: false })
        }
      })
    )

    this.subscriptions.push(
      this.form.controls.noRecordsReason.valueChanges.subscribe(() => {
        while (recordsControl.length > 1) {
          recordsControl.removeAt(1)
        }

        recordsControl.reset([], { emitEvent: false })
        this.total = 0
      })
    )

    this.subscriptions.push(
      this.form.valueChanges.subscribe(() => {
        this.messageService.clearAll()
      })
    )
  }

  ngOnDestroy() {
    this.subscriptions.forEach(s => s.unsubscribe())
    this.messageService.clearAll()
  }
}
