import { Component, OnInit } from '@angular/core';
import { URLStructure } from '@core/model/url.model';
import { RegistrationSurveyService } from '@core/services/registration-survey.service';

@Component({
  selector: 'app-thank-you',
  templateUrl: './thank-you.component.html',
})
export class ThankYouComponent implements OnInit {
  public nextPage: URLStructure;

  constructor(protected registrationSurveyService: RegistrationSurveyService) {}

  ngOnInit(): void {
    this.nextPage = { url: ['/first-login-wizard'] };
  }
}
