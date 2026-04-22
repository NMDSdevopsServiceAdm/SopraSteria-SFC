import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { BackLinkService } from '@core/services/backLink.service';

import { UntypedFormGroup } from '@angular/forms';
import { Establishment } from '@core/model/establishment.model';
import { WorkersGroupedByJobRoleResponse, WorkersGroupedByJobRoleWithIndex } from '@core/model/worker.model';
import { ActivatedRoute, Router } from '@angular/router';
import { WorkerService } from '@core/services/worker.service';
import { AlertService } from '@core/services/alert.service';
import { EstablishmentService } from '@core/services/establishment.service';

@Component({
  selector: 'app-fast-track-confirmation-page',
  templateUrl: './fast-track-confirmation-page.component.html',
  standalone: false,
})
export class FastTrackConfirmationPageComponent implements OnInit {
  public workplace: Establishment;
  public workersByJobRole: WorkersGroupedByJobRoleResponse;
  public totalCount: number;
  public filteredGroups: WorkersGroupedByJobRoleWithIndex[];

  constructor(
    private backLinkService: BackLinkService,
    private route: ActivatedRoute,
    private router: Router,
    private workerService: WorkerService,
    private alertService: AlertService,
    private establishmentService: EstablishmentService,
  ) {}

  ngOnInit(): void {
    this.setBackLink();
    this.workplace = this.route.snapshot.data.establishment;
    this.workersByJobRole = this.workerService.getWorkersGroupedByJobRole();
    this.filteredGroups = this.workersByJobRole?.groups
      .map((group, index) => ({ ...group, originalIndex: index }))
      .filter((group) => group.annualHourlyPay?.rate !== null);

    this.totalCount = this.filteredGroups?.reduce((sum, group) => sum + group.count, 0);
  }

  private setBackLink(): void {
    this.backLinkService.showBackLink();
  }

  public onSubmit(): void {
    this.establishmentService
      .updateWorkers(this.workplace.uid, this.workerPayByJobRole())
      .subscribe(() => this.onSubmitSuccess());
  }

  private workerPayByJobRole() {
    const payload = this.workersByJobRole?.groups
      .filter((group) => group.annualHourlyPay?.rate != null)
      .flatMap((group) =>
        group.workers.map((worker) => ({
          uid: worker.uid,
          annualHourlyPay: group.annualHourlyPay,
        })),
      );

    return payload;
  }

  private onSubmitSuccess(): void {
    this.router
      .navigate(['/workplace', this.workplace.uid, 'staff-record', 'update-pay-for-multiple-staff'])
      .then(() => {
        this.alertService.addAlert({
          type: 'success',
          message: 'Pay updated in ' + this.totalCount + ' staff record' + (this.totalCount === 1 ? '' : 's') + '',
        });
      });
  }
}
