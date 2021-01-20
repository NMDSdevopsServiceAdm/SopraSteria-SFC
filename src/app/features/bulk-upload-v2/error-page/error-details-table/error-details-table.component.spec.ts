import { ErrorReportError } from '@core/model/bulk-upload.model';
import { render } from '@testing-library/angular';

import { ErrorDetailsTableComponent } from './error-details-table.component';

const { build, fake } = require('@jackfranklin/test-data-bot');

const itemBuilder = build('Item', {
  fields: {
    lineNumber: fake((f) => f.random.number({ min: 2, max: 10 })),
    source: '',
    name: 'SKILLS FOR CARE',
  },
});

const errorReportErrorBuilder = build('ErrorReportError', {
  fields: {
    error: fake((f) => f.lorem.sentence()),
    errCode: fake((f) => f.random.number({ min: 1000, max: 9999 })),
    items: [],
  },
});

describe('ErrorDetailsTableComponent', () => {
  it('should create', async () => {
    const component = await render(ErrorDetailsTableComponent);
    expect(component).toBeTruthy();
  });

  it('should show a list of errors for Workplaces', async () => {
    const errors = [errorReportErrorBuilder()] as ErrorReportError[];

    errors[0].items = [itemBuilder()];

    const fileType = 'Workplace';

    const { getByText } = await render(ErrorDetailsTableComponent, {
      componentProperties: {
        errors,
        fileType,
      },
    });

    expect(getByText(errors[0].error, { exact: false }));
  });
});
