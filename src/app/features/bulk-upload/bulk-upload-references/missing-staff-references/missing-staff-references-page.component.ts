import { I18nPluralPipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { UntypedFormBuilder } from '@angular/forms';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { EstablishmentList } from '@core/model/bulk-upload.model';
import { URLStructure } from '@core/model/url.model';
import { Worker } from '@core/model/worker.model';
import { AlertService } from '@core/services/alert.service';
import { BackService } from '@core/services/back.service';
import { BulkUploadService } from '@core/services/bulk-upload.service';
import { ErrorSummaryService } from '@core/services/error-summary.service';
import { EstablishmentService } from '@core/services/establishment.service';
import { WorkerService } from '@core/services/worker.service';
import { AdminSkipService } from '@features/bulk-upload/admin-skip.service';
import orderBy from 'lodash/orderBy';
import { Subscription } from 'rxjs';
import { filter, map, take } from 'rxjs/operators';

import { BulkUploadReferencesDirective } from '../bulk-upload-references.directive';

@Component({
  selector: 'app-bu-missing-staff-references-page',
  templateUrl: 'missing-staff-references.component.html',
  styleUrls: ['../references.component.scss'],
  providers: [I18nPluralPipe],
})
export class MissingStaffReferencesComponent extends BulkUploadReferencesDirective implements OnDestroy, OnInit {
  private subscriptions: Subscription = new Subscription();
  public return: URLStructure = { url: ['/bulk-upload'] };
  public exit: URLStructure = { url: ['/dashboard'] };
  private establishmentUid: string;
  public workplaceName: string;
  public showMissing = true;
  private establishmentsWithMissingReferences: [EstablishmentList];
  private currentEstablishmentIndex: number;

  constructor(
    private activatedRoute: ActivatedRoute,
    protected establishmentService: EstablishmentService,
    protected bulkUploadService: BulkUploadService,
    protected backService: BackService,
    protected errorSummaryService: ErrorSummaryService,
    protected formBuilder: UntypedFormBuilder,
    protected router: Router,
    protected alertService: AlertService,
    private workerService: WorkerService,
    private adminSkipService: AdminSkipService,
  ) {
    super(errorSummaryService, formBuilder, alertService, backService, router);
  }

  ngOnInit(): void {
    this.subscriptions.add(
      this.router.events
        .pipe(
          filter((event) => event instanceof NavigationEnd),
          map(() => this.activatedRoute),
          map((route) => route.snapshot.data),
        )
        .subscribe((data) => {
          this.setBackLink(this.return);
        }),
    );

    this.activatedRoute.params.subscribe((data) => {
      this.setBackLink(this.return);
      this.establishmentUid = data.uid;
      this.references = orderBy(
        this.activatedRoute.snapshot.data.references,
        [(worker: Worker) => worker.localIdentifier !== null, (worker: Worker) => worker.nameOrId.toLowerCase()],
        ['asc'],
      );
      this.establishmentsWithMissingReferences =
        this.activatedRoute.snapshot.data.workplaceReferences.establishmentList;
      this.getWorkplaceName();
      this.setupForm();
      this.setWorkerServerErrors();
      this.showToggles = this.anyFilledReferences();
      this.currentEstablishmentIndex = this.establishmentsWithMissingReferences.findIndex(
        (establishment) => establishment.uid === this.establishmentUid,
      );
    });
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  private getWorkplaceName(): void {
    const currentEstablishmentUid = this.activatedRoute.snapshot.paramMap.get('uid');
    this.workplaceName = this.establishmentsWithMissingReferences.find(
      ({ uid }) => uid === currentEstablishmentUid,
    ).name;
  }

  public skipPage(): void {
    this.bulkUploadService.setMissingReferencesNavigation(this.establishmentsWithMissingReferences);
    this.nextMissingPage(
      this.bulkUploadService.nextMissingReferencesNavigation(this.currentEstablishmentIndex + 1),
      true,
    );
    this.adminSkipService.add(this.establishmentUid);
  }

  protected save(): void {
    this.subscriptions.add(
      this.workerService
        .updateLocalIdentifiers(this.establishmentUid, this.generateRequest())
        .pipe(take(1))
        .subscribe(
          () => {
            this.establishmentsWithMissingReferences.splice(this.currentEstablishmentIndex, 1);
            const missingReferencesLeft = this.establishmentsWithMissingReferences.length > 0;
            this.bulkUploadService.setMissingReferencesNavigation(this.establishmentsWithMissingReferences);
            this.nextMissingPage(
              this.bulkUploadService.nextMissingReferencesNavigation(this.currentEstablishmentIndex),
              missingReferencesLeft,
            );
          },
          (error: HttpErrorResponse) => this.onError(error),
        ),
    );
  }
}
