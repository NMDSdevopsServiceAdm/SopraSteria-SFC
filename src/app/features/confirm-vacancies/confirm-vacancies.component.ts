import { Component, OnInit, OnDestroy } from '@angular/core'
import { Router } from "@angular/router"

import { map } from 'rxjs/operators'

import { EstablishmentService } from "../../core/services/establishment.service"

@Component({
  selector: 'app-confirm-vacancies',
  templateUrl: './confirm-vacancies.component.html',
  styleUrls: ['./confirm-vacancies.component.scss']
})
export class ConfirmVacanciesComponent implements OnInit, OnDestroy {
  private subscriptions = []

  total: number

  constructor(private router: Router, private establishmentService: EstablishmentService) { }

  makeChangeHandler() {
    this.router.navigate(["/vacancies"])
  }

  submitHandler() {
    this.router.navigate(["/starters"])
  }

  ngOnInit() {
    this.subscriptions.push(
      this.establishmentService.getJobs()
        .pipe(map(jobs => jobs.TotalVacencies))
        .subscribe(total => this.total = total))
  }

  ngOnDestroy() {
    this.subscriptions.forEach(s => s.unsubscribe())
  }
}
