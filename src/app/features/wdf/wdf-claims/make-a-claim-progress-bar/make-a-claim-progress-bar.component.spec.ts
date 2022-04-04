import { HttpClientTestingModule } from '@angular/common/http/testing';
import { BrowserModule } from '@angular/platform-browser';
import { RouterTestingModule } from '@angular/router/testing';
import { SharedModule } from '@shared/shared.module';
import { render } from '@testing-library/angular';

import { MakeAClaimProgressBarComponent } from './make-a-claim-progress-bar.component';

describe('MakeAClaimProgressBarComponent', () => {
  const setup = async (stepIndex = 0) => {
    const { fixture, getByText, getByTestId } = await render(MakeAClaimProgressBarComponent, {
      imports: [RouterTestingModule, HttpClientTestingModule, BrowserModule, SharedModule],
      componentProperties: {
        stepIndex,
      },
    });

    const component = fixture.componentInstance;

    return { component, getByText, getByTestId };
  };

  it('should render a MakeAClaimProgressBarComponent', async () => {
    const { component } = await setup();
    expect(component).toBeTruthy();
  });

  it('should render all step names', async () => {
    const { getByText } = await setup();

    expect(getByText('Select qualification')).toBeTruthy();
    expect(getByText('Add learners')).toBeTruthy();
    expect(getByText('Upload certificate')).toBeTruthy();
    expect(getByText('Review and submit')).toBeTruthy();
  });

  describe('First step in progress', () => {
    it('should show currentStep icon next to first step name', async () => {
      const { getByTestId } = await setup();

      expect(getByTestId('currentStep-0')).toBeTruthy();
    });

    it('should show notCompleted icon next to second, third and fourth steps', async () => {
      const { getByTestId } = await setup();

      expect(getByTestId('notCompleted-1')).toBeTruthy();
      expect(getByTestId('notCompleted-2')).toBeTruthy();
      expect(getByTestId('notCompleted-3')).toBeTruthy();
    });
  });

  describe('Second step in progress', () => {
    it('should show completed icon next to first step name', async () => {
      const { getByTestId } = await setup(1);

      expect(getByTestId('completed-0')).toBeTruthy();
    });

    it('should show currentStep icon next to second step name', async () => {
      const { getByTestId } = await setup(1);

      expect(getByTestId('currentStep-1')).toBeTruthy();
    });

    it('should show notCompleted icon next to second, third and fourth steps', async () => {
      const { getByTestId } = await setup(1);

      expect(getByTestId('notCompleted-2')).toBeTruthy();
      expect(getByTestId('notCompleted-3')).toBeTruthy();
    });
  });

  describe('Third step in progress', () => {
    it('should show completed icon next to first and second step names', async () => {
      const { getByTestId } = await setup(2);

      expect(getByTestId('completed-0')).toBeTruthy();
      expect(getByTestId('completed-1')).toBeTruthy();
    });

    it('should show currentStep icon next to third step name', async () => {
      const { getByTestId } = await setup(2);

      expect(getByTestId('currentStep-2')).toBeTruthy();
    });

    it('should show notCompleted icon next to fourth step name', async () => {
      const { getByTestId } = await setup(2);

      expect(getByTestId('notCompleted-3')).toBeTruthy();
    });
  });

  describe('Fourth step in progress', () => {
    it('should show completed icon next to first and second step names', async () => {
      const { getByTestId } = await setup(3);

      expect(getByTestId('completed-0')).toBeTruthy();
      expect(getByTestId('completed-1')).toBeTruthy();
      expect(getByTestId('completed-2')).toBeTruthy();
    });

    it('should show currentStep icon next to third step name', async () => {
      const { getByTestId } = await setup(3);

      expect(getByTestId('currentStep-3')).toBeTruthy();
    });
  });
});
