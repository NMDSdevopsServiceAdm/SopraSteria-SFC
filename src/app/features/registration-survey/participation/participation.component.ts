import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Establishment } from '@core/model/establishment.model';
import { URLStructure } from '@core/model/url.model';
import { EstablishmentService } from '@core/services/establishment.service';
import { RegistrationSurveyService } from '@core/services/registration-survey.service';
import { UserService } from '@core/services/user.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-participation',
  templateUrl: './participation.component.html',
})
export class ParticipationComponent implements OnInit {
  private subscriptions: Subscription = new Subscription();

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
    this.nextPage = this.registrationSurveyService?.participationFormData
      ? { url: ['/registration-survey', 'why-create-account'] }
      : { url: ['/dashboard'] };
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

  public updateRouteToNextPage() {
    this.nextPage =
      this.participation.value === 'Yes'
        ? { url: ['/registration-survey', 'why-create-account'] }
        : { url: ['/dashboard'] };
  }

  ngOnDestroy(): void {
    if (this.userService.loggedInUser?.registrationSurveyCompleted === false) {
      this.subscriptions.add(
        this.userService
          .updateUserDetails(this.userService.loggedInUser.establishmentUid, this.userService.loggedInUser.uid, {
            ...this.userService.loggedInUser,
            ...{ registrationSurveyCompleted: true },
          })
          .subscribe((data) => (this.userService.loggedInUser = data)),
      );
    }

    this.updateRouteToNextPage();
  }
}
