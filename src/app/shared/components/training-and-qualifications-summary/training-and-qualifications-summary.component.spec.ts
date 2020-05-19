import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { Establishment } from '@core/model/establishment.model';
import { PermissionsService } from '@core/services/permissions/permissions.service';
import { render, RenderResult } from '@testing-library/angular';

import { TrainingAndQualificationsSummaryComponent } from './training-and-qualifications-summary.component';
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
    nameOrId: fake((f) => f.name.findName()),
    mainJob: perBuild(() => {
      return {
        id: sequence(),
        title: fake((f) => f.lorem.sentence()),
      };
    }),
    expiredTrainingCount: 0,
    expiringTrainingCount: 0,
    missingMandatoryTrainingCount: 0,
    qualificationCount: 0,
    trainingAlert: 0,
    trainingCount: 0,
  },
});


describe('TrainingAndQualificationsSummaryComponent', () => {
  let component: RenderResult<TrainingAndQualificationsSummaryComponent>;

  it('should create', async () => {
    const mockPermissionsService = sinon.createStubInstance(PermissionsService, {
      can: sinon.stub().returns(true),
    });

    component = await render(TrainingAndQualificationsSummaryComponent, {
      imports: [ HttpClientTestingModule, RouterTestingModule],
      providers: [{ provide: PermissionsService, useValue: mockPermissionsService }],
      componentProperties: {
        workplace: establishmentBuilder() as Establishment,
      },
    });

    expect(component).toBeTruthy();
  });


  it('should list by Expired as default', async () => {
    const mockPermissionsService = sinon.createStubInstance(PermissionsService, {
      can: sinon.stub().returns(true),
    });


    const workers = [
      workerBuilder({ // expired
        overrides: {
          nameOrId: 'Ben',
          expiredTrainingCount: 3,
          expiringTrainingCount: 0,
          missingMandatoryTrainingCount: 0,
          qualificationCount: 0,
          trainingAlert: 0,
          trainingCount: 0,
        },
      }),
      workerBuilder({ // expiring
        overrides: {
          nameOrId: 'Alice',
          expiredTrainingCount: 0,
          expiringTrainingCount: 1,
          missingMandatoryTrainingCount: 0,
          qualificationCount: 0,
          trainingAlert: 0,
          trainingCount: 1,
        },
      }),
      workerBuilder({  // up to date
        overrides: {
          nameOrId: 'Carl',
          expiredTrainingCount: 0,
          expiringTrainingCount: 0,
          missingMandatoryTrainingCount: 0,
          qualificationCount: 0,
          trainingAlert: 0,
          trainingCount: 2,
        },
      }),
      workerBuilder({  // Missing
        overrides: {
          nameOrId: 'Darlyn',
          expiredTrainingCount: 0,
          expiringTrainingCount: 0,
          missingMandatoryTrainingCount: 2,
          qualificationCount: 0,
          trainingAlert: 2,
          trainingCount: 0,
        },
      }),
    ];

    const { fixture } = await render(TrainingAndQualificationsSummaryComponent, {
      imports: [ HttpClientTestingModule, RouterTestingModule],
      providers: [{ provide: PermissionsService, useValue: mockPermissionsService }],
      componentProperties: {
        workplace: establishmentBuilder() as Establishment,
        workers
      },
    });
    fixture.detectChanges();

    const rows = fixture.nativeElement.querySelectorAll(`table[data-testid='training-worker-table'] tbody tr`);

    expect(rows.length).toBe(4);
    expect(rows[0].innerHTML).toContain('3 Expired');
    expect(rows[1].innerHTML).toContain('Alice');
    expect(rows[2].innerHTML).toContain('Carl');
    expect(rows[3].innerHTML).toContain('Darlyn');
  });
  it('should list by Expired as default', async () => {
    const mockPermissionsService = sinon.createStubInstance(PermissionsService, {
      can: sinon.stub().returns(true),
    });


    const workers = [
      workerBuilder({ // expired
        overrides: {
          nameOrId: 'Ben',
          expiredTrainingCount: 3,
          expiringTrainingCount: 0,
          missingMandatoryTrainingCount: 0,
          qualificationCount: 0,
          trainingAlert: 0,
          trainingCount: 0,
        },
      }),
      workerBuilder({ // expiring
        overrides: {
          nameOrId: 'Alice',
          expiredTrainingCount: 0,
          expiringTrainingCount: 2,
          missingMandatoryTrainingCount: 0,
          qualificationCount: 0,
          trainingAlert: 0,
          trainingCount: 1,
        },
      }),
      workerBuilder({  // up to date
        overrides: {
          nameOrId: 'Carl',
          expiredTrainingCount: 0,
          expiringTrainingCount: 1,
          missingMandatoryTrainingCount: 0,
          qualificationCount: 0,
          trainingAlert: 1,
          trainingCount: 3,
        },
      }),
      workerBuilder({  // Missing
        overrides: {
          nameOrId: 'Darlyn',
          expiredTrainingCount: 0,
          expiringTrainingCount: 0,
          missingMandatoryTrainingCount: 2,
          qualificationCount: 0,
          trainingAlert: 2,
          trainingCount: 0,
        },
      }),
    ];

    const { fixture } = await render(TrainingAndQualificationsSummaryComponent, {
      imports: [HttpClientTestingModule, RouterTestingModule],
      providers: [{ provide: PermissionsService, useValue: mockPermissionsService }],
      componentProperties: {
        workplace: establishmentBuilder() as Establishment,
        workers
      },
    });
    fixture.detectChanges();

    const select: HTMLSelectElement = fixture.debugElement.query(By.css('#sortBy')).nativeElement;
    select.value = select.options[1].value;  // Expiring Soon
    select.dispatchEvent(new Event('change'));
    fixture.detectChanges();
    let rows = fixture.nativeElement.querySelectorAll(`table[data-testid='training-worker-table'] tbody tr`);

    expect(rows.length).toBe(4);
    expect(rows[0].innerHTML).toContain('Alice');
    expect(rows[1].innerHTML).toContain('Carl');
    expect(rows[2].innerHTML).toContain('Ben');
    expect(rows[3].innerHTML).toContain('Darlyn');

    select.value = select.options[2].value;  // Missing
    select.dispatchEvent(new Event('change'));
    fixture.detectChanges();
    rows = fixture.nativeElement.querySelectorAll(`table[data-testid='training-worker-table'] tbody tr`);
    expect(rows[0].innerHTML).toContain('Darlyn');
    expect(rows[1].innerHTML).toContain('Alice');
    expect(rows[2].innerHTML).toContain('Ben');
    expect(rows[3].innerHTML).toContain('Carl');
  });
});
