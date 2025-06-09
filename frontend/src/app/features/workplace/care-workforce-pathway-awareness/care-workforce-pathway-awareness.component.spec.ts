import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ReactiveFormsModule, UntypedFormBuilder } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { EstablishmentService } from '@core/services/establishment.service';
import { MockEstablishmentServiceWithOverrides } from '@core/test-utils/MockEstablishmentService';
import { SharedModule } from '@shared/shared.module';
import { fireEvent, render, within } from '@testing-library/angular';
import { CareWorkforcePathwayAwarenessComponent } from './care-workforce-pathway-awareness.component';
import { HttpClient } from '@angular/common/http';
import { getTestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { CareWorkforcePathwayService } from '@core/services/care-workforce-pathway.service';
import {
  MockCareWorkforcePathwayService,
  careWorkforcePathwayAwarenessAnswers,
} from '@core/test-utils/MockCareWorkforcePathwayService';

describe('CareWorkforcePathwayAwarenessComponent', () => {
  const awareAnswers = careWorkforcePathwayAwarenessAnswers.slice(0, 3);
  const notAwareAnswers = careWorkforcePathwayAwarenessAnswers.slice(3, 5);

  async function setup(overrides: any = {}) {
    const setupTools = await render(CareWorkforcePathwayAwarenessComponent, {
      imports: [SharedModule, RouterModule, HttpClientTestingModule, ReactiveFormsModule],
      providers: [
        UntypedFormBuilder,
        {
          provide: EstablishmentService,
          useFactory: MockEstablishmentServiceWithOverrides.factory(overrides),
          deps: [HttpClient],
        },
        {
          provide: CareWorkforcePathwayService,
          useClass: MockCareWorkforcePathwayService,
        },
      ],
    });
    const component = setupTools.fixture.componentInstance;
    const injector = getTestBed();

    const establishmentService = injector.inject(EstablishmentService) as EstablishmentService;
    const establishmentServiceSpy = spyOn(establishmentService, 'updateCareWorkforcePathwayAwareness').and.returnValue(
      of({ data: {} }),
    );

    const router = injector.inject(Router) as Router;
    const routerSpy = spyOn(router, 'navigate').and.returnValue(Promise.resolve(true));

    return {
      ...setupTools,
      component,
      routerSpy,
      establishmentServiceSpy,
    };
  }

  it('should render CareWorkforcePathwayAwarenessComponent', async () => {
    const { component } = await setup();
    expect(component).toBeTruthy();
  });

  it('should show the section and the heading', async () => {
    const { getByTestId, getByText } = await setup();

    const sectionCaption = 'Recruitment and benefits';
    const heading = 'How aware of the care workforce pathway is your workplace?';

    expect(within(getByTestId('section-heading')).getByText(sectionCaption)).toBeTruthy();
    expect(getByText(heading)).toBeTruthy();
  });

  it('should show the hint', async () => {
    const { getByText } = await setup();

    const hintText = 'Select the option that best matches how aware your workplace is.';

    expect(getByText(hintText)).toBeTruthy();
  });

  it('should show the radio buttons', async () => {
    const { getByLabelText } = await setup();

    careWorkforcePathwayAwarenessAnswers.forEach((answer) => {
      expect(getByLabelText(answer.title)).toBeTruthy();
    });
  });

  it('should prefill the previously saved answer', async () => {
    const selectedId = careWorkforcePathwayAwarenessAnswers[0].id;
    const establishment = {
      careWorkforcePathwayWorkplaceAwareness: {
        id: selectedId,
      },
    };
    const { component, getByLabelText } = await setup({ establishmentObj: establishment });

    component.ngOnInit();

    const form = component.form;
    const radioButton = getByLabelText(careWorkforcePathwayAwarenessAnswers[0].title) as HTMLInputElement;

    expect(form.value.careWorkforcePathwayAwareness).toEqual(selectedId);
    expect(radioButton.checked).toBeTruthy();
    expect(form.valid).toBeTruthy();
  });

  describe('progress bar', () => {
    it('should render the progress bar when in the flow', async () => {
      const { getByTestId } = await setup({ returnToUrl: null });

      expect(getByTestId('progress-bar')).toBeTruthy();
    });

    it('should not render the progress bar when not in the flow', async () => {
      const { queryByTestId } = await setup({ returnToUrl: true });

      expect(queryByTestId('progress-bar')).toBeFalsy();
    });
  });

  describe('submit buttons', () => {
    describe('inside the flow', () => {
      it("should show 'Save and continue' button and 'Skip this question' link", async () => {
        const { getByText } = await setup({ returnToUrl: false });

        expect(getByText('Save and continue')).toBeTruthy();
        expect(getByText('Skip this question')).toBeTruthy();
      });

      it("should navigate to the cash-loyalty page when clicking 'Skip this question'", async () => {
        const { component, fixture, getByText, routerSpy } = await setup({ returnToUrl: false });

        const workplaceId = component.establishment.uid;
        const skipLink = getByText('Skip this question');
        fireEvent.click(skipLink);
        fixture.detectChanges();

        expect(routerSpy).toHaveBeenCalledWith(['/workplace', workplaceId, 'cash-loyalty']);
      });

      awareAnswers.forEach((awareAnswer) => {
        it(`should navigate to the care workforce pathway usage question when '${awareAnswer.title}' is clicked`, async () => {
          const { component, fixture, getByText, getByLabelText, routerSpy, establishmentServiceSpy } = await setup({
            returnToUrl: null,
          });

          const workplaceId = component.establishment.uid;

          const radioButton = getByLabelText(awareAnswer.title);
          fireEvent.click(radioButton);
          fixture.detectChanges();

          const saveButton = getByText('Save and continue');
          fireEvent.click(saveButton);
          fixture.detectChanges();

          expect(establishmentServiceSpy).toHaveBeenCalledWith(workplaceId, {
            careWorkforcePathwayWorkplaceAwareness: { id: awareAnswer.id },
          });
          expect(routerSpy).toHaveBeenCalledWith(['/workplace', workplaceId, 'care-workforce-pathway-use']);
        });
      });

      notAwareAnswers.forEach((awareAnswer) => {
        it(`should navigate to the next question when '${awareAnswer.title}' is clicked`, async () => {
          const { component, fixture, getByText, getByLabelText, routerSpy, establishmentServiceSpy } = await setup({
            returnToUrl: null,
          });

          const workplaceId = component.establishment.uid;

          const radioButton = getByLabelText(awareAnswer.title);
          fireEvent.click(radioButton);
          fixture.detectChanges();

          const saveButton = getByText('Save and continue');
          fireEvent.click(saveButton);
          fixture.detectChanges();

          expect(establishmentServiceSpy).toHaveBeenCalledWith(workplaceId, {
            careWorkforcePathwayWorkplaceAwareness: { id: awareAnswer.id },
          });
          expect(routerSpy).toHaveBeenCalledWith(['/workplace', workplaceId, 'cash-loyalty']);
        });
      });
    });

    describe('outside the flow', () => {
      it("should show 'Save and return' button and 'Cancel' link", async () => {
        const { getByText } = await setup({ returnToUrl: true });

        expect(getByText('Save and return')).toBeTruthy();
        expect(getByText('Cancel')).toBeTruthy();
      });

      it("should return to the workplace summary when 'Cancel' is clicked", async () => {
        const { fixture, getByText, routerSpy } = await setup({ returnToUrl: true });

        const cancelLink = getByText('Cancel');
        fireEvent.click(cancelLink);
        fixture.detectChanges();

        expect(routerSpy).toHaveBeenCalledWith(['/dashboard'], { fragment: 'workplace', queryParams: undefined });
      });

      awareAnswers.forEach((awareAnswer) => {
        it(`should navigate to the care workforce pathway usage question when '${awareAnswer.title}' is clicked`, async () => {
          const { component, fixture, getByText, getByLabelText, routerSpy, establishmentServiceSpy } = await setup({
            returnToUrl: true,
          });

          const workplaceId = component.establishment.uid;

          const radioButton = getByLabelText(awareAnswer.title);
          fireEvent.click(radioButton);
          fixture.detectChanges();

          const saveButton = getByText('Save and return');
          fireEvent.click(saveButton);
          fixture.detectChanges();

          expect(establishmentServiceSpy).toHaveBeenCalledWith(workplaceId, {
            careWorkforcePathwayWorkplaceAwareness: { id: awareAnswer.id },
          });
          expect(routerSpy).toHaveBeenCalledWith(['/workplace', workplaceId, 'care-workforce-pathway-use']);
        });
      });

      notAwareAnswers.forEach((awareAnswer) => {
        it(`should navigate to the workplace summary when '${awareAnswer.title}' is clicked`, async () => {
          const { component, fixture, getByText, getByLabelText, routerSpy, establishmentServiceSpy } = await setup({
            returnToUrl: true,
          });

          const workplaceId = component.establishment.uid;

          const radioButton = getByLabelText(awareAnswer.title);
          fireEvent.click(radioButton);
          fixture.detectChanges();

          const saveButton = getByText('Save and return');
          fireEvent.click(saveButton);
          fixture.detectChanges();

          expect(establishmentServiceSpy).toHaveBeenCalledWith(workplaceId, {
            careWorkforcePathwayWorkplaceAwareness: { id: awareAnswer.id },
          });
          expect(routerSpy).toHaveBeenCalledWith(['/dashboard'], { fragment: 'workplace', queryParams: undefined });
        });
      });
    });
  });
});
