import { I18nPluralPipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { JourneyType } from '@core/breadcrumb/breadcrumb.model';
import { Establishment } from '@core/model/establishment.model';
import { Workplace, WorkplaceDataOwner } from '@core/model/my-workplaces.model';
import { URLStructure } from '@core/model/url.model';
import { BackService } from '@core/services/back.service';
import { BreadcrumbService } from '@core/services/breadcrumb.service';
import { BulkUploadService } from '@core/services/bulk-upload.service';
import { ErrorSummaryService } from '@core/services/error-summary.service';
import { EstablishmentService } from '@core/services/establishment.service';
import { filter, find, orderBy } from 'lodash';
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
  public showMissing = false;
  public nextPage:URLStructure;

  constructor(
    private activatedRoute: ActivatedRoute,
    protected establishmentService: EstablishmentService,
    protected bulkUploadService: BulkUploadService,
    protected backService: BackService,
    protected errorSummaryService: ErrorSummaryService,
    protected formBuilder: FormBuilder,
    protected router: Router,
    private breadcrumbService: BreadcrumbService,
  ) {
    super(errorSummaryService, formBuilder);
  }

  ngOnInit(): void {
    this.breadcrumbService.show(JourneyType.BULK_UPLOAD);
    this.primaryWorkplace = this.establishmentService.primaryWorkplace;
    this.references = filter(this.activatedRoute.snapshot.data.workplaceReferences, (reference: Workplace) => {
      if (reference.ustatus === 'PENDING') return false;
      if (this.primaryWorkplace.isParent)
        return reference.dataOwner === WorkplaceDataOwner.Parent || reference.uid === this.primaryWorkplace.uid;
      return reference.dataOwner === WorkplaceDataOwner.Workplace;
    });
    this.references = orderBy(this.references, [(workplace: Workplace) => workplace.name.toLowerCase()], ['asc']);
    this.setupForm();
    this.setServerErrors();
    this.showToggles = this.anyFilledReferences();
    this.nextPage = {url:this.bulkUploadService.nextMissingNavigation()};
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
            const updatedReferences = this.references.map((workplace: Workplace) => {
              const updated = find(data.localIdentifiers, ['uid', workplace.uid]);
              return {
                ...workplace,
                ...{ localIdentifier: updated.value },
              };
            }) as Workplace[];
            this.bulkUploadService.setWorkplaceReferences(updatedReferences);
            this.router.navigate(this.nextPage.url);
          },
          (error: HttpErrorResponse) => this.onError(error),
        ),
    );
  }

  public setReturn(): void {
    this.bulkUploadService.setReturnTo({ url: ['/dev/bulk-upload/workplace-references'] });
  }
}
