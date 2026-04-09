import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { BackLinkService } from '@core/services/backLink.service';

import { UntypedFormArray, UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { Establishment } from '@core/model/establishment.model';
import { WorkersGroupedByJobRoleResponse } from '@core/model/worker.model';
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
  @ViewChild('formEl') formEl: ElementRef;
  public form: UntypedFormGroup;
  public workplace: Establishment;
  public workersByJobRole: WorkersGroupedByJobRoleResponse;
  public totalCount: number;
  public filteredGroups: any;
  public jobRoleIndex: number;
  public jobRoleChanged: any;
  public submitted: boolean;

  constructor(
    private backLinkService: BackLinkService,
    private formBuilder: UntypedFormBuilder,
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
    this.jobRoleIndex = this.route.snapshot.queryParams['index'];
    this.jobRoleChanged = this.workersByJobRole?.groups[this.jobRoleIndex];
    this.filteredGroups = this.workersByJobRole?.groups
      .map((group, index) => ({ ...group, originalIndex: index }))
      .filter((group) => group.annualHourlyPay?.rate != null);

    this.totalCount = this.filteredGroups?.reduce((sum, group) => sum + group.count, 0);

    this.setupForm();
  }

  private setBackLink(): void {
    this.backLinkService.showBackLink();
  }

  private setupForm(): void {
    this.form = this.formBuilder.group({
      workers: this.formBuilder.array([]),
    });

    const workersFormArray = this.form.get('workers') as UntypedFormArray;

    this.workersByJobRole.groups.forEach((group) => {
      workersFormArray.push(
        this.formBuilder.group({
          workerId: group.jobId,
          value: group.annualHourlyPay?.value || null,
          rate: group.annualHourlyPay?.rate || null,
        }),
      );
    });
  }

  public onSubmit(): void {
    this.submitted = true;

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
    this.router.navigate(['/workplace', this.workplace.uid, 'update-pay-multiple-staff']).then(() => {
      this.alertService.addAlert({
        type: 'success',
        message: 'Pay updated in ' + this.totalCount + ' staff record' + (this.totalCount === 1 ? '' : 's') + '',
      });
    });
  }
}
