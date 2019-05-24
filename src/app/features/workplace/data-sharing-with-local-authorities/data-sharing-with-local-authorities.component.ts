import { BackService } from '@core/services/back.service';
import { Component } from '@angular/core';
import { DataSharingOptions } from '@core/model/data-sharing.model';
import { ErrorSummaryService } from '@core/services/error-summary.service';
import { EstablishmentService } from '@core/services/establishment.service';
import { FormArray, FormBuilder, FormGroup } from '@angular/forms';
import { LocalAuthorityService } from '@core/services/localAuthority.service';
import { Question } from '../question/question.component';
import { Router } from '@angular/router';
import { uniqBy } from 'lodash';
import { LocalAuthorityModel } from '@core/model/localAuthority.model';

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
    private localAuthorityService: LocalAuthorityService
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
    this.next = ['/workplace', `${this.establishment.id}`, 'vacancies'];
    this.previous = ['/workplace', `${this.establishment.id}`, 'sharing-data'];

    if (!this.establishment.share.with.includes(DataSharingOptions.LOCAL)) {
      this.router.navigate(this.previous, { replaceUrl: true });
    }

    this.primaryAuthority = this.establishment.primaryAuthority;

    this.establishment.localAuthorities.forEach(authority => {
      if (!authority.isPrimaryAuthority) {
        this.localAuthoritiesArray.push(this.createLocalAuthorityItem(authority.custodianCode));
      } else {
        this.form.get('primaryAuthority').patchValue(true);
      }
    });

    this.subscriptions.add(
      this.localAuthorityService
        .getAuthorities()
        .subscribe((authorities: Array<LocalAuthorityModel>) => (this.authorities = authorities))
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
    const authorities = [];
    this.localAuthoritiesArray.controls.forEach(control => {
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

  protected updateEstablishment(props) {
    this.subscriptions.add(
      this.establishmentService
        .updateLocalAuthorities(this.establishment.id, props)
        .subscribe(data => this._onSuccess(data), error => this.onError(error))
    );
  }
}
