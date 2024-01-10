import { Component } from '@angular/core';
import { UntypedFormBuilder } from '@angular/forms';
import { Router } from '@angular/router';
import { ShareWithRequest } from '@core/model/data-sharing.model';
import { BackService } from '@core/services/back.service';
import { ErrorSummaryService } from '@core/services/error-summary.service';
import { EstablishmentService } from '@core/services/establishment.service';

import { Question } from '../question/question.component';

@Component({
  selector: 'app-data-sharing',
  templateUrl: './data-sharing.component.html',
})
export class DataSharingComponent extends Question {
  public section = 'Permissions';
  constructor(
    protected formBuilder: UntypedFormBuilder,
    protected router: Router,
    protected backService: BackService,
    protected errorSummaryService: ErrorSummaryService,
    protected establishmentService: EstablishmentService,
  ) {
    super(formBuilder, router, backService, errorSummaryService, establishmentService);

    this.form = this.formBuilder.group({
      shareWith: this.formBuilder.group({
        cqc: null,
        localAuthorities: null,
      }),
    });
  }

  protected init(): void {
    if (this.establishment.shareWith) {
      const shareWith = this.establishment.shareWith;
      this.form.get('shareWith').patchValue({
        cqc: shareWith.cqc,
        localAuthorities: shareWith.localAuthorities,
      });
    }

    this.previousRoute = ['/workplace', this.establishment.uid, 'staff-benefit-holiday-leave'];
    this.skipRoute = ['/workplace', this.establishment.uid, 'check-answers'];
  }

  protected setupServerErrorsMap(): void {
    this.serverErrorsMap = [
      {
        name: 400,
        message: 'Data Sharing options could not be updated.',
      },
    ];
  }

  protected generateUpdateProps(): ShareWithRequest {
    const { cqc, localAuthorities } = this.form.get('shareWith').value;

    return {
      shareWith: {
        cqc,
        localAuthorities,
      },
    };
  }

  protected updateEstablishment(props: ShareWithRequest): void {
    const completeUpdateEstablishment = () => {
      this.subscriptions.add(
        this.establishmentService.updateDataSharing(this.establishment.uid, props).subscribe(
          (data) => {
            this._onSuccess(data);
          },
          (error) => this.onError(error),
        ),
      );
    };

    this.establishment.showSharingPermissionsBanner
      ? this.removeSharingPermissionsBanner(completeUpdateEstablishment)
      : completeUpdateEstablishment();
  }

  protected onSuccess(): void {
    this.nextRoute = ['/workplace', this.establishment.uid, 'check-answers'];
  }

  protected removeSharingPermissionsBanner(completeFunction): void {
    const data = { property: 'showSharingPermissionsBanner', value: false };
    this.subscriptions.add(
      this.establishmentService.updateSingleEstablishmentField(this.establishment.uid, data).subscribe(
        (data) => {
          this.establishmentService.setState({ ...this.establishment, ...data });
          completeFunction();
        },
        () => {
          this.router.navigate(['/problem-with-the-service']);
        },
      ),
    );
  }
}
