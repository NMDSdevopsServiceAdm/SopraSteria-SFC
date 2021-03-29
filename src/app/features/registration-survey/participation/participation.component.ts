import { Component, OnInit } from '@angular/core';
import { URLStructure } from '@core/model/url.model';
import { RegistrationSurveyService } from '@core/services/registration-survey.service';

@Component({
  selector: 'app-participation',
  templateUrl: './participation.component.html',
})
export class ParticipationComponent implements OnInit {
  public nextPage: URLStructure;

  constructor(protected registrationSurveyService: RegistrationSurveyService) {}

  ngOnInit(): void {
    this.nextPage = { url: ['/registration-survey', 'why-create-account'] };
  }

  public updateState(): void {
    const test = 'not yet a form';
    this.registrationSurveyService.updateParticipationState(test);
  }
}
