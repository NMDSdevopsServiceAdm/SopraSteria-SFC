import { Component } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { WorkerPayData, WorkersWithPayDataResponse } from '@core/model/worker.model';
import { AlertService } from '@core/services/alert.service';
import { BackLinkService } from '@core/services/backLink.service';
import { EstablishmentService } from '@core/services/establishment.service';
import { WorkerService } from '@core/services/worker.service';

@Component({
  selector: 'app-update-pay-for-multiple-staff',
  templateUrl: './update-pay-for-multiple-staff.component.html',
  styleUrl: './update-pay-for-multiple-staff.component.scss',
  standalone: false,
})
export class UpdatePayForMultipleStaffComponent {
  public form: UntypedFormGroup;
  public firstPageWorkers: WorkerPayData[];
  public allWorkersCount: number;
  public workersToShow: WorkerPayData[];
  public workerUpdated: WorkerPayData[];

  constructor(
    private formBuilder: UntypedFormBuilder,
    private establishmentService: EstablishmentService,
    private workerService: WorkerService,
    private backLinkService: BackLinkService,
    private router: Router,
    private alertService: AlertService,
    private route: ActivatedRoute,
  ) {}

  ngOnInit() {
    this.firstPageWorkers = this.route.snapshot.data.workersWithPayData?.workers ?? [];
    this.allWorkersCount = this.route.snapshot.data.workersWithPayData?.count;
  }

  public handleClickForFastTrackPageLink(): void {
    this.router.navigate(['../fast-track-pay-updates'], { relativeTo: this.route });
  }
}
