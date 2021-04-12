import { HttpResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { RegistrationSurveyService } from '@core/services/registration-survey.service';
import { RegistrationsService } from '@core/services/registrations.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-registrations',
  templateUrl: './registrations.component.html',
})
export class RegistrationsComponent implements OnInit {
  public registrations = [];
  private subscriptions: Subscription = new Subscription();

  constructor(
    public registrationsService: RegistrationsService,
    public registrationSurveyService: RegistrationSurveyService,
  ) {}

  ngOnInit() {
    this.getRegistrations();
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  public getRegistrations() {
    this.registrationsService.getRegistrations().subscribe(
      (data) => {
        this.registrations = data;
      },
      (error) => this.onError(error),
    );
  }

  public handleRegistration(index: number) {
    this.registrations.splice(index, 1);
  }

  public downloadReport(event: Event): void {
    event.preventDefault();

    this.subscriptions.add(
      this.registrationSurveyService.getReport().subscribe((response) => {
        this.saveFile(response);
      }),
    );
  }

  public saveFile(response: HttpResponse<Blob>) {
    const filenameRegEx = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/;
    const header = response.headers.get('content-disposition');
    const filenameMatches = header && header.match(filenameRegEx);
    const filename = filenameMatches && filenameMatches.length > 1 ? filenameMatches[1] : null;
    const blob = new Blob([response.body], { type: 'text/plain;charset=utf-8' });

    saveAs(blob, filename);
  }

  private onError(error) {}
}
