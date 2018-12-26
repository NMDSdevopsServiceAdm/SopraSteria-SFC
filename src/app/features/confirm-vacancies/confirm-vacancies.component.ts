import { Component, OnInit, OnDestroy } from '@angular/core'
import { FormArray } from "@angular/forms"
import { Router } from "@angular/router"

import { map } from 'rxjs/operators'

import { JobService } from "../../core/services/job.service"
import { EstablishmentService } from "../../core/services/establishment.service"
import { MessageService } from "../../core/services/message.service"
import { Vacancy } from "../../core/model/vacancy.model"

@Component({
  selector: 'app-confirm-vacancies',
  templateUrl: './confirm-vacancies.component.html',
  styleUrls: ['./confirm-vacancies.component.scss']
})
export class ConfirmVacanciesComponent implements OnInit, OnDestroy {
  private vacancies: Vacancy[]
  private subscriptions = []

  constructor(private router: Router, private jobService: JobService, private establishmentService: EstablishmentService, private messageService: MessageService) { }

  makeChangeHandler() {
    this.router.navigate(["/vacancies"])
  }

  submitHandler() {
    this.messageService.clearError()

    // TODO call API with data
    this.router.navigate(["/starters"])

    // this.establishmentService.postJobs(this.vacancies, 0)
    // .subscribe(() => this.router.navigate(["/starters"]))
    // jobService.currentVacancies.onNext(vacanciesForm)

    // in confirm
    // if no current staff -> send empty [] as vacancies
    // I don't know -> skip to next step
  }

  getTotal() {
    return this.vacancies.reduce((acc, i) => acc += parseInt(i.total) || 0, 0) || 0
  }

  ngOnInit() {
    this.subscriptions.push(this.jobService.currentVacanciesForm.pipe(
      map(v => v.controls.vacancyControl.value)
    ).subscribe(vacancies => this.vacancies = vacancies))
  }

  ngOnDestroy() {
    this.subscriptions.forEach(s => s.unsubscribe())
  }
}
