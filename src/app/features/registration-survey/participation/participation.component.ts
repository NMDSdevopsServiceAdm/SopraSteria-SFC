import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Establishment } from '@core/model/establishment.model';
import { URLStructure } from '@core/model/url.model';
import { EstablishmentService } from '@core/services/establishment.service';
import { RegistrationSurveyService } from '@core/services/registration-survey.service';

@Component({
  selector: 'app-participation',
  templateUrl: './participation.component.html',
})
export class ParticipationComponent implements OnInit {
  public nextPage: URLStructure;
  public form: FormGroup;
  public workplace: Establishment;

  constructor(
    protected registrationSurveyService: RegistrationSurveyService,
    private establishmentService: EstablishmentService,
    private formBuilder: FormBuilder,
  ) {}

  ngOnInit(): void {
    this.nextPage = { url: ['/registration-survey', 'why-create-account'] };
    this.workplace = this.establishmentService.primaryWorkplace;
    this.setupForm();
  }

  get participation() {
    return this.form.get('participation');
  }

  private setupForm() {
    this.form = this.formBuilder.group({
      participation: this.registrationSurveyService.participationFormData
        ? this.formBuilder.control(this.registrationSurveyService.participationFormData)
        : this.formBuilder.control(''),
    });
  }

  public updateState(): void {
    this.registrationSurveyService.updateParticipationState(this.participation.value);
  }
}
