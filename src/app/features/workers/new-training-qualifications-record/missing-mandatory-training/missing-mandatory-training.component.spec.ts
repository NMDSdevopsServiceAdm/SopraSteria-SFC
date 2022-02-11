import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterModule } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { SharedModule } from '@shared/shared.module';
import { render } from '@testing-library/angular';

import { WorkersModule } from '../../workers.module';
import { MissingMandatoryTrainingComponent } from './missing-mandatory-training.component';

describe('MissingMandatoryTrainingComponent', () => {
  async function setup(categories = [], canEditWorker = false) {
    const { fixture, getByText, getAllByText, queryByText, getByTestId, queryAllByTestId } = await render(
      MissingMandatoryTrainingComponent,
      {
        imports: [SharedModule, RouterModule, RouterTestingModule, HttpClientTestingModule, WorkersModule],
        providers: [],
        componentProperties: {
          missingMandatoryTraining: categories,
          canEditWorker,
        },
      },
    );

    const component = fixture.componentInstance;
    spyOn(component.addClicked, 'emit');

    return {
      component,
      fixture,
      getByText,
      getAllByText,
      getByTestId,
      queryByText,
      queryAllByTestId,
    };
  }

  it('should render a MissingMandatoryTrainingComponent', async () => {
    const { component } = await setup();
    expect(component).toBeTruthy();
  });

  it('should show a message saying what training is missing', async () => {
    const { getByText } = await setup([
      {
        category: 'Duty of care',
        id: 1,
      },
    ]);

    const message = getByText("'Duty of care' training needs to be added");
    expect(message).toBeTruthy();
  });

  it("should not show an add button if you don't have permission to edit a worker", async () => {
    const { queryAllByTestId } = await setup([
      {
        category: 'Duty of care',
        id: 1,
      },
    ]);

    const message = queryAllByTestId('1');
    expect(message.length).toEqual(0);
  });

  it('should show an add button if you have permission to edit a worker', async () => {
    const { getByTestId } = await setup(
      [
        {
          category: 'Duty of care',
          id: 1,
        },
      ],
      true,
    );

    const message = getByTestId('1');
    expect(message).toBeTruthy();
    expect(message.getAttribute('href')).toContain('/add-training');
  });

  it('should show a multiple messages saying what training is missing', async () => {
    const { getByText } = await setup([
      {
        category: 'Duty of care',
        id: 1,
      },
      {
        category: 'Autism',
        id: 2,
      },
    ]);

    const dutyOfCareMessage = getByText("'Duty of care' training needs to be added");
    expect(dutyOfCareMessage).toBeTruthy();
    const autismMessage = getByText("'Autism' training needs to be added");
    expect(autismMessage).toBeTruthy();
  });

  it('should emit an event when add button clicked', async () => {
    const { component } = await setup(
      [
        {
          category: 'Duty of care',
          id: 1,
        },
      ],
      true,
    );

    component.addButtonClicked();

    expect(component.addClicked.emit).toHaveBeenCalled();
  });
});
