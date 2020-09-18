import { Component } from '@angular/core';
import { FormArray, FormBuilder, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { DataSharingOptions } from '@core/model/data-sharing.model';
import { LocalAuthorityModel } from '@core/model/localAuthority.model';
import { BackService } from '@core/services/back.service';
import { ErrorSummaryService } from '@core/services/error-summary.service';
import { EstablishmentService } from '@core/services/establishment.service';
import { LocalAuthorityService } from '@core/services/localAuthority.service';
import { findIndex, uniqBy } from 'lodash';

import { Question } from '../question/question.component';

@Component({
  selector: 'app-data-sharing-with-local-authorities',
  templateUrl: './data-sharing-with-local-authorities.component.html',
})
export class DataSharingWithLocalAuthoritiesComponent extends Question {
  public primaryAuthority;
  public authorities: Array<LocalAuthorityModel>;

  constructor(
    protected formBuilder: FormBuilder,
    protected router: Router,
    protected backService: BackService,
    protected errorSummaryService: ErrorSummaryService,
    protected establishmentService: EstablishmentService,
    private localAuthorityService: LocalAuthorityService,
  ) {
    super(formBuilder, router, backService, errorSummaryService, establishmentService);

    this.form = this.formBuilder.group({
      primaryAuthority: false,
      localAuthorities: this.formBuilder.array([]),
    });
  }

  public get localAuthoritiesArray() {
    return this.form.get('localAuthorities') as FormArray;
  }

  public addLocalAuthority() {
    this.localAuthoritiesArray.push(this.createLocalAuthorityItem());
  }

  public deleteLocalAuthority(event: Event, index: number) {
    event.preventDefault();
    this.localAuthoritiesArray.controls.splice(index, 1);
  }

  protected init(): void {
    this.nextRoute = ['/workplace', `${this.establishment.uid}`, 'total-staff'];
    this.previousRoute = ['/workplace', `${this.establishment.uid}`, 'sharing-data'];

    if (!this.establishment.share.with.includes(DataSharingOptions.LOCAL)) {
      this.router.navigate(this.previousRoute, { replaceUrl: true });
    }

    this.primaryAuthority = this.establishment.primaryAuthority;

    this.subscriptions.add(
      this.localAuthorityService.getAuthorities().subscribe((authorities) => {
        const index = findIndex(
          authorities,
          (authority) => authority.custodianCode === this.primaryAuthority.custodianCode,
        );
        authorities.splice(index, 1);
        this.authorities = authorities;
      }),
    );

    this.establishment.localAuthorities.forEach((authority) => {
      if (!authority.isPrimaryAuthority) {
        this.localAuthoritiesArray.push(this.createLocalAuthorityItem(authority.custodianCode));
      } else {
        this.form.get('primaryAuthority').patchValue(true);
      }
    });
  }

  private createLocalAuthorityItem(custodianCode: number = null): FormGroup {
    return this.formBuilder.group({
      custodianCode,
    });
  }

  protected setupServerErrorsMap(): void {
    this.serverErrorsMap = [
      {
        name: 400,
        message: 'Local Authorities could not be updated.',
      },
    ];
  }

  protected generateUpdateProps() {
    const authorities = [];
    this.localAuthoritiesArray.controls.forEach((control) => {
      if (control.value.custodianCode) {
        authorities.push({ custodianCode: parseInt(control.value.custodianCode, 10) });
      }
    });

    if (this.form.get('primaryAuthority').value) {
      authorities.push(this.primaryAuthority);
    }

    return {
      localAuthorities: uniqBy(authorities, 'custodianCode'),
    };
  }

  public selectableAuthorities(index): LocalAuthorityModel[] {
    if (this.authorities) {
      return this.authorities.filter(
        (authority) =>
          !this.localAuthoritiesArray.controls.some(
            (localAuth) =>
              localAuth !== this.localAuthoritiesArray.controls[index] &&
              parseInt(localAuth.get('custodianCode').value, 10) === authority.custodianCode,
          ),
      );
    }
  }

  protected updateEstablishment(props) {
    this.subscriptions.add(
      this.establishmentService.updateLocalAuthorities(this.establishment.uid, props).subscribe(
        (data) => this._onSuccess(data),
        (error) => this.onError(error),
      ),
    );
  }
}
