import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { URLStructure } from '@core/model/url.model';
import { BackService } from '@core/services/back.service';
import { RegistrationSurveyService } from '@core/services/registration-survey.service';

@Component({
  selector: 'app-why-create-account',
  templateUrl: './why-create-account.component.html',
})
export class WhyCreateAccountComponent implements OnInit {
  public nextPage: URLStructure = { url: ['/registration-survey', 'how-did-you-hear-about'] };
  public return: URLStructure = { url: ['/registration-survey'] };
  public responses = [
    'To help the Department of Health and Social Care and others to better understand the adult social care sector',
    'To get access to the Workforce Development Fund',
    'To help us with the Care Quality Commission',
    'To help us with our local authority',
    'To record and manage staff training and qualifications',
    'To record and manage staff records',
    'To benchmark our workplace against others',
    'To help us understand our workforce better',
    'Other',
  ];
  public form: FormGroup;

  constructor(
    protected backService: BackService,
    protected registrationSurveyService: RegistrationSurveyService,
    private formBuilder: FormBuilder,
  ) {}

  ngOnInit(): void {
    this.setBackLink(this.return);
    this.setupForm();
  }

  private setupForm(): void {
    this.form = this.formBuilder.group({
      whyCreateAccount: null,
    });
  }

  public updateState(): void {
    const test = this.form.value;
    console.log(test);
    this.registrationSurveyService.updatewhyCreateAccountState(test);
  }

  protected setBackLink(returnTo): void {
    this.backService.setBackLink(returnTo);
  }
}
