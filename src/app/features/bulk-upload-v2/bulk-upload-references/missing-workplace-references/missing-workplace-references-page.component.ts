import { I18nPluralPipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { EstablishmentList } from '@core/model/bulk-upload.model';
import { Establishment } from '@core/model/establishment.model';
import { Workplace, WorkplaceDataOwner } from '@core/model/my-workplaces.model';
import { URLStructure } from '@core/model/url.model';
import { AlertService } from '@core/services/alert.service';
import { BackService } from '@core/services/back.service';
import { BulkUploadService } from '@core/services/bulk-upload.service';
import { ErrorSummaryService } from '@core/services/error-summary.service';
import { EstablishmentService } from '@core/services/establishment.service';
import { filter, orderBy } from 'lodash';
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
  public return: URLStructure = { url: ['/dev', 'bulk-upload'] };
  public exit: URLStructure = { url: ['/dashboard'] };
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
  ) {
    super(errorSummaryService, formBuilder, alertService, backService, router);
  }

  ngOnInit(): void {
    this.setBackLink(this.return);
    this.primaryWorkplace = this.establishmentService.primaryWorkplace;
    this.establishmentsToDo = this.activatedRoute.snapshot.data.nextWorkplace.establishmentList;
    this.references = filter(this.activatedRoute.snapshot.data.workplaceReferences, (reference: Workplace) => {
      if (reference.ustatus === 'PENDING') return false;
      if (this.primaryWorkplace.isParent)
        return reference.dataOwner === WorkplaceDataOwner.Parent || reference.uid === this.primaryWorkplace.uid;
      return reference.dataOwner === WorkplaceDataOwner.Workplace;
    });
    this.references = orderBy(
      this.references,
      [
        (workplace: Workplace) => workplace.localIdentifier !== null,
        (workplace: Workplace) => workplace.name.toLowerCase(),
      ],
      ['asc'],
    );
    this.setupForm();
    this.setServerErrors();
    this.showToggles = this.anyFilledReferences();
  }

  private setServerErrors() {
    this.serverErrorsMap = [
      {
        name: 503,
        message: 'Service unavailable.',
      },
      {
        name: 400,
        message: `Unable to update workplace reference.`,
      },
    ];
  }

  protected save(): void {
    this.subscriptions.add(
      this.establishmentService
        .updateLocalIdentifiers(this.generateRequest())
        .pipe(take(1))
        .subscribe(
          (data) => {
            this.bulkUploadService.setMissingNavigation(this.establishmentsToDo);
            this.nextMissingPage(this.bulkUploadService.nextMissingNavigation());
          },
          (error: HttpErrorResponse) => this.onError(error),
        ),
    );
  }
}
