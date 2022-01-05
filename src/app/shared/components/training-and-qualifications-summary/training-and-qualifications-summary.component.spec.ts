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
  workerWithOneExpiringTraining,
  workerWithUpToDateTraining,
} from '@core/test-utils/MockWorkerService';
import { FeatureFlagsService } from '@shared/services/feature-flags.service';
import { render } from '@testing-library/angular';

import { TrainingAndQualificationsSummaryComponent } from './training-and-qualifications-summary.component';

const sinon = require('sinon');
const { build, fake, sequence } = require('@jackfranklin/test-data-bot');

const establishmentBuilder = build('Establishment', {
  fields: {
    id: sequence(),
    uid: fake((f) => f.random.uuid()),
    name: fake((f) => f.lorem.sentence()),
  },
});

const workers = [
  workerWithExpiringTraining, // Alice
  workerWithExpiredTraining, // Ben
  workerWithOneExpiringTraining, // Carl
  workerWithMissingTraining, // Darlyn
  workerWithUpToDateTraining, // Ellie
  longTermAbsentWorker, // John
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

  it('should list by expired as default', async () => {
    const { fixture } = await setup();

    const rows = fixture.nativeElement.querySelectorAll(`table[data-testid='training-worker-table'] tbody tr`);

    expect(rows.length).toBe(6);
    expect(rows[0].innerHTML).toContain('3 expired');
    expect(rows[0].innerHTML).toContain('Ben');
    expect(rows[1].innerHTML).toContain('Alice');
    expect(rows[2].innerHTML).toContain('Carl');
    expect(rows[3].innerHTML).toContain('Darlyn');
    expect(rows[4].innerHTML).toContain('Ellie');
    expect(rows[5].innerHTML).toContain('John');
  });

  it('should sort by expiring soon', async () => {
    const { fixture } = await setup();

    const select: HTMLSelectElement = fixture.debugElement.query(By.css('#sortByTrainingStaff')).nativeElement;
    select.value = select.options[1].value; // Expiring Soon
    select.dispatchEvent(new Event('change'));
    fixture.detectChanges();
    const rows = fixture.nativeElement.querySelectorAll(`table[data-testid='training-worker-table'] tbody tr`);

    expect(rows.length).toBe(6);
    expect(rows[0].innerHTML).toContain('2 expire soon');
    expect(rows[0].innerHTML).toContain('Alice');
    expect(rows[1].innerHTML).toContain('1 expires soon');
    expect(rows[1].innerHTML).toContain('Carl');
    expect(rows[2].innerHTML).toContain('Ben');
    expect(rows[3].innerHTML).toContain('Darlyn');
    expect(rows[4].innerHTML).toContain('Ellie');
    expect(rows[5].innerHTML).toContain('John');
  });

  it('should sort by missing', async () => {
    const { fixture } = await setup();

    const select: HTMLSelectElement = fixture.debugElement.query(By.css('#sortByTrainingStaff')).nativeElement;
    select.value = select.options[2].value; // Missing
    select.dispatchEvent(new Event('change'));
    fixture.detectChanges();

    const rows = fixture.nativeElement.querySelectorAll(`table[data-testid='training-worker-table'] tbody tr`);

    expect(rows.length).toBe(6);
    expect(rows[0].innerHTML).toContain('2 missing');
    expect(rows[0].innerHTML).toContain('Darlyn');
    expect(rows[1].innerHTML).toContain('Alice');
    expect(rows[2].innerHTML).toContain('Ben');
    expect(rows[3].innerHTML).toContain('Carl');
    expect(rows[4].innerHTML).toContain('Ellie');
    expect(rows[5].innerHTML).toContain('John');
  });

  it('should display the "OK" message if training is up to date', async () => {
    const { fixture } = await setup();

    const rows = fixture.nativeElement.querySelectorAll(`table[data-testid='training-worker-table'] tbody tr`);

    expect(rows[4].innerHTML).toContain('Ellie');
    expect(rows[4].innerHTML).toContain('OK');
  });

  it('should display the "Long-term absent" tag if the worker is long term absent', async () => {
    const { getAllByText } = await setup();

    expect(getAllByText('Long-term absent').length).toBe(1);
  });
});
