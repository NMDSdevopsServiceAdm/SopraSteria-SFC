import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { Establishment } from '@core/model/establishment.model';
import { PermissionsService } from '@core/services/permissions/permissions.service';
import { render, RenderResult, within } from '@testing-library/angular';
import * as moment from 'moment';

import { TrainingAndQualificationsCategoriesComponent } from './training-and-qualifications-categories.component';
import { By } from '@angular/platform-browser';

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

  it('should not display an Update link if you do not have permissions to edit workers', async () => {
    const mockPermissionsService = sinon.createStubInstance(PermissionsService, {
      can: sinon.stub().returns(false),
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
    expect(container.queryAllByText('Update').length).toBe(0);
  });


  it('should list by Expired as default', async () => {
    const mockPermissionsService = sinon.createStubInstance(PermissionsService, {
      can: sinon.stub().returns(true),
    });

    const workplace = establishmentBuilder() as Establishment;

    const trainingCategories = [
      trainingCategoryBuilder({ // expired
        overrides: {
          category: 'B Category Name',
          training: [
            trainingBuilder({
              overrides: {
                expires: moment().subtract(1, 'month').toISOString(),
              },
            }),
          ],
        },
      }),
      trainingCategoryBuilder({ // expiring
        overrides: {
          category: 'A Category Name',
          training: [
            trainingBuilder({
              overrides: {
                expires: moment().add(1, 'month').toISOString(),
              },
            }),
          ],
        },
      }),
      trainingCategoryBuilder({  // up to date
        overrides: {
          category: 'C Category Name',
          training: [
            trainingBuilder({
              overrides: {
                expires: moment().add(1, 'year').toISOString(),
              },
            }),
          ],
        },
      }),
      trainingCategoryBuilder({  // Missing
        overrides: {
          category: 'D Category Name',
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
    expect(rows[1].innerHTML).toContain('A Category Name');
    expect(rows[2].innerHTML).toContain('C Category Name');
    expect(rows[3].innerHTML).toContain('D Category Name');
  });
  it('should change list depending on sort', async () => {
    const mockPermissionsService = sinon.createStubInstance(PermissionsService, {
      can: sinon.stub().returns(true),
    });

    const workplace = establishmentBuilder() as Establishment;

    const trainingCategories = [
      trainingCategoryBuilder({ // expired
        overrides: {
          category: 'B Category Name',
          training: [
            trainingBuilder({
              overrides: {
                expires: moment().subtract(1, 'month').toISOString(),
              },
            }),
          ],
        },
      }),
      trainingCategoryBuilder({ // expiring
        overrides: {
          category: 'A Category Name',
          training: [
            trainingBuilder({
              overrides: {
                expires: moment().add(1, 'month').toISOString(),
              },
            }),
          ],
        },
      }),
      trainingCategoryBuilder({  // up to date
        overrides: {
          category: 'C Category Name',
          training: [
            trainingBuilder({
              overrides: {
                expires: moment().add(1, 'year').toISOString(),
              },
            }),
          ],
        },
      }),
      trainingCategoryBuilder({  // Missing
        overrides: {
          category: 'D Category Name',
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
    const select: HTMLSelectElement = fixture.debugElement.query(By.css('#sortBy')).nativeElement;
    select.value = select.options[1].value;  // Expiring Soon
    select.dispatchEvent(new Event('change'));
    fixture.detectChanges();
    let rows = fixture.nativeElement.querySelectorAll(`table[data-testid='training-category-table'] tbody tr`);

    expect(rows.length).toBe(4);
    expect(rows[0].innerHTML).toContain('A Category Name');
    expect(rows[1].innerHTML).toContain('B Category Name');
    expect(rows[2].innerHTML).toContain('C Category Name');
    expect(rows[3].innerHTML).toContain('D Category Name');

    select.value = select.options[2].value;  //Missing
    select.dispatchEvent(new Event('change'));
    fixture.detectChanges();
    rows = fixture.nativeElement.querySelectorAll(`table[data-testid='training-category-table'] tbody tr`);
    expect(rows[0].innerHTML).toContain('D Category Name');
    expect(rows[1].innerHTML).toContain('A Category Name');
    expect(rows[2].innerHTML).toContain('B Category Name');
    expect(rows[3].innerHTML).toContain('C Category Name');
  });
});
