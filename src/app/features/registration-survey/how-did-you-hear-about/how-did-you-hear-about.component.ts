import { Component, OnInit } from '@angular/core';
import { UntypedFormArray, UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { URLStructure } from '@core/model/url.model';
import { BackService } from '@core/services/back.service';
import { RegistrationSurveyService } from '@core/services/registration-survey.service';

@Component({
  selector: 'app-how-did-you-hear-about',
  templateUrl: './how-did-you-hear-about.component.html',
})
export class HowDidYouHearAboutComponent implements OnInit {
  public nextPage: URLStructure = { url: ['/registration-survey', 'thank-you'] };
  public return: URLStructure = { url: ['/registration-survey', 'why-create-account'] };
  public responses = [
    'From an event we attended',
    'From the Skills for Care website',
    'From a Skills for Care staff member',
    'From the Care Quality Commission',
    'From our local authority',
    'From our trade association',
    'Other',
  ];

  public form: UntypedFormGroup;

  constructor(
    protected backService: BackService,
    protected registrationSurveyService: RegistrationSurveyService,
    private formBuilder: UntypedFormBuilder,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.setBackLink(this.return);
    this.setupForm();
  }

  get howDidYouHearAboutArray() {
    return this.form.get('howDidYouHearAbout') as UntypedFormArray;
  }

  private setupForm = () => {
    this.form = this.formBuilder.group({
      howDidYouHearAbout: this.formBuilder.array([]),
    });

    this.responses.map((response) => {
      const checked = this.registrationSurveyService.howDidYouHearAboutFormData?.includes(response) ? true : false;

      const formControl = this.formBuilder.control({
        response,
        checked,
      });

      this.howDidYouHearAboutArray.push(formControl);
    });
  };

  public updateState(): void {
    const responses = this.howDidYouHearAboutArray.controls
      .filter((control) => control.value.checked)
      .map((control) => {
        return control.value.response;
      });

    this.registrationSurveyService.updateHowDidYouHearAboutState(responses);
  }

  public onSubmit(): void {
    this.updateState();
    this.router.navigate(this.nextPage.url);
    this.registrationSurveyService.submitSurvey();
  }

  protected setBackLink(returnTo): void {
    this.backService.setBackLink(returnTo);
  }
}
