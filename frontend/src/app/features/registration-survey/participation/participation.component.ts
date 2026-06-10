import { Component, OnDestroy, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { Establishment } from '@core/model/establishment.model';
import { URLStructure } from '@core/model/url.model';
import { EstablishmentService } from '@core/services/establishment.service';
import { RegistrationSurveyService } from '@core/services/registration-survey.service';
import { UserService } from '@core/services/user.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-participation',
  templateUrl: './participation.component.html',
  standalone: false,
})
export class ParticipationComponent implements OnInit, OnDestroy {
  private subscriptions: Subscription = new Subscription();

  public nextPage: URLStructure;
  public form: UntypedFormGroup;
  public workplace: Establishment;
  public data: string;

  constructor(
    protected registrationSurveyService: RegistrationSurveyService,
    private establishmentService: EstablishmentService,
    private userService: UserService,
    private formBuilder: UntypedFormBuilder,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.nextPage = this.registrationSurveyService?.participationFormData
      ? { url: ['/registration-survey', 'why-create-account'] }
      : { url: ['/dashboard'] };
    this.workplace = this.establishmentService.primaryWorkplace;

    this.updateUserMarkSurveyAsComplete();
    this.setupForm();
  }

  get participation() {
    return this.form.get('participation');
  }

  public updateUserMarkSurveyAsComplete() {
    if (this.userService.loggedInUser?.registrationSurveyCompleted === true) {
      return;
    }

    const userUid = this.userService.loggedInUser.uid!;
    const updates = { registrationSurveyCompleted: true };

    this.subscriptions.add(this.userService.updateUserFlag(userUid, updates).subscribe());
  }

  public onSubmit() {
    this.updateState();
    this.router.navigate(this.nextPage.url);
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
    this.subscriptions.unsubscribe();
  }
}
