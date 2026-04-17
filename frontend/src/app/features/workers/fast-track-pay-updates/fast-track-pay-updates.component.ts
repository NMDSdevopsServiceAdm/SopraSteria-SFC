import { Component, ElementRef, ViewChild, OnInit } from '@angular/core';
import { BackLinkService } from '@core/services/backLink.service';
import { WorkerService } from '@core/services/worker.service';
import { Establishment } from '@core/model/establishment.model';
import { WorkersGroupedByJobRoleResponse } from '@core/model/worker.model';
import { ActivatedRoute, Router } from '@angular/router';
import { UntypedFormArray, UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';

@Component({
  selector: 'app-fast-track-pay-updates',
  templateUrl: './fast-track-pay-updates.component.html',
  standalone: false,
})
export class FastTrackPayUpdatesComponent implements OnInit {
  @ViewChild('formEl') formEl: ElementRef;
  public form: UntypedFormGroup;
  public workplace: Establishment;
  public workersByJobRole: WorkersGroupedByJobRoleResponse;

  constructor(
    private backLinkService: BackLinkService,
    private formBuilder: UntypedFormBuilder,
    private route: ActivatedRoute,
    private workerService: WorkerService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.setBackLink();
    this.workplace = this.route.snapshot.data.establishment;
    this.workersByJobRole = this.route.snapshot.data.workersByJobRole;

    let serviceData = this.workerService.getWorkersGroupedByJobRole();

    if (!serviceData || !serviceData.groups) {
      serviceData = this.route.snapshot.data.workersByJobRole;
      this.workerService.setWorkersGroupedByJobRole({ groups: serviceData.groups });
    }
    this.workersByJobRole = serviceData;

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
    const workersFormValues = this.form.get('workers').value;

    const updatedWorkers = this.workersByJobRole.groups.map((group, index) => {
      const formEntry = workersFormValues[index];
      return {
        ...group,
        annualHourlyPay: {
          value: formEntry.value,
          rate: formEntry.rate,
        },
      };
    });

    this.workerService.setWorkersGroupedByJobRole({ groups: updatedWorkers });

    const hasAtLeastOneRate = updatedWorkers.some((group) => group.annualHourlyPay?.rate != null);

    if (hasAtLeastOneRate) {
      this.router.navigate(['../fast-track-confirmation-page'], { relativeTo: this.route });
    } else {
      this.router.navigate(['/workplace', this.workplace.uid, 'update-pay-multiple-staff']);
    }
  }
}
