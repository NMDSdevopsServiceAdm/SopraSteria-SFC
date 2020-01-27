import { Component } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { Router } from '@angular/router';
import { DataSharingOptions } from '@core/model/data-sharing.model';
import { BackService } from '@core/services/back.service';
import { ErrorSummaryService } from '@core/services/error-summary.service';
import { EstablishmentService } from '@core/services/establishment.service';

import { Question } from '../question/question.component';

@Component({
  selector: 'app-data-sharing',
  templateUrl: './data-sharing.component.html',
})
export class DataSharingComponent extends Question {
  constructor(
    protected formBuilder: FormBuilder,
    protected router: Router,
    protected backService: BackService,
    protected errorSummaryService: ErrorSummaryService,
    protected establishmentService: EstablishmentService
  ) {
    super(formBuilder, router, backService, errorSummaryService, establishmentService);

    this.form = this.formBuilder.group({
      shareWith: this.formBuilder.group({
        cqc: false,
        localAuthorities: false,
      }),
    });
  }

  protected init(): void {
    if (this.establishment.share && this.establishment.share.enabled) {
      const shareWith = this.establishment.share.with;
      this.form.get('shareWith').patchValue({
        cqc: shareWith.includes(DataSharingOptions.CQC),
        localAuthorities: shareWith.includes(DataSharingOptions.LOCAL),
      });
    }

    this.previous = ['/workplace', `${this.establishment.uid}`, 'service-users'];
  }

  protected setupServerErrorsMap(): void {
    this.serverErrorsMap = [
      {
        name: 400,
        message: 'Data Sharing options could not be updated.',
      },
    ];
  }

  protected generateUpdateProps() {
    const { cqc, localAuthorities } = this.form.get('shareWith').value;

    const shareWith = [];

    if (cqc) {
      shareWith.push(DataSharingOptions.CQC);
    }
    if (localAuthorities) {
      shareWith.push(DataSharingOptions.LOCAL);
    }

    if (this.establishment && !shareWith.length) {
      this.establishment.localAuthorities = [];
    }

    return {
      share: {
        enabled: shareWith.length ? true : false,
        with: shareWith,
      },
    };
  }

  protected updateEstablishment(props) {
    this.subscriptions.add(
      this.establishmentService
        .updateDataSharing(this.establishment.uid, props)
        .subscribe(data => this._onSuccess(data), error => this.onError(error))
    );
  }

  protected onSuccess() {
    const { localAuthorities } = this.form.get('shareWith').value;

    this.next = localAuthorities
      ? ['/workplace', `${this.establishment.uid}`, 'sharing-data-with-local-authorities']
      : ['/workplace', `${this.establishment.uid}`, 'vacancies'];
  }
}
