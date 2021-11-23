import { I18nPluralPipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { JourneyType } from '@core/breadcrumb/breadcrumb.model';
import { Establishment } from '@core/model/establishment.model';
import { URLStructure } from '@core/model/url.model';
import { Worker } from '@core/model/worker.model';
import { AlertService } from '@core/services/alert.service';
import { BackService } from '@core/services/back.service';
import { BreadcrumbService } from '@core/services/breadcrumb.service';
import { BulkUploadService } from '@core/services/bulk-upload.service';
import { ErrorSummaryService } from '@core/services/error-summary.service';
import { EstablishmentService } from '@core/services/establishment.service';
import { WorkerService } from '@core/services/worker.service';
import orderBy from 'lodash/orderBy';
import { Subscription } from 'rxjs';
import { take } from 'rxjs/operators';

import { BulkUploadReferencesDirective } from '../bulk-upload-references.directive';

@Component({
  selector: 'app-bu-staff-references-page',
  templateUrl: 'staff-references.component.html',
  styleUrls: ['../references.component.scss'],
  providers: [I18nPluralPipe],
})
export class StaffReferencesComponent extends BulkUploadReferencesDirective implements OnInit {
  private primaryWorkplace: Establishment;
  private subscriptions: Subscription = new Subscription();
  public return: URLStructure = { url: ['/bulk-upload', 'workplace-references'] };
  private establishmentUid: string;
  public workplaceName: string;

  constructor(
    private activatedRoute: ActivatedRoute,
    protected establishmentService: EstablishmentService,
    protected bulkUploadService: BulkUploadService,
    protected backService: BackService,
    protected errorSummaryService: ErrorSummaryService,
    protected formBuilder: FormBuilder,
    protected router: Router,
    private breadcrumbService: BreadcrumbService,
    private workerService: WorkerService,
    protected alertService: AlertService,
  ) {
    super(errorSummaryService, formBuilder, alertService, backService, router);
  }

  ngOnInit(): void {
    this.breadcrumbService.show(JourneyType.BULK_UPLOAD);
    this.primaryWorkplace = this.establishmentService.primaryWorkplace;
    this.establishmentUid = this.activatedRoute.snapshot.paramMap.get('uid');
    this.references = this.activatedRoute.snapshot.data.references;

    this.references = orderBy(
      this.activatedRoute.snapshot.data.references,
      [(worker: Worker) => worker.nameOrId.toLowerCase()],
      ['asc'],
    );
    this.setupForm();
    this.setWorkerServerErrors();
    this.getWorkplaceName();
  }

  private getWorkplaceName(): void {
    this.workplaceName = this.activatedRoute.snapshot.data.workplaceReferences.find(
      ({ uid }) => uid === this.establishmentUid,
    ).name;
  }

  protected save(): void {
    this.subscriptions.add(
      this.workerService
        .updateLocalIdentifiers(this.establishmentUid, this.generateRequest())
        .pipe(take(1))
        .subscribe(
          () => {
            this.router.navigate(['/bulk-upload', 'workplace-references']);
          },
          (error: HttpErrorResponse) => this.onError(error),
        ),
    );
  }
}
