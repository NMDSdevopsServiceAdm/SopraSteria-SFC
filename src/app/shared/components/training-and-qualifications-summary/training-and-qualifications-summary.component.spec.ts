import { HttpClientTestingModule } from '@angular/common/http/testing';
import { By } from '@angular/platform-browser';
import { RouterTestingModule } from '@angular/router/testing';
import { Establishment } from '@core/model/establishment.model';
import { PermissionsService } from '@core/services/permissions/permissions.service';
import { MockFeatureFlagsService } from '@core/test-utils/MockFeatureFlagService';
import {
  longTermAbsentWorker,
  workerWithExpiredTraining,
  workerWithExpiringTraining,
  workerWithMissingTraining,
  workerWithUpToDateTraining,
} from '@core/test-utils/MockWorkerService';
import { FeatureFlagsService } from '@shared/services/feature-flags.service';
import { render } from '@testing-library/angular';

import { TrainingAndQualificationsSummaryComponent } from './training-and-qualifications-summary.component';

const sinon = require('sinon');
const { build, fake, sequence, perBuild } = require('@jackfranklin/test-data-bot');

const establishmentBuilder = build('Establishment', {
  fields: {
    id: sequence(),
    uid: fake((f) => f.random.uuid()),
    name: fake((f) => f.lorem.sentence()),
  },
});

const workers = [
  workerWithExpiredTraining,
  workerWithExpiringTraining,
  workerWithUpToDateTraining,
  workerWithMissingTraining,
  longTermAbsentWorker,
];

describe('TrainingAndQualificationsSummaryComponent', () => {
  const mockPermissionsService = sinon.createStubInstance(PermissionsService, {
    can: sinon.stub().returns(true),
  });

  async function setup() {
    const { fixture, getAllByText } = await render(TrainingAndQualificationsSummaryComponent, {
      imports: [HttpClientTestingModule, RouterTestingModule],
      providers: [
        { provide: PermissionsService, useValue: mockPermissionsService },
        { provide: FeatureFlagsService, useClass: MockFeatureFlagsService },
      ],
      componentProperties: {
        workplace: establishmentBuilder() as Establishment,
        workers,
      },
    });

    const component = fixture.componentInstance;

    return {
      component,
      fixture,
      getAllByText,
    };
  }

  it('should create', async () => {
    const { component } = await setup();
    expect(component).toBeTruthy();
  });

  it('should list by Expired as default', async () => {
    const { fixture } = await setup();

    const rows = fixture.nativeElement.querySelectorAll(`table[data-testid='training-worker-table'] tbody tr`);

    expect(rows.length).toBe(5);
    expect(rows[0].innerHTML).toContain('3 Expired');
    expect(rows[1].innerHTML).toContain('Alice');
    expect(rows[2].innerHTML).toContain('Carl');
    expect(rows[3].innerHTML).toContain('Darlyn');
    expect(rows[4].innerHTML).toContain('John');
  });

  it('should list by Expired as default', async () => {
    const { fixture } = await setup();

    const select: HTMLSelectElement = fixture.debugElement.query(By.css('#sortByTrainingStaff')).nativeElement;
    select.value = select.options[1].value; // Expiring Soon
    select.dispatchEvent(new Event('change'));
    fixture.detectChanges();
    let rows = fixture.nativeElement.querySelectorAll(`table[data-testid='training-worker-table'] tbody tr`);

    expect(rows.length).toBe(5);
    expect(rows[0].innerHTML).toContain('Alice');
    expect(rows[1].innerHTML).toContain('Carl');
    expect(rows[2].innerHTML).toContain('Ben');
    expect(rows[3].innerHTML).toContain('Darlyn');
    expect(rows[4].innerHTML).toContain('John');

    select.value = select.options[2].value; // Missing
    select.dispatchEvent(new Event('change'));
    fixture.detectChanges();
    rows = fixture.nativeElement.querySelectorAll(`table[data-testid='training-worker-table'] tbody tr`);
    expect(rows[0].innerHTML).toContain('Darlyn');
    expect(rows[1].innerHTML).toContain('Alice');
    expect(rows[2].innerHTML).toContain('Ben');
    expect(rows[3].innerHTML).toContain('Carl');
    expect(rows[4].innerHTML).toContain('John');
  });

  it('should display the "Long-term absent" tag if the worker is long term absent', async () => {
    const { getAllByText } = await setup();

    expect(getAllByText('Long-term absent').length).toBe(1);
  });
});
