import { I18nPluralPipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { UntypedFormBuilder } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { EstablishmentList } from '@core/model/bulk-upload.model';
import { Establishment } from '@core/model/establishment.model';
import { URLStructure } from '@core/model/url.model';
import { AlertService } from '@core/services/alert.service';
import { BackService } from '@core/services/back.service';
import { BulkUploadService } from '@core/services/bulk-upload.service';
import { ErrorSummaryService } from '@core/services/error-summary.service';
import { EstablishmentService } from '@core/services/establishment.service';
import { AdminSkipService } from '@features/bulk-upload/admin-skip.service';
import { Subscription } from 'rxjs';
import { take } from 'rxjs/operators';

import { BulkUploadReferencesDirective } from '../bulk-upload-references.directive';

@Component({
  selector: 'app-bu-missing-workplace-references-page',
  templateUrl: 'missing-workplace-references.component.html',
  styleUrls: ['../references.component.scss'],
  providers: [I18nPluralPipe],
})
export class MissingWorkplaceReferencesComponent extends BulkUploadReferencesDirective implements OnInit {
  private primaryWorkplace: Establishment;
  private subscriptions: Subscription = new Subscription();
  public return: URLStructure = { url: ['/bulk-upload'] };
  public exit: URLStructure = { url: ['/dashboard'] };
  public showMissing = true;
  private establishmentsWithMissingReferences: [EstablishmentList];

  constructor(
    private activatedRoute: ActivatedRoute,
    protected establishmentService: EstablishmentService,
    protected bulkUploadService: BulkUploadService,
    protected backService: BackService,
    protected errorSummaryService: ErrorSummaryService,
    protected formBuilder: UntypedFormBuilder,
    protected router: Router,
    protected alertService: AlertService,
    private adminSkipService: AdminSkipService,
  ) {
    super(errorSummaryService, formBuilder, alertService, backService, router);
  }

  ngOnInit(): void {
    this.setBackLink(this.return);
    this.primaryWorkplace = this.establishmentService.primaryWorkplace;
    this.establishmentsWithMissingReferences = this.activatedRoute.snapshot.data.nextWorkplace.establishmentList;
    this.filterWorkplaceReferences(this.activatedRoute.snapshot.data.workplaceReferences, this.primaryWorkplace, true);
    this.setupForm();
    this.setWorkplaceServerErrors();
    this.showToggles = this.anyFilledReferences();
  }

  public skipPage(): void {
    this.adminSkipService.skipWorkplaceReferences = true;
    this.bulkUploadService.setMissingReferencesNavigation(this.establishmentsWithMissingReferences);
    this.nextMissingPage(this.bulkUploadService.nextMissingReferencesNavigation(), true);
  }

  protected save(): void {
    this.subscriptions.add(
      this.establishmentService
        .updateLocalIdentifiers(this.generateRequest())
        .pipe(take(1))
        .subscribe(
          (data) => {
            this.bulkUploadService.setMissingReferencesNavigation(this.establishmentsWithMissingReferences);
            this.nextMissingPage(this.bulkUploadService.nextMissingReferencesNavigation());
          },
          (error: HttpErrorResponse) => this.onError(error),
        ),
    );
  }
}
