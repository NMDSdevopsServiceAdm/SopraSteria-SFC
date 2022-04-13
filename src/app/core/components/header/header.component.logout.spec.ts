import { HttpClient } from '@angular/common/http';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { fakeAsync, TestBed, tick } from '@angular/core/testing';
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
import { MockFeatureFlagsService } from '@core/test-utils/MockFeatureFlagService';
import { MockUserService } from '@core/test-utils/MockUserService';
import { TestRootComponent } from '@core/test-utils/TestRootComponent';
import { LogoutComponent } from '@features/logout/logout.component';
import { SatisfactionSurveyComponent } from '@features/satisfaction-survey/satisfaction-survey.component';
import { FeatureFlagsService } from '@shared/services/feature-flags.service';
import { SharedModule } from '@shared/shared.module';
import { fireEvent, render, RenderResult } from '@testing-library/angular';

async function renderHeaderComponent(isAdmin: boolean) {
  component = await render(TestRootComponent, {
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
        useFactory: MockUserService.factory(0, isAdmin),
        deps: [HttpClient],
      },
      {
        provide: FeatureFlagsService,
        useClass: MockFeatureFlagsService,
      },
      {
        provide: AuthService,
        useFactory: MockAuthService.factory(true, isAdmin),
        deps: [HttpClient, Router, EstablishmentService, UserService, PermissionsService],
      },
      {
        provide: EstablishmentService,
        useClass: MockEstablishmentService,
      },
    ],
  });
}

function advance(): void {
  tick(50);
  component.fixture.detectChanges();
}

async function navigateToHome() {
  fakeAsync(async () => {
    const router = TestBed.inject(Router);
    router.navigate(['/']);
    advance();
  })();
}

let component: RenderResult<TestRootComponent>;

describe('HeaderComponent', () => {
  function setup(showSurvey, callApi = true) {
    const { getByText } = component;
    fireEvent.click(getByText('Sign out'));

    if (callApi) {
      const req = TestBed.inject(HttpTestingController).expectOne('/api/logout');
      req.flush({
        showSurvey,
      });
    } else {
      TestBed.inject(HttpTestingController).expectNone('/api/logout');
    }

    advance();
  }

  afterEach(() => {
    TestBed.inject(HttpTestingController).verify();
  });

  describe('logging out', () => {
    beforeEach(async () => {
      await renderHeaderComponent(false);
      navigateToHome();
    });

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
      const userId = TestBed.inject(UserService).loggedInUser.uid;

      expect(router.url).toBe(`/satisfaction-survey?wid=${establishmentId}&uid=${userId}`);
    }));
  });

  describe('logging out as admin', () => {
    beforeEach(async () => {
      await renderHeaderComponent(true);
      navigateToHome();
    });

    it('should not navigate to the satisfaction survey when user is admin', fakeAsync(async () => {
      const { getByText } = component;

      setup(true, false);

      const signedOut = getByText('You have been signed out.');

      expect(signedOut).toBeTruthy();
    }));
  });
});
