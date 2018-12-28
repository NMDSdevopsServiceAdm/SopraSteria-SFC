import { Component, OnInit, OnDestroy } from '@angular/core'
import { Router } from "@angular/router"
import { map } from 'rxjs/operators'

import { EstablishmentService } from "../../core/services/establishment.service"

@Component({
  selector: 'app-confirm-leavers',
  templateUrl: './confirm-leavers.component.html',
  styleUrls: ['./confirm-leavers.component.scss']
})
export class ConfirmLeaversComponent implements OnInit, OnDestroy {
  private subscriptions = []

  total: number

  constructor(private router: Router, private establishmentService: EstablishmentService) { }

  makeChangeHandler() {
    this.router.navigate(["/leavers"])
  }

  submitHandler() {
    this.router.navigate(["/staff"])
  }

  ngOnInit() {
    this.subscriptions.push(
      this.establishmentService.getJobs()
        .pipe(map(jobs => jobs.TotalLeavers))
        .subscribe(total => this.total = total))
  }

  ngOnDestroy() {
    this.subscriptions.forEach(s => s.unsubscribe())
  }
}
