import { HttpClient } from '@angular/common/http';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { inject, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { RegistrationSurveyService } from '@core/services/registration-survey.service';
import { RegistrationsService } from '@core/services/registrations.service';
import { FirstErrorPipe } from '@shared/pipes/first-error.pipe';
import { fireEvent, render, RenderResult } from '@testing-library/angular';
import { of } from 'rxjs';

import { RegistrationComponent } from '../registration/registration.component';
import { RegistrationsComponent } from './registrations.component';

describe('RegistrationsComponent', () => {
  let component: RenderResult<RegistrationsComponent>;

  it('should create', async () => {
    component = await render(RegistrationsComponent, {
      imports: [ReactiveFormsModule, HttpClientTestingModule, RouterTestingModule],
      declarations: [FirstErrorPipe, RegistrationComponent],
      providers: [RegistrationsService, RegistrationSurveyService],
    });

    expect(component).toBeTruthy();
  });

  it('can get registrations', () => {
    inject([HttpClientTestingModule], async () => {
      const registrations = [
        {
          establishment: {
            id: 1,
            nmdsId: 'J1234567',
          },
        },
        {
          establishment: {
            id: 2,
            nmdsId: 'J5678910',
          },
        },
      ];

      const registrationService = TestBed.inject(RegistrationsService);
      spyOn(registrationService, 'getRegistrations').and.returnValue(of(registrations));

      const { fixture } = await render(RegistrationsComponent, {
        imports: [ReactiveFormsModule, HttpClientTestingModule, RouterTestingModule],
        declarations: [FirstErrorPipe, RegistrationComponent],
        providers: [
          {
            provide: RegistrationsService,
            useClass: registrationService,
          },
          {
            provide: RegistrationSurveyService,
            useClass: RegistrationSurveyService,
            deps: [HttpClient],
          },
        ],
      });

      const { componentInstance } = fixture;

      expect(componentInstance.registrations).toEqual(registrations);
    });
  });

  it('should remove registrations', async () => {
    const registrations = [
      {
        establishment: {
          id: 1,
          nmdsId: 'J1234567',
        },
      },
      {
        establishment: {
          id: 2,
          nmdsId: 'J5678910',
        },
      },
    ];

    const { fixture } = await render(RegistrationsComponent, {
      imports: [ReactiveFormsModule, HttpClientTestingModule, RouterTestingModule],
      declarations: [FirstErrorPipe, RegistrationComponent],
      providers: [
        RegistrationsService,
        {
          provide: RegistrationSurveyService,
          useClass: RegistrationSurveyService,
          deps: [HttpClient],
        },
      ],
      componentProperties: {
        registrations,
      },
    });

    const { componentInstance } = fixture;

    componentInstance.handleRegistration(0);

    expect(componentInstance.registrations).toContain(registrations[0]);
    expect(componentInstance.registrations.length).toBe(1);
  });

  it('should download a report when the "Download report" button is clicked', async () => {
    const component = await render(RegistrationsComponent, {
      imports: [ReactiveFormsModule, HttpClientTestingModule, RouterTestingModule],
      declarations: [FirstErrorPipe, RegistrationComponent],
      providers: [
        RegistrationsService,
        {
          provide: RegistrationSurveyService,
          useClass: RegistrationSurveyService,
          deps: [HttpClient],
        },
      ],
    });

    const registrationSurveyService = TestBed.inject(RegistrationSurveyService);
    const getReport = spyOn(registrationSurveyService, 'getReport').and.callFake(() => of(null));
    const saveAs = spyOn(component.fixture.componentInstance, 'saveFile').and.callFake(() => {}); // eslint-disable-line @typescript-eslint/no-empty-function

    fireEvent.click(component.getByText('Download report', { exact: false }));

    expect(getReport).toHaveBeenCalled();
    expect(saveAs).toHaveBeenCalled();
  });
});
