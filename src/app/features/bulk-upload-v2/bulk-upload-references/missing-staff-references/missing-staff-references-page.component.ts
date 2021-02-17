import { I18nPluralPipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { EstablishmentList, MissingReferences } from '@core/model/bulk-upload.model';
import { URLStructure } from '@core/model/url.model';
import { Worker } from '@core/model/worker.model';
import { AlertService } from '@core/services/alert.service';
import { BackService } from '@core/services/back.service';
import { BulkUploadService } from '@core/services/bulk-upload.service';
import { ErrorSummaryService } from '@core/services/error-summary.service';
import { EstablishmentService } from '@core/services/establishment.service';
import { WorkerService } from '@core/services/worker.service';
import { orderBy } from 'lodash';
import { Subscription } from 'rxjs';
import { filter, map, take } from 'rxjs/operators';

import { BulkUploadReferencesDirective } from '../bulk-upload-references.directive';

@Component({
  selector: 'app-bu-missing-staff-references-page',
  templateUrl: 'missing-staff-references.component.html',
  styleUrls: ['../references.component.scss'],
  providers: [I18nPluralPipe],
})
export class MissingStaffReferencesComponent extends BulkUploadReferencesDirective implements OnInit, OnDestroy {
  private subscriptions: Subscription = new Subscription();
  public return: URLStructure = { url: ['/dev', 'bulk-upload', 'missing'] };
  private establishmentUid: string;
  public workplaceName: string;
  public showMissing = false;
  private establishmentsToDo: [EstablishmentList];

  constructor(
    private activatedRoute: ActivatedRoute,
    protected establishmentService: EstablishmentService,
    protected bulkUploadService: BulkUploadService,
    protected backService: BackService,
    protected errorSummaryService: ErrorSummaryService,
    protected formBuilder: FormBuilder,
    protected router: Router,
    protected alertService: AlertService,
    private workerService: WorkerService,
  ) {
    super(errorSummaryService, formBuilder, alertService, backService, router);
    this.subscriptions.add(
      this.router.events
        .pipe(
          filter((event) => event instanceof NavigationEnd),
          map(() => this.activatedRoute),
          filter((route) => !route.snapshot.fragment),
          map((route) => route.snapshot.data),
        )
        .subscribe((data) => {
          this.establishmentUid = this.activatedRoute.snapshot.paramMap.get('uid');
          this.references = orderBy(
            data.references,
            [(worker: Worker) => worker.localIdentifier !== null, (worker: Worker) => worker.nameOrId.toLowerCase()],
            ['asc'],
          );
          this.establishmentsToDo = data.workplaceReferences?.establishmentList;
          this.getWorkplaceName();
          this.setupForm();
          this.setServerErrors();
          this.showToggles = this.anyFilledReferences();
        }),
    );
  }

  ngOnInit(): void {
    this.setBackLink(this.return);
  }
  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  public toggleShowAll() {
    this.showMissing = !this.showMissing;
  }

  private setServerErrors() {
    this.serverErrorsMap = [
      {
        name: 503,
        message: 'Service unavailable.',
      },
      {
        name: 400,
        message: `Unable to update staff reference.`,
      },
    ];
  }

  private getWorkplaceName(): void {
    this.workplaceName = this.establishmentsToDo[0].name;
  }

  protected save(): void {
    this.subscriptions.add(
      this.workerService
        .updateLocalIdentifiers(this.establishmentUid, this.generateRequest())
        .pipe(take(1))
        .subscribe(
          () => {
            this.establishmentsToDo.shift();
            this.bulkUploadService.setMissingNavigation(this.establishmentsToDo);
            this.nextMissingPage(this.bulkUploadService.nextMissingNavigation());
          },
          (error: HttpErrorResponse) => this.onError(error),
        ),
    );
  }
}
