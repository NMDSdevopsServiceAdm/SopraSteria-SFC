import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
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
    'To get access to the Benefits Bundle',
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
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.setBackLink(this.return);
    this.setupForm();
  }

  get whyCreateAccountArray() {
    return this.form.get('whyCreateAccount') as FormArray;
  }

  private setupForm() {
    this.form = this.formBuilder.group({
      whyCreateAccount: this.formBuilder.array([]),
    });

    this.responses.map((response) => {
      const checked = this.registrationSurveyService.whyCreateAccountFormData?.includes(response) ? true : false;

      const formControl = this.formBuilder.control({
        response,
        checked,
      });

      this.whyCreateAccountArray.push(formControl);
    });
  }

  public updateState(): void {
    const responses = this.whyCreateAccountArray.controls
      .filter((control) => control.value.checked)
      .map((control) => {
        return control.value.response;
      });

    this.registrationSurveyService.updatewhyCreateAccountState(responses);
  }

  public onSubmit() {
    this.updateState();
    this.router.navigate(this.nextPage.url);
  }

  protected setBackLink(returnTo): void {
    this.backService.setBackLink(returnTo);
  }
}
