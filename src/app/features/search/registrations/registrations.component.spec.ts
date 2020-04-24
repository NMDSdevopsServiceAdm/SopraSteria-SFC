import { HttpClientTestingModule } from '@angular/common/http/testing';
import { inject, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { RegistrationsService } from '@core/services/registrations.service';
import { FirstErrorPipe } from '@shared/pipes/first-error.pipe';
import { render, RenderResult } from '@testing-library/angular';
import { of } from 'rxjs';

import { RegistrationComponent } from '../registration/registration.component';
import { RegistrationsComponent } from './registrations.component';

describe('RegistrationsComponent', () => {
  let component: RenderResult<RegistrationsComponent>;

  it('should create', async () => {
    component = await render(RegistrationsComponent, {
      imports: [ReactiveFormsModule, HttpClientTestingModule],
      declarations: [FirstErrorPipe, RegistrationComponent],
      providers: [RegistrationsService],
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
        }
      ];

      const registrationService = TestBed.get(RegistrationsService);
      spyOn(registrationService, 'getRegistrations').and.returnValue(
        of(registrations)
      );

      const { fixture } = await render(RegistrationsComponent, {
        imports: [ReactiveFormsModule, HttpClientTestingModule],
        declarations: [FirstErrorPipe, RegistrationComponent],
        providers: [
          {
            provide: RegistrationsService,
            useClass: registrationService
          }],
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
      }
    ];

    const { fixture } = await render(RegistrationsComponent, {
      imports: [ReactiveFormsModule, HttpClientTestingModule],
      declarations: [FirstErrorPipe, RegistrationComponent],
      providers: [RegistrationsService],
      componentProperties: {
        registrations
      },
    });

    const { componentInstance } = fixture;

    componentInstance.handleRegistration(0);

    expect(componentInstance.registrations).toContain(registrations[0]);
    expect(componentInstance.registrations.length).toBe(1);
  });
});
