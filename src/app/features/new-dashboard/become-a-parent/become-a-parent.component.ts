import { Component, OnInit, OnDestroy, Output } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AlertService } from '@core/services/alert.service';
import { ParentRequestsService } from '@core/services/parent-requests.service';
import { Establishment } from '@core/model/establishment.model';
import { EstablishmentService } from '@core/services/establishment.service';
//import { BreadcrumbService } from '@core/services/breadcrumb.service';

import { Subscription } from 'rxjs';

@Component({
  selector: 'app-become-a-parent',
  templateUrl: './become-a-parent.component.html',
})
export class BecomeAParentComponent implements OnInit, OnDestroy {
  protected subscriptions: Subscription = new Subscription();
  public workplace: Establishment;

  constructor(
    private parentRequestsService: ParentRequestsService,
    private alertService: AlertService,
    private router: Router,
    protected route: ActivatedRoute,

    private establishmentService: EstablishmentService,
  ) {}

  public async ngOnInit(): Promise<void> {
    this.workplace = this.establishmentService.primaryWorkplace;
  }

  public sendRequestToBecomeAParent() {
    this.subscriptions.add(
      this.parentRequestsService.becomeParent().subscribe((data) => {
        if (data) {
          this.router.navigate(['/dashboard']);
          this.alertService.addAlert({
            type: 'success',
            message: `You’ve sent a request to become a parent workplace.`,
          });

        }
      }),
    );
  }

  public ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
}
