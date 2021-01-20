import { ErrorReportError } from '@core/model/bulk-upload.model';
import { fireEvent, render, within } from '@testing-library/angular';

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

fdescribe('ErrorDetailsTableComponent', () => {
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

  it('should show a dropdown after clicking Open for Workplaces', async () => {
    const errors = [errorReportErrorBuilder()] as ErrorReportError[];

    errors[0].items = [itemBuilder()];

    const fileType = 'Workplace';

    const { getByText, queryByText, getByTestId } = await render(ErrorDetailsTableComponent, {
      componentProperties: {
        errors,
        fileType,
      },
    });

    const itemMessage = `for workplace called '${errors[0].items[0].name}' on line ${errors[0].items[0].lineNumber}`;
    expect(queryByText(itemMessage, { exact: false })).toBeNull();

    fireEvent.click(within(getByTestId('error-details-table')).getByText('Open'));

    expect(getByText(itemMessage, { exact: false }));
  });
});
