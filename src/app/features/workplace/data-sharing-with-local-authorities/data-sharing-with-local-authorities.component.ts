import { Component } from '@angular/core';
import { FormArray, FormBuilder, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { DataSharingOptions } from '@core/model/data-sharing.model';
import { BackService } from '@core/services/back.service';
import { ErrorSummaryService } from '@core/services/error-summary.service';
import { EstablishmentService } from '@core/services/establishment.service';
import { LocalAuthorityService } from '@core/services/localAuthority.service';
import { uniqBy } from 'lodash';

import { Question } from '../question/question.component';

@Component({
  selector: 'app-data-sharing-with-local-authorities',
  templateUrl: './data-sharing-with-local-authorities.component.html',
})
export class DataSharingWithLocalAuthoritiesComponent extends Question {
  public primaryAuthority;
  public authorities;

  constructor(
    protected formBuilder: FormBuilder,
    protected router: Router,
    protected backService: BackService,
    protected errorSummaryService: ErrorSummaryService,
    protected establishmentService: EstablishmentService,
    private localAuthorityService: LocalAuthorityService
  ) {
    super(formBuilder, router, backService, errorSummaryService, establishmentService);

    this.form = this.formBuilder.group({
      primaryAuthority: null,
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
    this.next = ['/workplace', `${this.establishment.id}`, 'vacancies'];
    this.previous = ['/workplace', `${this.establishment.id}`, 'sharing-data'];

    if (!this.establishment.share.with.includes(DataSharingOptions.LOCAL)) {
      this.router.navigate(this.previous, { replaceUrl: true });
    }

    this.primaryAuthority = this.establishment.primaryAuthority;

    this.form.get('primaryAuthority').patchValue(
      !!this.establishment.localAuthorities.findIndex(authority => {
        return authority.isPrimaryAuthority;
      })
    );

    this.establishment.localAuthorities.forEach(authority => {
      if (!authority.isPrimaryAuthority) {
        this.localAuthoritiesArray.push(this.createLocalAuthorityItem(authority.custodianCode));
      }
    });

    this.addLocalAuthority();

    this.subscriptions.add(
      this.localAuthorityService.getAuthorities().subscribe(authorities => {
        this.authorities = authorities.filter(authority => {
          return authority.custodianCode !== this.establishment.primaryAuthority.custodianCode;
        });
      })
    );
  }

  private createLocalAuthorityItem(custodianCode: number = null): FormGroup {
    return this.formBuilder.group({
      custodianCode: custodianCode,
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
    const { primaryAuthority, localAuthorities } = this.form.value;

    const authorities = localAuthorities
      .filter(authority => !!authority.custodianCode)
      .map(authority => {
        return { custodianCode: parseInt(authority.custodianCode, 10) };
      });

    if (primaryAuthority) {
      authorities.push({ custodianCode: this.establishment.primaryAuthority.custodianCode });
    }

    return {
      localAuthorities: uniqBy(authorities, 'custodianCode'),
    };
  }

  protected updateEstablishment(props) {
    this.subscriptions.add(
      this.establishmentService
        .updateLocalAuthorities(this.establishment.id, props)
        .subscribe(data => this._onSuccess(data), error => this.onError(error))
    );
  }
}
