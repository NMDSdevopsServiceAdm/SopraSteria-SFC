import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { Establishment } from '@core/model/establishment.model';
import { PermissionsService } from '@core/services/permissions/permissions.service';
import { render, RenderResult, within } from '@testing-library/angular';
import * as moment from 'moment';

import { TrainingAndQualificationsCategoriesComponent } from './training-and-qualifications-categories.component';

const sinon = require('sinon');
const { build, fake, sequence, perBuild } = require('@jackfranklin/test-data-bot');

const establishmentBuilder = build('Establishment', {
  fields: {
    id: sequence(),
    uid: fake((f) => f.random.uuid()),
    name: fake((f) => f.lorem.sentence()),
  },
});

const workerBuilder = build('Worker', {
  fields: {
    id: sequence(),
    uid: fake((f) => f.random.uuid()),
    NameOrIdValue: fake((f) => f.name.findName()),
    mainJob: perBuild(() => {
      return {
        id: sequence(),
        title: fake((f) => f.lorem.sentence()),
      };
    }),
  },
});

const trainingBuilder = build('Training', {
  fields: {
    id: sequence(),
    uid: fake((f) => f.random.uuid()),
    expires: fake((f) => f.date.future(1).toISOString()),
    worker: perBuild(() => {
      return workerBuilder();
    }),
  },
});

const missingTrainingBuilder = build('Training', {
  fields: {
    id: sequence(),
    missing: true,
    worker: perBuild(() => {
      return workerBuilder();
    }),
  },
});

const trainingCategoryBuilder = build('TrainingCategory', {
  fields: {
    id: sequence(),
    seq: sequence(),
    category: fake((f) => f.lorem.sentence()),
    training: perBuild(() => {
      return [trainingBuilder()];
    }),
  },
});

describe('TrainingAndQualificationsCategoriesComponent', () => {
  let component: RenderResult<TrainingAndQualificationsCategoriesComponent>;

  it('should create', async () => {
    const mockPermissionsService = sinon.createStubInstance(PermissionsService, {
      can: sinon.stub().returns(true),
    });

    component = await render(TrainingAndQualificationsCategoriesComponent, {
      imports: [RouterTestingModule, HttpClientTestingModule],
      providers: [{ provide: PermissionsService, useValue: mockPermissionsService }],
      componentProperties: {
        workplace: establishmentBuilder() as Establishment,
        trainingCategories: [],
      },
    });

    expect(component).toBeTruthy();
  });

  it('should show Worker information when clicking the More link', async () => {
    const mockPermissionsService = sinon.createStubInstance(PermissionsService, {
      can: sinon.stub().returns(true),
    });

    const trainingCategory = trainingCategoryBuilder();

    const { click, getByTestId } = await render(TrainingAndQualificationsCategoriesComponent, {
      imports: [RouterTestingModule, HttpClientTestingModule],
      providers: [{ provide: PermissionsService, useValue: mockPermissionsService }],
      componentProperties: {
        workplace: establishmentBuilder() as Establishment,
        trainingCategories: [trainingCategory],
      },
    });

    const container = within(getByTestId('training-category-table'));

    click(container.getAllByTestId('more-link')[0]);
    expect(container.getAllByText(trainingCategory.training[0].worker.NameOrIdValue));
  });

  it('should show an Update link for expired and expiring soon workers when clicking the More link', async () => {
    const mockPermissionsService = sinon.createStubInstance(PermissionsService, {
      can: sinon.stub().returns(true),
    });

    const trainingCategory = trainingCategoryBuilder({
      overrides: {
        training: [
          trainingBuilder({
            overrides: {
              expires: moment().subtract(1, 'month').toISOString(),
            },
          }),
        ],
      },
    });

    const { click, getByTestId } = await render(TrainingAndQualificationsCategoriesComponent, {
      imports: [RouterTestingModule, HttpClientTestingModule],
      providers: [
        {provide: PermissionsService, useValue: mockPermissionsService}
      ],
      componentProperties: {
        workplace: establishmentBuilder() as Establishment,
        trainingCategories: [trainingCategory],
      },
    });

    const container = within(getByTestId('training-category-table'));

    click(container.getAllByTestId('more-link')[0]);
    expect(container.getAllByText('Update'));
  });

  it('should list the Categories by Status', async () => {
    const mockPermissionsService = sinon.createStubInstance(PermissionsService, {
      can: sinon.stub().returns(true),
    });

    const workplace = establishmentBuilder() as Establishment;

    const trainingCategories = [
      trainingCategoryBuilder({
        overrides: {
          training: [
            trainingBuilder({
              overrides: {
                expires: moment().subtract(1, 'month').toISOString(),
              },
            }),
          ],
        },
      }),
      trainingCategoryBuilder({
        overrides: {
          training: [
            trainingBuilder({
              overrides: {
                expires: moment().add(1, 'month').toISOString(),
              },
            }),
          ],
        },
      }),
      trainingCategoryBuilder({
        overrides: {
          training: [
            trainingBuilder({
              overrides: {
                expires: moment().add(1, 'year').toISOString(),
              },
            }),
          ],
        },
      }),
      trainingCategoryBuilder({
        overrides: {
          training: [missingTrainingBuilder()],
        },
      }),
    ];

    const { fixture } = await render(TrainingAndQualificationsCategoriesComponent, {
      imports: [RouterTestingModule, HttpClientTestingModule],
      providers: [
        { provide: PermissionsService, useValue: mockPermissionsService },
      ],
      componentProperties: {
        workplace,
        trainingCategories,
      },
    });

    fixture.detectChanges();

    const rows = fixture.nativeElement.querySelectorAll(`table[data-testid='training-category-table'] tbody tr`);

    expect(rows.length).toBe(4);
    expect(rows[0].innerHTML).toContain('1 Expired');
    expect(rows[1].innerHTML).toContain('1 Missing');
    expect(rows[2].innerHTML).toContain('1 Expiring soon');
    expect(rows[3].innerHTML).toContain('Up-to-date');
  });
});
