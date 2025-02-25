import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { WizardService } from '@core/services/wizard.service';
import { MockActivatedRoute } from '@core/test-utils/MockActivatedRoute';
import { MockWizardService } from '@core/test-utils/MockWizardService';
import { SharedModule } from '@shared/shared.module';
import { fireEvent, render, within } from '@testing-library/angular';

import { GetStartedComponent } from './get-started.component';
import { BreadcrumbService } from '@core/services/breadcrumb.service';
import { MockBreadcrumbService } from '@core/test-utils/MockBreadcrumbService';

describe('GetStartedComponent', () => {
  const wizard = MockWizardService.wizardFactory();

  async function setup() {
    const setupTools = await render(GetStartedComponent, {
      imports: [SharedModule, RouterModule, RouterTestingModule, HttpClientTestingModule],
      providers: [
        { provide: WizardService, useClass: MockWizardService },
        {
          provide: BreadcrumbService,
          useClass: MockBreadcrumbService,
        },
        {
          provide: ActivatedRoute,
          useValue: new MockActivatedRoute({
            snapshot: {
              data: {
                wizard,
              },
            },
          }),
        },
      ],
    });

    const component = setupTools.fixture.componentInstance;
    return {
      ...setupTools,
      component,
    };
  }

  it('should render a GetStartedComponent', async () => {
    const { component } = await setup();
    expect(component).toBeTruthy();
  });

  describe('What you need to know video section', () => {
    it('should display title of the first wizard (What you need to know)', async () => {
      const { getByText } = await setup();
      expect(getByText(wizard.data[0].title)).toBeTruthy();
    });

    it('should display content of the first wizard', async () => {
      const { getByText } = await setup();
      expect(getByText(wizard.data[0].content)).toBeTruthy();
    });

    it('should render video from first wizard item in the cms', async () => {
      const { queryByTestId } = await setup();

      const videoElement = queryByTestId('video');

      expect(videoElement).toBeTruthy();
      expect(videoElement.getAttribute('src')).toEqual(wizard.data[0].video);
    });
  });

  it('should render title, image and content from second item in the cms', async () => {
    const { getByText, queryByTestId } = await setup();

    const imageElement = queryByTestId('image');
    const expectedTitle = `A closer look at ASC-WDS: ${wizard.data[1].title.toLowerCase()}`;

    expect(getByText(expectedTitle)).toBeTruthy();
    expect(getByText(wizard.data[1].content)).toBeTruthy();
    expect(imageElement.getAttribute('src')).toContain(wizard.data[1].image);
  });

  it('should not render content or image from third item from cms on load', async () => {
    const { queryByText, queryByTestId } = await setup();

    const imageElement = queryByTestId('image');

    expect(queryByText(wizard.data[2].content)).toBeFalsy();
    expect(imageElement.getAttribute('src')).not.toContain(wizard.data[2].image);
  });

  describe('Next button', () => {
    it('should update the title and content to be next wizard after clicking the next button', async () => {
      const { fixture, getByText, queryByTestId } = await setup();

      const nextButton = getByText('Next');
      fireEvent.click(nextButton);
      fixture.detectChanges();

      const imageElement = queryByTestId('image');
      const expectedTitle = `A closer look at ASC-WDS: ${wizard.data[2].title.toLowerCase()}`;

      expect(getByText(expectedTitle)).toBeTruthy();
      expect(getByText(wizard.data[2].content)).toBeTruthy();
      expect(imageElement.getAttribute('src')).toContain(wizard.data[2].image);
    });

    it('should display the title for the next page when first wizard is loaded', async () => {
      const { getByTestId } = await setup();

      const nextButton = getByTestId('nextButton');
      const nextButtonTitle = wizard.data[2].title;

      expect(within(nextButton).getByText(nextButtonTitle)).toBeTruthy();
    });

    it('should update the title of next page under Next after clicking the next button', async () => {
      const { fixture, getByTestId } = await setup();

      const nextButton = getByTestId('nextButton');

      fireEvent.click(nextButton);
      fixture.detectChanges();

      const nextButtonTitle = wizard.data[3].title;

      expect(within(nextButton).getByText(nextButtonTitle)).toBeTruthy();
    });

    it('should not render the next button when on the last wizard', async () => {
      const { component, fixture, queryByText } = await setup();

      component.currentIndex = wizard.data.length - 1;
      component.updatePreviousAndNextLinks();
      fixture.detectChanges();

      expect(queryByText('Previous')).toBeTruthy();
      expect(queryByText('Next')).toBeFalsy();
    });
  });

  describe('Previous button', () => {
    it('should update the title and content when clicking the previous button to load second wizard', async () => {
      const { fixture, getByText } = await setup();

      const nextButton = getByText('Next');
      fireEvent.click(nextButton);
      fixture.detectChanges();

      const nextTitle = `A closer look at ASC-WDS: ${wizard.data[2].title.toLowerCase()}`;
      const previousTitle = `A closer look at ASC-WDS: ${wizard.data[1].title.toLowerCase()}`;

      expect(getByText(nextTitle)).toBeTruthy();
      expect(getByText(wizard.data[2].content)).toBeTruthy();

      const previousButton = getByText('Previous');
      fireEvent.click(previousButton);
      fixture.detectChanges();

      expect(getByText(previousTitle)).toBeTruthy();
      expect(getByText(wizard.data[1].content)).toBeTruthy();
    });

    it('should display the title for the previous page when on second page', async () => {
      const { fixture, getByText, getByTestId } = await setup();

      const nextButton = getByText('Next');
      fireEvent.click(nextButton);
      fixture.detectChanges();

      const previousButton = getByTestId('previousButton');
      const previousButtonTitle = wizard.data[1].title;

      expect(within(previousButton).getByText(previousButtonTitle)).toBeTruthy();
    });

    it('should not render the previous button when on the first wizard', async () => {
      const { queryByText } = await setup();

      expect(queryByText('Next')).toBeTruthy();
      expect(queryByText('Previous')).toBeFalsy();
    });
  });
});
