import { HttpClientTestingModule } from '@angular/common/http/testing';
import { By } from '@angular/platform-browser';
import { RouterTestingModule } from '@angular/router/testing';
import { Establishment } from '@core/model/establishment.model';
import { PermissionsService } from '@core/services/permissions/permissions.service';
import { MockFeatureFlagsService } from '@core/test-utils/MockFeatureFlagService';
import { FeatureFlagsService } from '@shared/services/feature-flags.service';
import { fireEvent, render, RenderResult, within } from '@testing-library/angular';
import dayjs from 'dayjs';

import { TrainingAndQualificationsCategoriesComponent } from './training-and-qualifications-categories.component';

const sinon = require('sinon');
const { build, fake, sequence, perBuild } = require('@jackfranklin/test-data-bot');

const establishmentBuilder = build('Establishment', {
  fields: {
    id: sequence(),
    uid: fake((f) => f.datatype.uuid()),
    name: fake((f) => f.lorem.sentence()),
  },
});

const workerBuilder = build('Worker', {
  fields: {
    id: sequence(),
    uid: fake((f) => f.datatype.uuid()),
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
    uid: fake((f) => f.datatype.uuid()),
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

fdescribe('TrainingAndQualificationsCategoriesComponent', () => {
  let component: RenderResult<TrainingAndQualificationsCategoriesComponent>;
  const mockPermissionsService = sinon.createStubInstance(PermissionsService, {
    can: sinon.stub().returns(true),
  });

  async function setup(trainingCategory = [], workplace = null) {
    const { getByTestId, fixture } = await render(TrainingAndQualificationsCategoriesComponent, {
      imports: [RouterTestingModule, HttpClientTestingModule],
      providers: [
        { provide: PermissionsService, useValue: mockPermissionsService },
        { provide: FeatureFlagsService, useClass: MockFeatureFlagsService },
      ],
      componentProperties: {
        workplace: establishmentBuilder() as Establishment,
        trainingCategories: trainingCategory,
      },
    });
    const component = fixture.componentInstance;
    return {
      component,
      getByTestId,
      fixture,
    };
  }
  it('should create', async () => {
    const { component } = await setup();
    expect(component).toBeTruthy();
  });

  it('should show Worker information when clicking the More link', async () => {
    const trainingCategory = trainingCategoryBuilder();

    const { getByTestId } = await setup([trainingCategory]);
    const container = within(getByTestId('training-category-table'));

    fireEvent.click(container.getAllByTestId('more-link')[0]);
    expect(container.getAllByText(trainingCategory.training[0].worker.NameOrIdValue));
  });

  it('should show an Update link for expired and expiring soon workers when clicking the More link', async () => {
    const trainingCategory = trainingCategoryBuilder({
      overrides: {
        training: [
          trainingBuilder({
            overrides: {
              expires: dayjs().subtract(1, 'month').toISOString(),
            },
          }),
        ],
      },
    });
    const { getByTestId } = await setup([trainingCategory]);

    const container = within(getByTestId('training-category-table'));

    fireEvent.click(container.getAllByTestId('more-link')[0]);
    expect(container.getAllByText('Update'));
  });

  it('should not display an Update link if you do not have permissions to edit workers', async () => {
    sinon.restore();
    const mockPermissionsService = sinon.createStubInstance(PermissionsService, {
      can: sinon.stub().returns(false),
    });

    const trainingCategory = trainingCategoryBuilder({
      overrides: {
        training: [
          trainingBuilder({
            overrides: {
              expires: dayjs().subtract(1, 'month').toISOString(),
            },
          }),
        ],
      },
    });

    const { getByTestId } = await render(TrainingAndQualificationsCategoriesComponent, {
      imports: [RouterTestingModule, HttpClientTestingModule],
      providers: [
        { provide: PermissionsService, useValue: mockPermissionsService },
        { provide: FeatureFlagsService, useClass: MockFeatureFlagsService },
      ],
      componentProperties: {
        workplace: establishmentBuilder() as Establishment,
        trainingCategories: [trainingCategory],
      },
    });

    const container = within(getByTestId('training-category-table'));

    fireEvent.click(container.getAllByTestId('more-link')[0]);
    expect(container.queryAllByText('Update').length).toBe(0);
  });

  it('should list by Expired as default', async () => {
    const workplace = establishmentBuilder() as Establishment;

    const trainingCategories = [
      trainingCategoryBuilder({
        // expired
        overrides: {
          category: 'B Category Name',
          training: [
            trainingBuilder({
              overrides: {
                expires: dayjs().subtract(1, 'month').toISOString(),
              },
            }),
          ],
        },
      }),
      trainingCategoryBuilder({
        // expiring
        overrides: {
          category: 'A Category Name',
          training: [
            trainingBuilder({
              overrides: {
                expires: dayjs().add(1, 'month').toISOString(),
              },
            }),
          ],
        },
      }),
      trainingCategoryBuilder({
        // up to date
        overrides: {
          category: 'C Category Name',
          training: [
            trainingBuilder({
              overrides: {
                expires: dayjs().add(1, 'year').toISOString(),
              },
            }),
          ],
        },
      }),
      trainingCategoryBuilder({
        // Missing
        overrides: {
          category: 'D Category Name',
          training: [missingTrainingBuilder()],
        },
      }),
    ];

    const { fixture } = await setup(trainingCategories, workplace);
    fixture.detectChanges();

    const rows = fixture.nativeElement.querySelectorAll(`table[data-testid='training-category-table'] tbody tr`);

    expect(rows.length).toBe(4);
    expect(rows[0].innerHTML).toContain('1 expired');
    expect(rows[1].innerHTML).toContain('A Category Name');
    expect(rows[2].innerHTML).toContain('C Category Name');
    expect(rows[3].innerHTML).toContain('D Category Name');
  });
  it('should change list depending on sort', async () => {
    const workplace = establishmentBuilder() as Establishment;

    const trainingCategories = [
      trainingCategoryBuilder({
        // expired
        overrides: {
          category: 'B Category Name',
          training: [
            trainingBuilder({
              overrides: {
                expires: dayjs().subtract(1, 'month').toISOString(),
              },
            }),
          ],
        },
      }),
      trainingCategoryBuilder({
        // expiring
        overrides: {
          category: 'A Category Name',
          training: [
            trainingBuilder({
              overrides: {
                expires: dayjs().add(1, 'month').toISOString(),
              },
            }),
          ],
        },
      }),
      trainingCategoryBuilder({
        // up to date
        overrides: {
          category: 'C Category Name',
          training: [
            trainingBuilder({
              overrides: {
                expires: dayjs().add(1, 'year').toISOString(),
              },
            }),
          ],
        },
      }),
      trainingCategoryBuilder({
        // Missing
        overrides: {
          category: 'D Category Name',
          training: [missingTrainingBuilder()],
        },
      }),
    ];

    const { fixture } = await setup(trainingCategories, workplace);

    fixture.detectChanges();
    const select: HTMLSelectElement = fixture.debugElement.query(By.css('#sortByTrainingCategory')).nativeElement;
    select.value = select.options[1].value; // Expiring Soon
    select.dispatchEvent(new Event('change'));
    fixture.detectChanges();
    let rows = fixture.nativeElement.querySelectorAll(`table[data-testid='training-category-table'] tbody tr`);

    expect(rows.length).toBe(4);
    expect(rows[0].innerHTML).toContain('A Category Name');
    expect(rows[1].innerHTML).toContain('B Category Name');
    expect(rows[2].innerHTML).toContain('C Category Name');
    expect(rows[3].innerHTML).toContain('D Category Name');

    select.value = select.options[2].value; //Missing
    select.dispatchEvent(new Event('change'));
    fixture.detectChanges();
    rows = fixture.nativeElement.querySelectorAll(`table[data-testid='training-category-table'] tbody tr`);
    expect(rows[0].innerHTML).toContain('D Category Name');
    expect(rows[1].innerHTML).toContain('A Category Name');
    expect(rows[2].innerHTML).toContain('B Category Name');
    expect(rows[3].innerHTML).toContain('C Category Name');
  });
});
