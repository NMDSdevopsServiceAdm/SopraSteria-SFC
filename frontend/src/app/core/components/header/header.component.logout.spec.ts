import { HttpClient, provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { fakeAsync, TestBed, tick } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { provideRouter, Router, RouterModule } from '@angular/router';
import { HeaderComponent } from '@core/components/header/header.component';
import { Roles } from '@core/model/roles.enum';
import { AuthService } from '@core/services/auth.service';
import { EstablishmentService } from '@core/services/establishment.service';
import { NotificationsService } from '@core/services/notifications/notifications.service';
import { PermissionsService } from '@core/services/permissions/permissions.service';
import { UserService } from '@core/services/user.service';
import { MockAuthService } from '@core/test-utils/MockAuthService';
import { MockEstablishmentService } from '@core/test-utils/MockEstablishmentService';
import { MockFeatureFlagsService } from '@core/test-utils/MockFeatureFlagService';
import { MockNotificationsService } from '@core/test-utils/MockNotificationsService';
import { MockUserService } from '@core/test-utils/MockUserService';
import { TestRootComponent } from '@core/test-utils/TestRootComponent';
import { LogoutComponent } from '@features/logout/logout.component';
import { SatisfactionSurveyComponent } from '@features/satisfaction-survey/satisfaction-survey.component';
import { FeatureFlagsService } from '@shared/services/feature-flags.service';
import { SharedModule } from '@shared/shared.module';
import { fireEvent, render, RenderResult } from '@testing-library/angular';
import { environment } from 'src/environments/environment';

async function renderHeaderComponent(isAdmin: boolean) {
  const role = isAdmin ? Roles.Admin : Roles.Edit;
  component = await render(TestRootComponent, {
    imports: [FormsModule, ReactiveFormsModule, SharedModule, RouterModule],
    declarations: [HeaderComponent, LogoutComponent, SatisfactionSurveyComponent],
    providers: [
      {
        provide: UserService,
        useFactory: MockUserService.factory(0, role),
        deps: [HttpClient],
      },
      {
        provide: FeatureFlagsService,
        useClass: MockFeatureFlagsService,
      },
      {
        provide: NotificationsService,
        useClass: MockNotificationsService,
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
      provideRouter([
        { path: '', component: HeaderComponent },
        { path: 'logged-out', component: LogoutComponent },
        { path: 'satisfaction-survey', component: SatisfactionSurveyComponent },
      ]),
      provideHttpClient(),
      provideHttpClientTesting(),
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
      const req = TestBed.inject(HttpTestingController).expectOne(`${environment.appRunnerEndpoint}/api/logout`);
      req.flush({
        showSurvey,
      });
    } else {
      TestBed.inject(HttpTestingController).expectNone(`${environment.appRunnerEndpoint}/api/logout`);
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
