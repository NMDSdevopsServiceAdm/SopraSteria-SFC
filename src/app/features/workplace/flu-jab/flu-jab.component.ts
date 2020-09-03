import { OnInit, Component, ViewChild, ElementRef } from '@angular/core';
import { FormBuilder, FormGroup, FormArray } from '@angular/forms';
import { FluJabService, FluJabResponse, FluJabEnum } from '@core/services/flu-jab.service';
import { EstablishmentService } from '@core/services/establishment.service';
import { Router } from '@angular/router';
import { URLStructure } from '@core/model/url.model';
import { BackService } from '@core/services/back.service';

@Component({
  selector: 'app-flu-jab',
  templateUrl: './flu-jab.component.html'
})
export class FluJabComponent implements OnInit {

  private updatedFluJabs: any = [];
  public fluJabAnswers = [FluJabEnum.YES, FluJabEnum.NO, FluJabEnum.DONT_KNOW];
  public fluJabs: FluJabResponse[];
  @ViewChild('formEl') formEl: ElementRef;
  public form: FormGroup;
  public return: URLStructure;

  constructor(
    protected formBuilder: FormBuilder,
    protected establishmentService: EstablishmentService,
    protected fluJabService: FluJabService,
    protected router: Router,
    protected backService: BackService
  ) {
    this.form = this.formBuilder.group({
      fluJabsRadioList: this.formBuilder.array([])
    });
  }

  ngOnInit(): void {
    this.return = this.establishmentService.returnTo;

    const establishmentId = this.establishmentService.establishmentId;
    this.fluJabService.getFluJabsByWorkplace(establishmentId).subscribe(
      response => this.onInitSuccess(response),
      error => this.onInitError(error)
    );

    this.setBackLink();
  }

  setBackLink() {
    this.backService.setBackLink(this.return);
  }

  get fluJabRadioList() {
    return this.form.get('fluJabsRadioList') as FormArray;
  }

  private onInitSuccess(data) {
    this.fluJabs = data;
    this.fluJabs.forEach((fluJab) => {
      this.fluJabRadioList.push(this.formBuilder.control(fluJab.fluJab));
    })
  }

  private onInitError(error) {}

  radioChange(i, j) {
    const updatedFluJab = this.fluJabs[i];
    this.updatedFluJabs = this.updatedFluJabs.filter(fluJab => fluJab.id !== updatedFluJab.id);
    if (updatedFluJab.fluJab !== this.fluJabAnswers[j]) {
      this.updatedFluJabs.push({id: updatedFluJab.id, uid: updatedFluJab.uid, fluJab: this.fluJabAnswers[j]});
    }
  }

  onSubmit() {
    const establishmentId = this.establishmentService.establishmentId;
    this.establishmentService.updateWorkers(establishmentId, this.updatedFluJabs).subscribe(
      response => this.onSubmitSuccess(response),
      error => this.onSubmitError(error)
    );
  }

  onSubmitSuccess(data) {
    this.router.navigate(['/dashboard'], { fragment: 'workplace' });
  }

  onSubmitError(error) {

  }
}
