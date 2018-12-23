import { Component, OnInit } from '@angular/core';

import { JobService } from "../../core/services/job.service"

@Component({
  selector: 'app-confirm-vacancies',
  templateUrl: './confirm-vacancies.component.html',
  styleUrls: ['./confirm-vacancies.component.scss']
})
export class ConfirmVacanciesComponent implements OnInit {

  constructor(private jobService: JobService) { }

  private total = 0
  
  submitHandler() {
      // this.establishmentService.postStaff(establishmentId, 0)
      // jobService.currentVacancies.onNext(vacanciesForm)

      // in confirm
      // if no current staff -> send empty [] as vacancies
      // I don't know -> skip to next step
  }

  ngOnInit() {
    const vacancies = this.jobService.currentVacancies.value
  }
}
