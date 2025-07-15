import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { getTestBed, TestBed } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { SharedModule } from '@shared/shared.module';
import { fireEvent, render } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';
import { of } from 'rxjs';

import { SatisfactionSurveyComponent } from './satisfaction-survey.component';
import { environment } from 'src/environments/environment';

const getSatisfactionSurveyComponent = async () => {
  return render(SatisfactionSurveyComponent, {
    imports: [FormsModule, ReactiveFormsModule, HttpClientTestingModule, SharedModule],
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

      const injector = getTestBed();
      const router = injector.inject(Router);
      const routerSpy = spyOn(router, 'navigate').and.resolveTo(true);

      if (fillInSurvey) {
        fireEvent.click(getElementById('#didYouDoEverything-no'));
        userEvent.type(getElementById('#whatStoppedYouDoingAnything'), 'answer');
        fireEvent.click(getElementById('#howDidYouFeel-neither'));
      }

      const submit = getByRole('button');
      fireEvent.click(submit);
      const req = TestBed.inject(HttpTestingController).expectOne(
        `${environment.appRunnerEndpoint}/api/satisfactionSurvey`,
      );
      req.flush({});

      function getElementById(id) {
        return fixture.debugElement.query(By.css(id)).nativeElement;
      }

      return { fixture, req, routerSpy };
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
      const { routerSpy } = await setup(false);

      expect(routerSpy).toHaveBeenCalledWith(['/login']);
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
