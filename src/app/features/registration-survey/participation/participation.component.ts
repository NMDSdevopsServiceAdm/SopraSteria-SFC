import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup } from '@angular/forms';
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

  get participationArray() {
    return this.form.get('participation') as FormArray;
  }

  private setupForm() {
    this.form = this.formBuilder.group({
      participation: this.formBuilder.array([]),
    });

    // this.responses.map((response) => {
    //   const checked = this.registrationSurveyService.whyCreateAccountFormData?.includes(response) ? true : false;

    //   const formControl = this.formBuilder.control({
    //     response,
    //     checked,
    //   });

    //   this.whyCreateAccountArray.push(formControl);
    // });
    const responses = ["Yes, I'll answer the questions", 'No, I want to start adding data'];

    responses.map((response) => {
      const checked = this.registrationSurveyService.participationFormData?.includes(response) ? true : false;

      const formControl = this.formBuilder.control({
        response,
        checked,
      });

      this.participationArray.push(formControl);
    });
  }

  public updateState(): void {
    const test = 'not yet a form';
    this.registrationSurveyService.updateParticipationState(test);
  }
}
