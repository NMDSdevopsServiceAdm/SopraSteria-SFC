import { Component } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { WorkerWithPayData, WorkersWithPayDataResponse } from '@core/model/worker.model';
import { AlertService } from '@core/services/alert.service';
import { BackLinkService } from '@core/services/backLink.service';
import { EstablishmentService } from '@core/services/establishment.service';
import { WorkerService } from '@core/services/worker.service';

const radioButtonLabels = [
  {
    label: 'Hourly',
    value: 'Hourly',
    slug: 'hourly',
  },
  {
    label: 'Salary',
    value: 'Annually',
    slug: 'annually',
  },
  {
    label: 'Not known',
    value: "Don't know",
    slug: 'dont-know',
  },
];

@Component({
  selector: 'app-update-pay-for-multiple-staff',
  templateUrl: './update-pay-for-multiple-staff.component.html',
  styleUrl: './update-pay-for-multiple-staff.component.scss',
  standalone: false,
})
export class UpdatePayForMultipleStaffComponent {
  public form: UntypedFormGroup;
  public firstPageWorkers: WorkerWithPayData[];
  public allWorkersCount: number;
  public workersToShow: WorkerWithPayData[];
  public workerUpdated: WorkerWithPayData[];
  public radioButtonLabels = radioButtonLabels;

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

    this.workersToShow = this.firstPageWorkers;
  }

  public handleClickForFastTrackPageLink(): void {
    this.router.navigate(['../fast-track-pay-updates'], { relativeTo: this.route });
  }
}
