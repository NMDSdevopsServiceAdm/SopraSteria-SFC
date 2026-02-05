import { ComponentFixture, getTestBed, TestBed } from '@angular/core/testing';

import { UserResearchInviteComponent } from './user-research-invite.component';
import { render } from '@testing-library/angular';
import {
  IncludeTrainingCourseDetailsComponent
} from '@features/training-and-qualifications/include-training-course-details/include-training-course-details.component';
import { Router } from '@angular/router';
import { TrainingService } from '@core/services/training.service';
import { BackLinkService } from '@core/services/backLink.service';
import { SharedModule } from '@shared/shared.module';
import { RegistrationModule } from '@features/registration/registration.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

fdescribe('UserResearchInviteComponent', () => {
  async function setup() {
    const setupTools = await render(UserResearchInviteComponent,
      {
        imports: [SharedModule],
      },
    );

    const component = setupTools.fixture.componentInstance;
    const injector = getTestBed();

    // const router = injector.inject(Router) as Router;

    // const routerSpy = spyOn(router, 'navigate').and.returnValue(Promise.resolve(true));
    // const trainingService = injector.inject(TrainingService) as TrainingService;
    const backLinkService = injector.inject(BackLinkService) as BackLinkService;
    const showBackLinkSpy = spyOn(backLinkService, 'showBackLink');
    // const setSelectedTrainingCourseSpy = spyOn(trainingService, 'setSelectedTrainingCourse');

    return {
      ...setupTools,
      component,
      // routerSpy,
      // setSelectedTrainingCourseSpy,
      showBackLinkSpy,
      // worker,
      // workplace,
    };
  }

  it('should create', async () => {
    const { component } = await setup();
    expect(component).toBeTruthy();
  });

  it(`displays a Back link`, async () => {
    const { component, showBackLinkSpy } = await setup();
    component.ngOnInit();
    expect(showBackLinkSpy).toHaveBeenCalled();
  });

  it('should display the User accounts caption', async () => {
    const { getByTestId } = await setup();
    const caption = getByTestId('caption');
    expect(caption.textContent).toEqual('User accounts');
  });

  it('should display the heading', async () => {
    const { getByTestId } = await setup();
    const caption = getByTestId('heading');
    expect(caption.textContent).toEqual('Would you like to take part in our user research sessions?');
  });

  it('should display the text', async () => {
    const { getByTestId } = await setup();
    const text = getByTestId('text')
    const textContent =
      'We’d like your help and it doesn’t matter if you’re new to ASC-WDS.' +
      'If you want to take part, select Yes so that a user researcher from our digital partner can contact you.'
    expect(text.textContent.trim()).toEqual(textContent);
  })

  describe('Additional details toggle', ()=> {
    it('should display the additional details toggle', async () => {
      const { getByTestId } = await setup();
      const toggle = getByTestId('details-toggle');
      expect(toggle.textContent.trim()).toEqual(
        'Why take part in our user research sessions?',
      );
    });

    it('should display the hidden text', async () => {
      const { component, fixture, getByTestId } = await setup();
      getByTestId('details-toggle').click();
      fixture.detectChanges();
      const firstDetailsParagraph = getByTestId("details-text-one")
      const secondDetailsParagraph = getByTestId("details-text-two")

      expect(firstDetailsParagraph.textContent.trim()).toEqual(component.detailsTextOne);
      expect(secondDetailsParagraph.textContent.trim()).toEqual(component.detailsTextTwo);
    });
  })





  // it('should render the workplace and user account progress bars', async () => {
  //   const { component } = await setup();
  //
  //   expect(component.getByTestId('progress-bar-1')).toBeTruthy();
  //   expect(component.getByTestId('progress-bar-2')).toBeTruthy();
  // });
  //
  // it('should not render the progress bars when accessed from outside the flow', async () => {
  //   const { component } = await setup(false);
  //
  //   expect(component.queryByTestId('progress-bar-1')).toBeFalsy();
  //   expect(component.queryByTestId('progress-bar-2')).toBeFalsy();
  // });
});
// tests - see create security question component
// not submit if blank
// continue or save and return button
// navigate to summary page

// ask about pre-filling answer in flow and if going from summary page
// save and return button if going from summary page
