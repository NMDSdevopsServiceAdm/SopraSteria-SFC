import { HttpClientTestingModule } from '@angular/common/http/testing';
import { BrowserModule } from '@angular/platform-browser';
import { RouterTestingModule } from '@angular/router/testing';
import { SharedModule } from '@shared/shared.module';
import { render } from '@testing-library/angular';

import { MakeAClaimProgressBarComponent } from './make-a-claim-progress-bar.component';

describe('MakeAClaimProgressBarComponent', () => {
  const setup = async (stepIndex = 0) => {
    const { fixture, getByText, queryByTestId } = await render(MakeAClaimProgressBarComponent, {
      imports: [RouterTestingModule, HttpClientTestingModule, BrowserModule, SharedModule],
      componentProperties: {
        stepIndex,
      },
    });

    const component = fixture.componentInstance;

    return { component, getByText, queryByTestId };
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
      const { queryByTestId } = await setup();

      expect(queryByTestId('currentStep-0')).toBeTruthy();
    });

    it('should show notCompleted icon next to second, third and fourth steps', async () => {
      const { queryByTestId } = await setup();

      expect(queryByTestId('notCompleted-1')).toBeTruthy();
      expect(queryByTestId('notCompleted-2')).toBeTruthy();
      expect(queryByTestId('notCompleted-3')).toBeTruthy();
    });

    it('should show grey lines after each step icon, nothing after fourth', async () => {
      const { queryByTestId } = await setup();

      expect(queryByTestId('greyLine-0')).toBeTruthy();
      expect(queryByTestId('greyLine-1')).toBeTruthy();
      expect(queryByTestId('greyLine-2')).toBeTruthy();

      expect(queryByTestId('blackLine-3')).toBeFalsy();
      expect(queryByTestId('greyLine-3')).toBeFalsy();
    });
  });

  describe('Second step in progress', () => {
    it('should show completed icon next to first step name', async () => {
      const { queryByTestId } = await setup(1);

      expect(queryByTestId('completed-0')).toBeTruthy();
    });

    it('should show currentStep icon next to second step name', async () => {
      const { queryByTestId } = await setup(1);

      expect(queryByTestId('currentStep-1')).toBeTruthy();
    });

    it('should show notCompleted icon next to second, third and fourth steps', async () => {
      const { queryByTestId } = await setup(1);

      expect(queryByTestId('notCompleted-2')).toBeTruthy();
      expect(queryByTestId('notCompleted-3')).toBeTruthy();
    });

    it('should show black line after first icon and grey lines after rest, nothing after fourth', async () => {
      const { queryByTestId } = await setup(1);

      expect(queryByTestId('blackLine-0')).toBeTruthy();
      expect(queryByTestId('greyLine-1')).toBeTruthy();
      expect(queryByTestId('greyLine-2')).toBeTruthy();

      expect(queryByTestId('blackLine-3')).toBeFalsy();
      expect(queryByTestId('greyLine-3')).toBeFalsy();
    });
  });

  describe('Third step in progress', () => {
    it('should show completed icon next to first and second step names', async () => {
      const { queryByTestId } = await setup(2);

      expect(queryByTestId('completed-0')).toBeTruthy();
      expect(queryByTestId('completed-1')).toBeTruthy();
    });

    it('should show currentStep icon next to third step name', async () => {
      const { queryByTestId } = await setup(2);

      expect(queryByTestId('currentStep-2')).toBeTruthy();
    });

    it('should show notCompleted icon next to fourth step name', async () => {
      const { queryByTestId } = await setup(2);

      expect(queryByTestId('notCompleted-3')).toBeTruthy();
    });

    it('should show black line after first two icons, grey line after third, nothing after fourth', async () => {
      const { queryByTestId } = await setup(2);

      expect(queryByTestId('blackLine-0')).toBeTruthy();
      expect(queryByTestId('blackLine-1')).toBeTruthy();
      expect(queryByTestId('greyLine-2')).toBeTruthy();

      expect(queryByTestId('blackLine-3')).toBeFalsy();
      expect(queryByTestId('greyLine-3')).toBeFalsy();
    });
  });

  describe('Fourth step in progress', () => {
    it('should show completed icon next to first and second step names', async () => {
      const { queryByTestId } = await setup(3);

      expect(queryByTestId('completed-0')).toBeTruthy();
      expect(queryByTestId('completed-1')).toBeTruthy();
      expect(queryByTestId('completed-2')).toBeTruthy();
    });

    it('should show currentStep icon next to third step name', async () => {
      const { queryByTestId } = await setup(3);

      expect(queryByTestId('currentStep-3')).toBeTruthy();
    });

    it('should show black lines after all icons and nothing after fourth', async () => {
      const { queryByTestId } = await setup(3);

      expect(queryByTestId('blackLine-0')).toBeTruthy();
      expect(queryByTestId('blackLine-1')).toBeTruthy();
      expect(queryByTestId('blackLine-2')).toBeTruthy();

      expect(queryByTestId('blackLine-3')).toBeFalsy();
      expect(queryByTestId('greyLine-3')).toBeFalsy();
    });
  });
});
