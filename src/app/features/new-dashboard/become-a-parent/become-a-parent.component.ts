import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ParentRequestsService } from '@core/services/parent-requests.service';
import { Establishment } from '@core/model/establishment.model';
import { EstablishmentService } from '@core/services/establishment.service';
import { BreadcrumbService } from '@core/services/breadcrumb.service';
import { JourneyType } from '@core/breadcrumb/breadcrumb.model';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-become-a-parent',
  templateUrl: './become-a-parent.component.html',
  styleUrls: ['./become-a-parent.component.scss'],
})
export class BecomeAParentComponent implements OnInit, OnDestroy {
  protected subscriptions: Subscription = new Subscription();
  public workplace: Establishment;

  constructor(
    private parentRequestsService: ParentRequestsService,
    private router: Router,
    protected route: ActivatedRoute,
    private breadcrumbService: BreadcrumbService,
    private establishmentService: EstablishmentService,
  ) {}

  public async ngOnInit(): Promise<void> {
    this.workplace = this.establishmentService.primaryWorkplace;
    this.breadcrumbService.show(JourneyType.BECOME_A_PARENT, this.workplace.name);
  }

  public sendRequestToBecomeAParent() {
    this.subscriptions.add(
      this.parentRequestsService.becomeParent().subscribe((data) => {
        if (data) {
          this.router.navigate(['/dashboard'], {
            state: {
              parentRequestMessage: `You’ve sent a request to become a parent workplace.`,
            },
          });
        }
      }),
    );
  }

  public ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
}
