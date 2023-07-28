import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Establishment } from '@core/model/establishment.model';
import { EstablishmentService } from '@core/services/establishment.service';
import { BreadcrumbService } from '@core/services/breadcrumb.service';

import { Subscription } from 'rxjs';

@Component({
  selector: 'app-become-a-parent',
  templateUrl: './become-a-parent.component.html',
})
export class BecomeAParentComponent implements OnInit {
  protected subscriptions: Subscription = new Subscription();
  public workplace: Establishment;

  constructor(
    protected router: Router,
    protected route: ActivatedRoute,

    private establishmentService: EstablishmentService,
  ) {}

  public async ngOnInit(): Promise<void> {
    this.workplace = this.establishmentService.primaryWorkplace;
  }
}
