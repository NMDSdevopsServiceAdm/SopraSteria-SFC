import { PdfTrainingAndQualificationTitleComponent } from './pdf-training-and-qualification-title.component';
import { render } from '@testing-library/angular';
import { SharedModule } from '@shared/shared.module';
import { workerBuilder } from '@core/test-utils/MockWorkerService';
import { establishmentBuilder } from '@core/test-utils/MockEstablishmentService';
import { Establishment } from '@core/model/establishment.model';
import { Worker } from '@core/model/worker.model';

describe('PdfWorkerTitleComponent', () => {
  const setup = async (overrides: any = {}) => {
    const setupTools = await render(PdfTrainingAndQualificationTitleComponent, {
      imports: [SharedModule],
      providers: [],
      componentProperties: {
        worker: overrides?.worker,
        workplace: overrides?.workplace,
        lastUpdatedDate: overrides?.lastUpdatedDate,
      },
    });

    const component = setupTools.fixture.componentInstance;

    return {
      component,
      ...setupTools,
    };
  };

  const mockWorker = workerBuilder() as Worker;
  const mockWorkplace = establishmentBuilder() as Establishment;

  it('should create', async () => {
    const { component } = await setup();
    expect(component).toBeTruthy();
  });

  it('should show workplace name and staff name', async () => {
    const { getByText } = await setup({ worker: mockWorker, workplace: mockWorkplace });

    expect(getByText('Workplace name')).toBeTruthy;
    expect(getByText(mockWorkplace.name)).toBeTruthy;

    expect(getByText('Staff name')).toBeTruthy;
    expect(getByText(mockWorker.nameOrId)).toBeTruthy;
  });

  it('should show whether the worker has completed Care certificate', async () => {
    const worker = { ...mockWorker, careCertificate: 'Yes, completed' };
    const { getByText } = await setup({ worker, workplace: mockWorkplace });

    expect(getByText('Care certificate')).toBeTruthy;
    expect(getByText('Yes, completed')).toBeTruthy;
  });

  it('should show whether Care certificate as "Not answered" if got no value for that worker', async () => {
    const worker = { ...mockWorker, careCertificate: null };
    const { getByText } = await setup({ worker, workplace: mockWorkplace });

    expect(getByText('Care certificate')).toBeTruthy;
    expect(getByText('Not answered')).toBeTruthy;
  });

  it('should show the latest updated date of the worker', async () => {
    const { getByText } = await setup({ lastUpdatedDate: '2025-07-15T14:10:14.287Z' });
    expect(getByText('Last updated')).toBeTruthy;
    expect(getByText('15 July 2025')).toBeTruthy;
  });
});
