import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TrainingService } from '@core/services/training.service';
import { MockTrainingServiceWithPreselectedStaff } from '@core/test-utils/MockTrainingService';
import { render } from '@testing-library/angular';
import { ConfirmMultipleTrainingComponent } from './confirm-multiple-training.component';

fdescribe('ConfirmMultipleTrainingComponent', () => {
  async function setup() {
    const { fixture, getByTestId, getByText } = await render(ConfirmMultipleTrainingComponent, {
      imports: [HttpClientTestingModule],
      providers: [
        {
          provide: TrainingService,
          useClass: MockTrainingServiceWithPreselectedStaff,
        },
      ],
    });
    const component = fixture.componentInstance;

    return { component, getByTestId, getByText };
  }

  it('should render', async () => {
    const { component } = await setup();
    expect(component).toBeTruthy();
  });

  it('should display the correct title and heading', async () => {
    const { component, getByText } = await setup();
    expect(getByText('Add multiple records')).toBeTruthy();
    expect(getByText('Summary')).toBeTruthy();
  });

  it('should display the correct text', async () => {
    const { component, getByText } = await setup();
    expect(getByText('Check these details before you confirm them.')).toBeTruthy;
  });

  it('should display the confirm button', async () => {
    const { component, getByTestId } = await setup();
    const button = getByTestId('confirmButton');
    expect(button.textContent).toBe('Confirm details');
  });

  it('should display the MultipleTrainingSummaryComponent', async () => {
    const { getByTestId } = await setup();
    expect(getByTestId('summaryComponent')).toBeTruthy();
  });
});
