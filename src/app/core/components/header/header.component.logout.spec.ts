import { HttpClient } from '@angular/common/http';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { fakeAsync, flush, TestBed } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { HeaderComponent } from '@core/components/header/header.component';
import { AuthService } from '@core/services/auth.service';
import { EstablishmentService } from '@core/services/establishment.service';
import { PermissionsService } from '@core/services/permissions/permissions.service';
import { UserService } from '@core/services/user.service';
import { MockAuthService } from '@core/test-utils/MockAuthService';
import { MockEstablishmentService } from '@core/test-utils/MockEstablishmentService';
import { MockUserService } from '@core/test-utils/MockUserService';
import { TestRootComponent } from '@core/test-utils/TestRootComponent';
import { LogoutComponent } from '@features/logout/logout.component';
import { SatisfactionSurveyComponent } from '@features/satisfaction-survey/satisfaction-survey.component';
import { SharedModule } from '@shared/shared.module';
import { fireEvent, render, RenderResult } from '@testing-library/angular';

const getHeaderComponent = async () => {
  return render(TestRootComponent, {
    imports: [
      FormsModule,
      ReactiveFormsModule,
      HttpClientTestingModule,
      SharedModule,
      RouterTestingModule.withRoutes([
        { path: '', component: HeaderComponent },
        { path: 'logged-out', component: LogoutComponent },
        { path: 'satisfaction-survey', component: SatisfactionSurveyComponent },
      ]),
    ],
    declarations: [HeaderComponent, LogoutComponent, SatisfactionSurveyComponent],
    providers: [
      {
        provide: UserService,
        useFactory: MockUserService.factory(0, false),
        deps: [HttpClient],
      },
      {
        provide: AuthService,
        useFactory: MockAuthService.factory(true),
        deps: [HttpClient, Router, EstablishmentService, UserService, PermissionsService],
      },
      {
        provide: EstablishmentService,
        useClass: MockEstablishmentService,
      },
    ],
  });
};

let component: RenderResult<TestRootComponent>;

describe('HeaderComponent', () => {
  function advance(): void {
    flush();
    component.fixture.detectChanges();
  }

  function setup(showSurvey) {
    const { getByText } = component;
    fireEvent.click(getByText('Logout'));

    const req = TestBed.inject(HttpTestingController).expectOne('/api/logout');
    req.flush({
      showSurvey,
    });

    advance();
  }

  afterEach(() => {
    TestBed.inject(HttpTestingController).verify();
  });

  beforeEach(async () => {
    component = await getHeaderComponent();
  });

  beforeEach(fakeAsync(async () => {
    const router = TestBed.inject(Router);
    router.navigate(['/']);
    advance();
  }));

  describe('logging out', () => {
    it('should navigate to the signed out page when show survey is false', fakeAsync(async () => {
      const { getByText } = component;

      setup(false);

      const signedOut = getByText('You have been signed out.');

      expect(signedOut).toBeTruthy();
    }));

    it('should navigate to the satisfaction survey when show survey is true', fakeAsync(async () => {
      const { getByText } = component;

      setup(true);

      const satisfactionSurvey = getByText('Satisfaction survey');

      expect(satisfactionSurvey).toBeTruthy();
    }));

    it('should navigate to the satisfaction survey with establiment id in the url', fakeAsync(async () => {
      setup(true);

      const router = TestBed.inject(Router);
      const establishmentId = TestBed.inject(EstablishmentService).establishmentId;

      expect(router.url).toBe(`/satisfaction-survey?wid=${establishmentId}`);
    }));
  });
});
