import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Establishment } from '@core/model/establishment.model';
import { Worker } from '@core/model/worker.model';
import { AlertService } from '@core/services/alert.service';
import { BackLinkService } from '@core/services/backLink.service';
import { EstablishmentService } from '@core/services/establishment.service';
import { PermissionsService } from '@core/services/permissions/permissions.service';
import { Reason, WorkerService } from '@core/services/worker.service';
import { Subscription } from 'rxjs';
import { take } from 'rxjs/operators';

@Component({
  selector: 'app-delete-staff-record',
  templateUrl: './delete-staff-record.component.html',
  styleUrls: ['./delete-staff-record.component.scss'],
})
export class DeleteStaffRecordComponent implements OnInit {
  @ViewChild('formEl') formEl: ElementRef;

  public form: UntypedFormGroup;
  public submitted: boolean;
  public worker: Worker;
  public workplace: Establishment;
  public reasons: Reason[];
  private subscriptions: Subscription = new Subscription();

  constructor(
    private alertService: AlertService,
    private establishmentService: EstablishmentService,
    private permissionsService: PermissionsService,
    private route: ActivatedRoute,
    private router: Router,
    private workerService: WorkerService,
    private formBuilder: UntypedFormBuilder,
    protected backLinkService: BackLinkService,
  ) {}

  ngOnInit(): void {
    this.subscriptions.add(
      this.workerService.worker$.pipe(take(1)).subscribe((worker) => {
        this.worker = worker;
      }),
    );

    this.subscriptions.add(
      this.workerService.getLeaveReasons().subscribe((reasons) => {
        this.reasons = reasons;
      }),
    );
    this.setupForm();
  }

  private setupForm(): void {
    this.form = this.formBuilder.group({
      reason: null,
      confirmDelete: [null],
    });
  }

  public onSubmit(): void {}
}
