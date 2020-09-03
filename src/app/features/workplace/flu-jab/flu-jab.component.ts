import { OnInit, Component } from '@angular/core';
import { FormBuilder, FormGroup, FormArray } from '@angular/forms';
import { FluJabService, FluJabResponse, FluJabEnum } from '@core/services/flu-jab.service';
import { EstablishmentService } from '@core/services/establishment.service';

@Component({
  selector: 'app-flu-jab',
  templateUrl: './flu-jab.component.html'
})
export class FluJabComponent implements OnInit {
  private updatedFluJabs: any = [];
  public fluJabAnswers = [FluJabEnum.YES, FluJabEnum.NO, FluJabEnum.DONT_KNOW];
  public fluJabs: FluJabResponse[];
  public form: FormGroup;

  constructor(
    protected formBuilder: FormBuilder,
    protected establishmentService: EstablishmentService,
    protected fluJabService: FluJabService
  ) {
    this.form = this.formBuilder.group({
      fluJabsRadioList: this.formBuilder.array([])
    });
  }

  ngOnInit(): void {
    const establishmentId = this.establishmentService.establishmentId;
    this.fluJabService.getFluJabsByWorkplace(establishmentId).subscribe(
      response => this.onSuccess(response),
      error => this.onError(error)
    );
  }

  get fluJabRadioList() {
    return this.form.get('fluJabsRadioList') as FormArray;
  }

  private onSuccess(data) {
    this.fluJabs = data;
    this.fluJabs.forEach((fluJab) => {
      this.fluJabRadioList.push(this.formBuilder.control(fluJab.fluJab));
    })
  }

  private onError(error) {}

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
      response => this.onSuccess(response),
      error => this.onError(error)
    );
  }
}
