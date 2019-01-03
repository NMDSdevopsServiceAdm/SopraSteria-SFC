import { Component, OnInit, OnDestroy } from '@angular/core'
import { Router } from "@angular/router"
import { map } from 'rxjs/operators'

import { EstablishmentService } from "../../core/services/establishment.service"

@Component({
  selector: 'app-confirm-starters',
  templateUrl: './confirm-starters.component.html',
  styleUrls: ['./confirm-starters.component.scss']
})
export class ConfirmStartersComponent implements OnInit, OnDestroy {
  private subscriptions = []

  total: number

  constructor(private router: Router, private establishmentService: EstablishmentService) { }

  makeChangeHandler() {
    this.router.navigate(["/starters"])
  }

  submitHandler() {
    this.router.navigate(["/leavers"])
  }

  ngOnInit() {
    this.subscriptions.push(
      this.establishmentService.getJobs()
        .pipe(map(jobs => jobs.TotalStarters))
        .subscribe(total => this.total = total))
  }

  ngOnDestroy() {
    this.subscriptions.forEach(s => s.unsubscribe())
  }
}
