import { Component } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { WorkersWithPayDataResponse } from '@core/model/worker.model';
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
  public firstPageWorkers: WorkersWithPayDataResponse['workers'];
  public allWorkersCount: number;
  public workers: Worker;

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
    this.firstPageWorkers = this.route.snapshot.data.firstPageWorkers?.workers ?? [];
    this.allWorkersCount = this.route.snapshot.data.firstPageWorkers?.count;
  }
}
