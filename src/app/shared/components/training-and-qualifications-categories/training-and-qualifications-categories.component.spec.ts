import { HttpClientTestingModule } from '@angular/common/http/testing';
import { By } from '@angular/platform-browser';
import { RouterTestingModule } from '@angular/router/testing';
import { Establishment } from '@core/model/establishment.model';
import { MockFeatureFlagsService } from '@core/test-utils/MockFeatureFlagService';
import { FeatureFlagsService } from '@shared/services/feature-flags.service';
import { fireEvent, render, within } from '@testing-library/angular';
import dayjs from 'dayjs';

import { TrainingAndQualificationsCategoriesComponent } from './training-and-qualifications-categories.component';

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
    isMandatory: false,
    training: perBuild(() => {
      return [trainingBuilder()];
    }),
  },
});

const trainingCategories = [
  trainingCategoryBuilder({
    // expired
    overrides: {
      category: 'B Category Name',
      isMandatory: true,
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
      isMandatory: true,
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

describe('TrainingAndQualificationsCategoriesComponent', () => {
  async function setup() {
    const { getByTestId, getByLabelText, fixture } = await render(TrainingAndQualificationsCategoriesComponent, {
      imports: [RouterTestingModule, HttpClientTestingModule],
      providers: [
        {
          provide: FeatureFlagsService,
          useClass: MockFeatureFlagsService,
        },
      ],
      componentProperties: {
        workplace: establishmentBuilder() as Establishment,
        trainingCategories: trainingCategories,
      },
    });
    const component = fixture.componentInstance;
    return {
      component,
      getByTestId,
      getByLabelText,
      fixture,
    };
  }
  it('should create', async () => {
    const { component } = await setup();
    expect(component).toBeTruthy();
  });

  it('should list by Expired as default', async () => {
    const { fixture } = await setup();

    const rows = fixture.nativeElement.querySelectorAll(`table[data-testid='training-category-table'] tbody tr`);

    expect(rows.length).toBe(4);
    expect(rows[0].innerHTML).toContain('1 expired');
    expect(rows[1].innerHTML).toContain('A Category Name');
    expect(rows[2].innerHTML).toContain('C Category Name');
    expect(rows[3].innerHTML).toContain('D Category Name');
  });

  it('should change list depending on sort', async () => {
    const { fixture } = await setup();

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

  it('should show just the mandatory training categories when the checkbox is selected', async () => {
    const { fixture, getByLabelText } = await setup();

    const checkbox = getByLabelText('Only show mandatory training');
    fireEvent.click(checkbox);
    fixture.detectChanges();

    const rows = fixture.nativeElement.querySelectorAll(`table[data-testid='training-category-table'] tbody tr`);

    expect(rows.length).toEqual(2);
    expect(rows[0].innerHTML).toContain('B Category Name');
    expect(rows[1].innerHTML).toContain('C Category Name');
  });

  it('should render a view link for each training category with correct href', async () => {
    const { component, fixture } = await setup();

    const workplaceUid = component.workplace.uid;
    const rows = fixture.nativeElement.querySelectorAll(`table[data-testid='training-category-table'] tbody tr`);

    rows.forEach((row, index) => {
      const viewLink = within(row).getByText('View');
      expect(viewLink.getAttribute('href')).toEqual(
        `/workplace/${workplaceUid}/training-and-qualifications-record/view-training-category/${trainingCategories[index].id}`,
      );
    });
  });
});
