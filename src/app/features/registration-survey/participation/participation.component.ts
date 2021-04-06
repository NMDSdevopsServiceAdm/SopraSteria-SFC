import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Establishment } from '@core/model/establishment.model';
import { URLStructure } from '@core/model/url.model';
import { EstablishmentService } from '@core/services/establishment.service';
import { RegistrationSurveyService } from '@core/services/registration-survey.service';
import { UserService } from '@core/services/user.service';

@Component({
  selector: 'app-participation',
  templateUrl: './participation.component.html',
})
export class ParticipationComponent implements OnInit {
  public nextPage: URLStructure;
  public form: FormGroup;
  public workplace: Establishment;
  public data: string;

  constructor(
    protected registrationSurveyService: RegistrationSurveyService,
    private establishmentService: EstablishmentService,
    private userService: UserService,
    private formBuilder: FormBuilder,
  ) {}

  ngOnInit(): void {
    this.nextPage = { url: ['/dashboard'] };
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

    this.updateRouteToNextPage();
  }

  public onContinue() {
    this.updateState();

    // if (this.data != 'Yes') {
    //   this.registrationSurveyService.submitSurvey();
    // }
  }

  public updateRouteToNextPage() {
    if (this.participation.value == 'Yes') {
      this.nextPage = { url: ['/registration-survey', 'why-create-account'] };
    }
  }

  // ngOnDestroy(): void {
  //   this.userService.updateUserDetails(this.workplace.uid, this.user.uid, { ...this.user, ...props });
  // }
}
