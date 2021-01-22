import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { LoginComponent } from '@features/login/login.component';
import { SharedModule } from '@shared/shared.module';
import { fireEvent, render } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';
import { of } from 'rxjs';

import { SatisfactionSurveyComponent } from './satisfaction-survey.component';

const getSatisfactionSurveyComponent = async () => {
  return render(SatisfactionSurveyComponent, {
    imports: [
      FormsModule,
      ReactiveFormsModule,
      HttpClientTestingModule,
      SharedModule,
      RouterTestingModule.withRoutes([
        {
          path: 'login',
          component: LoginComponent,
        },
      ]),
    ],
    providers: [
      {
        provide: ActivatedRoute,
        useValue: {
          queryParams: of({ wid: 'workplace-uid', uid: 'user-uid' }),
        },
      },
    ],
  });
};

describe('SatisfactionSurveyComponent', () => {
  describe('submit survey', () => {
    async function setup(fillInSurvey: boolean) {
      const { fixture, getByRole } = await getSatisfactionSurveyComponent();

      if (fillInSurvey) {
        fireEvent.click(getElementById('#didYouDoEverything-no'));
        userEvent.type(getElementById('#whatStoppedYouDoingAnything'), 'answer');
        fireEvent.click(getElementById('#howDidYouFeel-neither'));
      }

      const submit = getByRole('button');
      fireEvent.click(submit);
      const req = TestBed.inject(HttpTestingController).expectOne('/api/satisfactionSurvey');
      req.flush({});

      function getElementById(id) {
        return fixture.debugElement.query(By.css(id)).nativeElement;
      }

      return { fixture, req };
    }

    afterEach(() => {
      TestBed.inject(HttpTestingController).verify();
    });

    it('should submit survey without filling in the answers', async () => {
      const { req } = await setup(false);

      expect(req.request.body).toEqual({
        establishmentId: 'workplace-uid',
        userId: 'user-uid',
        didYouDoEverything: null,
        didYouDoEverythingAdditionalAnswer: null,
        howDidYouFeel: null,
      });
    });

    it('should navigate to the login page after submitting the survey', async () => {
      const { fixture } = await setup(false);

      fixture.whenStable().then(() => {
        expect(TestBed.inject(Router).url).toBe('/login');
      });
    });

    it('should submit survey with the answers', async () => {
      const { req } = await setup(true);

      expect(req.request.body).toEqual({
        establishmentId: 'workplace-uid',
        userId: 'user-uid',
        didYouDoEverything: 'No',
        didYouDoEverythingAdditionalAnswer: 'answer',
        howDidYouFeel: 'Neither',
      });
    });
  });
});
