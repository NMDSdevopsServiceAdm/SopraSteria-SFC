import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { WizardService } from '@core/services/wizard.service';
import { MockActivatedRoute } from '@core/test-utils/MockActivatedRoute';
import { MockWizardService } from '@core/test-utils/MockWizardService';
import { SharedModule } from '@shared/shared.module';
import { fireEvent, render } from '@testing-library/angular';

import { FirstLoginWizardComponent } from './first-login-wizard.component';

describe('FirstLoginWizardComponent', () => {
  const wizard = MockWizardService.wizardFactory();

  async function setup() {
    const { fixture, getByText, queryByText, getByAltText } = await render(FirstLoginWizardComponent, {
      imports: [SharedModule, RouterModule, RouterTestingModule, HttpClientTestingModule],
      providers: [
        { provide: WizardService, useClass: MockWizardService },
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

    const component = fixture.componentInstance;
    return {
      component,
      fixture,
      getByText,
      queryByText,
      getByAltText,
    };
  }

  it('should render a FirstLoginWizardComponent', async () => {
    const { component } = await setup();
    expect(component).toBeTruthy();
  });

  it('should display title of the sign in wizard', async () => {
    const { getByText } = await setup();
    expect(getByText(wizard.data[0].title)).toBeTruthy();
  });

  it('should display content of the sign in wizard', async () => {
    const { getByText } = await setup();
    expect(getByText(wizard.data[0].content)).toBeTruthy();
  });

  it('should have correct href on the Close button', async () => {
    const { getByText } = await setup();

    const closeButton = getByText('Close', { exact: false });

    expect(closeButton.getAttribute('href')).toEqual('/dashboard');
  });

  it('should set the isFirst and isLast variables on init', async () => {
    const { component } = await setup();

    expect(component.isFirst).toBeTrue();
    expect(component.isLast).toBeFalse();
  });

  it('should set the currentIndex to 0 on init', async () => {
    const { component } = await setup();

    expect(component.currentIndex).toBe(0);
  });

  it('should render a video if there is a video available', async () => {
    const { fixture, getByAltText } = await setup();
    fixture.detectChanges();
    fixture.whenStable().then(() => {
      expect(getByAltText(wizard.data[0].video)).toBeTruthy();
      expect(getByAltText(wizard.data[0].image)).toBeFalsy();
    });
  });

  it('should render a image if there is no video available', async () => {
    const { fixture, getByAltText } = await setup();
    fixture.detectChanges();
    fixture.whenStable().then(() => {
      expect(getByAltText(wizard.data[1].video)).toBeFalsy();
      expect(getByAltText(wizard.data[1].image)).toBeTruthy();
    });
  });

  describe('Next button', () => {
    it('should update variables when clicking the next button to load middle wizard', async () => {
      const { component, fixture, getByText } = await setup();

      const nextButton = getByText('Next');
      fireEvent.click(nextButton);
      fixture.detectChanges();

      expect(component.currentIndex).toBe(1);
      expect(component.isFirst).toBeFalse();
      expect(component.isLast).toBeFalse();
    });

    it('should update variables when clicking the next button twice to load final wizard', async () => {
      const { component, fixture, getByText } = await setup();

      const nextButton = getByText('Next');
      fireEvent.click(nextButton);
      fireEvent.click(nextButton);
      fixture.detectChanges();

      expect(component.currentIndex).toBe(2);
      expect(component.isFirst).toBeFalse();
      expect(component.isLast).toBeTrue();
    });

    it('should update the title and content when clicking the next button to load middle wizard', async () => {
      const { fixture, getByText } = await setup();

      const nextButton = getByText('Next');
      fireEvent.click(nextButton);
      fixture.detectChanges();

      expect(getByText(wizard.data[1].title)).toBeTruthy();
      expect(getByText(wizard.data[1].content)).toBeTruthy();
    });

    it('should not render the next button when on the last wizard', async () => {
      const { component, fixture, getByText, queryByText } = await setup();

      component.currentIndex = 2;
      component.updateVariables();
      fixture.detectChanges();

      expect(queryByText('Next')).toBeFalsy();
      expect(getByText('Previous')).toBeTruthy();
    });
  });

  describe('Previous button', () => {
    it('should update variables when clicking the previous button to load first wizard', async () => {
      const { component, fixture, getByText } = await setup();

      const nextButton = getByText('Next');
      fireEvent.click(nextButton);
      fixture.detectChanges();

      expect(component.currentIndex).toBe(1);
      expect(component.isFirst).toBeFalse();
      expect(component.isLast).toBeFalse();

      const previousButton = getByText('Previous');
      fireEvent.click(previousButton);
      fixture.detectChanges();

      expect(component.currentIndex).toBe(0);
      expect(component.isFirst).toBeTrue();
      expect(component.isLast).toBeFalse();
    });

    it('should update the title and content when clicking the previous button to load first wizard', async () => {
      const { fixture, getByText } = await setup();

      const nextButton = getByText('Next');
      fireEvent.click(nextButton);
      fixture.detectChanges();

      expect(getByText(wizard.data[1].title)).toBeTruthy();
      expect(getByText(wizard.data[1].content)).toBeTruthy();

      const previousButton = getByText('Previous');
      fireEvent.click(previousButton);
      fixture.detectChanges();

      expect(getByText(wizard.data[0].title)).toBeTruthy();
      expect(getByText(wizard.data[0].content)).toBeTruthy();
    });

    it('should not render the previous button when on the first wizard', async () => {
      const { component, fixture, getByText, queryByText } = await setup();

      component.currentIndex = 0;
      component.updateVariables();
      fixture.detectChanges();

      expect(getByText('Next')).toBeTruthy();
      expect(queryByText('Previous')).toBeFalsy();
    });

    it('should not render the previous button when on the first wizard', async () => {
      const { component, fixture, getByText, queryByText } = await setup();

      component.currentIndex = 0;
      component.updateVariables();
      fixture.detectChanges();

      expect(getByText('Next')).toBeTruthy();
      expect(queryByText('Previous')).toBeFalsy();
    });
  });

  describe('Next page title underneath next button', () => {
    it('should display the title for the next page when first wizard is loaded', async () => {
      const { getByText } = await setup();

      const nextButtonTitle = getByText(wizard.data[1].title);
      expect(nextButtonTitle).toBeTruthy();
    });

    it('should update variables when clicking the next button title to load middle wizard', async () => {
      const { component, fixture, getByText } = await setup();

      const nextButtonTitle = getByText(wizard.data[1].title);
      fireEvent.click(nextButtonTitle);

      expect(component.currentIndex).toBe(1);
      expect(component.isFirst).toBeFalse();
      expect(component.isLast).toBeFalse();
    });

    describe('Previous page title underneath Previous button', () => {
      it('should display the title for the previous page when second wizard is loaded', async () => {
        const { getByText } = await setup();

        const nextButtonTitle = getByText(wizard.data[1].title);
        expect(nextButtonTitle).toBeTruthy();
      });

      it('should update variables when clicking the previous button title to load first wizard', async () => {
        const { component, fixture, getByText } = await setup();

        const nextButton = getByText('Next');
        fireEvent.click(nextButton);
        fixture.detectChanges();

        const previousButtonTitle = getByText(wizard.data[0].title);
        fireEvent.click(previousButtonTitle);

        expect(component.currentIndex).toBe(0);
        expect(component.isFirst).toBeTrue();
        expect(component.isLast).toBeFalse();
      });
    });
  });
});
