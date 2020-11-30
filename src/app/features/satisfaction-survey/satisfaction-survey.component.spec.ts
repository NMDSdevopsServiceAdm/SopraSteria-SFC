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
import { MockUserService } from '@core/test-utils/MockUserService';
import { TestRootComponent } from '@core/test-utils/TestRootComponent';
import { LogoutComponent } from '@features/logout/logout.component';
import { SharedModule } from '@shared/shared.module';
import { fireEvent, render, RenderResult } from '@testing-library/angular';

import { SatisfactionSurveyComponent } from './satisfaction-survey.component';

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
    ],
  });
};

const setup = async (fixture, navigate, getByText, isLocked = false) => {
  const httpTestingController = TestBed.inject(HttpTestingController);

  await navigate('search-users');

  fixture.detectChanges();

  fireEvent.click(getByText('Search users'));

  const req = httpTestingController.expectOne('/api/admin/search/users');
  req.flush([
    {
      uid: 'ad3bbca7-2913-4ba7-bb2d-01014be5c48f',
      name: 'John Doe',
      username: 'Username',
      securityQuestion: 'Question',
      securityQuestionAnswer: 'Answer',
      isLocked,
      establishment: {
        uid: 'ad3bbca7-2913-4ba7-bb2d-01014be5c48f',
        name: 'My workplace',
        nmdsId: 'G1001376',
      },
    },
  ]);

  fixture.detectChanges();
};

let component: RenderResult<TestRootComponent>;

function getActiveComponent<T>(): T {
  return component.fixture.componentInstance.routerOutlet.component as T;
}

function advance(): void {
  flush();
  component.fixture.detectChanges();
}

beforeEach(fakeAsync(async () => {
  component = await getHeaderComponent();
  const router = TestBed.inject(Router);
  router.navigate(['/']);
  advance();
}));

fdescribe('SatisfactionSurveyComponent', () => {
  describe('logging out', () => {
    it('should navigate to the logged out when it has been less than 90 days since survey last shown', fakeAsync(async () => {
      const { getByText } = component;

      const logout = getByText('Logout');

      fireEvent.click(logout);

      advance();

      const signedOut = getByText('You have been signed out.');

      expect(signedOut).toBeTruthy();
    }));

    it('should navigate to the satisfaction survey when it has been more than 90 days since survey last shown', fakeAsync(async () => {
      const { getByText } = component;

      const logout = getByText('Logout');

      fireEvent.click(logout);

      advance();

      const signedOut = getByText('You have been signed out.');

      expect(signedOut).toBeTruthy();
    }));
  });
});
