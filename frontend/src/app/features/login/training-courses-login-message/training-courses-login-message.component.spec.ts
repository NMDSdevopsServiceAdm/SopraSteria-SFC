import { render } from '@testing-library/angular';
import { TrainingCoursesLoginMessage } from './training-courses-login-message.component';
import { provideRouter, RouterModule } from '@angular/router';
import { UserService } from '@core/services/user.service';
import { of } from 'rxjs';

describe('TrainingCoursesLoginMessage', () => {
  const userUid = 'user-uid';
  async function setup() {
    const updateTrainingCoursesMessageViewedQuantitySpy = jasmine
      .createSpy('updateTrainingCoursesMessageViewedQuantity')
      .and.returnValue(of(null));

    const setupTools = await render(TrainingCoursesLoginMessage, {
      imports: [RouterModule],
      providers: [
        {
          provide: UserService,
          useValue: {
            loggedInUser: {
              uid: userUid,
            },
            updateTrainingCoursesMessageViewedQuantity: updateTrainingCoursesMessageViewedQuantitySpy,
          },
        },
        provideRouter([]),
      ],
    });

    const component = setupTools.fixture.componentInstance;

    return {
      ...setupTools,
      component,
      updateTrainingCoursesMessageViewedQuantitySpy,
    };
  }

  it('should render a WhatsNewLoginMessage', async () => {
    const { component } = await setup();

    expect(component).toBeTruthy();
  });

  it('should show a h1 heading', async () => {
    const { getByRole } = await setup();

    const heading = getByRole('heading', { level: 1 });

    expect(heading.textContent).toContain("What's new in ASC-WDS?");
  });

  it('should navigate to the training and qualifications page when the link is clicked', async () => {
    const { getByText } = await setup();

    const link = getByText('training and qualifications');

    expect(link.getAttribute('href')).toEqual('/dashboard#training-and-qualifications');
  });

  it('should navigate to the home page when the button is clicked', async () => {
    const { getByText } = await setup();

    const button = getByText('Close this page');

    expect(button.getAttribute('href')).toEqual('/dashboard');
  });

  it('should call updateTrainingCoursesMessageViewedQuantity in UserService on page load', async () => {
    const { updateTrainingCoursesMessageViewedQuantitySpy } = await setup();

    expect(updateTrainingCoursesMessageViewedQuantitySpy).toHaveBeenCalledWith(userUid);
  });
});
