import { ErrorReportError, Items } from '@core/model/bulk-upload.model';
import { build, fake } from '@jackfranklin/test-data-bot';
import { fireEvent, render, within } from '@testing-library/angular';

import { ErrorDetailsTableComponent } from './error-details-table.component';

const itemBuilder = build('Item', {
  fields: {
    lineNumber: fake((f) => f.datatype.number({ min: 2, max: 10 })),
    source: '',
    name: fake((f) => f.name.findName()),
  },
});

const workerItemBuilder = build('WorkerItem', {
  fields: {
    lineNumber: fake((f) => f.datatype.number({ min: 2, max: 10 })),
    source: '',
    name: fake((f) => f.name.findName()),
    worker: fake((f) => f.lorem.sentence()),
  },
});

const errorReportErrorBuilder = build('ErrorReportError', {
  fields: {
    error: fake((f) => f.lorem.sentence()),
    errCode: fake((f) => f.datatype.number({ min: 1000, max: 9999 })),
    items: [],
  },
});

const makeWorkplaceItemMessage = (name: string, lineNumber: number) => {
  return `for workplace '${name}' on line ${lineNumber}`;
};

const makeTrainingOrStaffItemMessage = (worker: string, name: string, lineNumber: number) => {
  return `for staff record '${worker}' at workplace '${name}' on line ${lineNumber}`;
};

describe('ErrorDetailsTableComponent', () => {
  it('should create', async () => {
    const component = await render(ErrorDetailsTableComponent);
    expect(component).toBeTruthy();
  });

  describe('when fileType is Workplace', () => {
    it('should show a list of errors', async () => {
      const errors = [errorReportErrorBuilder()] as ErrorReportError[];

      errors[0].items = [itemBuilder() as Items];

      const fileType = 'Workplace';

      const { getByText } = await render(ErrorDetailsTableComponent, {
        componentProperties: {
          errors,
          fileType,
        },
      });

      expect(getByText(errors[0].error, { exact: false }));
    });

    it('should show a dropdown after clicking Open and toggle to say Close', async () => {
      const errors = [errorReportErrorBuilder()] as ErrorReportError[];

      errors[0].items = [itemBuilder() as Items];

      const fileType = 'Workplace';

      const { getByText, queryByText, getByTestId } = await render(ErrorDetailsTableComponent, {
        componentProperties: {
          errors,
          fileType,
        },
      });

      const itemMessage = makeWorkplaceItemMessage(errors[0].items[0].name, errors[0].items[0].lineNumber);
      expect(queryByText(itemMessage, { exact: false })).toBeNull();

      const openCloseToggle = within(getByTestId('error-details-table')).getByText('Open');

      fireEvent.click(openCloseToggle);

      expect(openCloseToggle.textContent).toBe('Close');
      expect(getByText(itemMessage, { exact: false }));
    });

    it('should hide the dropdown and toggle to say Open after clicking Close', async () => {
      const errors = [errorReportErrorBuilder()] as ErrorReportError[];

      errors[0].items = [itemBuilder() as Items];
      const openErrors = [errors[0].errCode];

      const fileType = 'Workplace';

      const { getByTestId, getByText, queryByText } = await render(ErrorDetailsTableComponent, {
        componentProperties: {
          errors,
          fileType,
          openErrors,
        },
      });

      const openCloseToggle = within(getByTestId('error-details-table')).getByText('Close');

      const itemMessage = makeWorkplaceItemMessage(errors[0].items[0].name, errors[0].items[0].lineNumber);
      expect(getByText(itemMessage, { exact: false }));

      fireEvent.click(openCloseToggle);

      expect(openCloseToggle.textContent).toBe('Open');
      expect(queryByText(itemMessage, { exact: false })).toBeNull();
    });

    it('should show both dropdowns after clicking Open on two errors', async () => {
      const errors = [errorReportErrorBuilder(), errorReportErrorBuilder()] as ErrorReportError[];

      errors[0].items = [itemBuilder() as Items];
      errors[1].items = [itemBuilder() as Items];

      const fileType = 'Workplace';

      const { getByText, queryByText, getByTestId } = await render(ErrorDetailsTableComponent, {
        componentProperties: {
          errors,
          fileType,
        },
      });

      const firstErrorItemMessage = makeWorkplaceItemMessage(errors[0].items[0].name, errors[0].items[0].lineNumber);
      const secondErrorItemMessage = makeWorkplaceItemMessage(errors[1].items[0].name, errors[1].items[0].lineNumber);

      expect(queryByText(firstErrorItemMessage, { exact: false })).toBeNull();
      expect(queryByText(secondErrorItemMessage, { exact: false })).toBeNull();

      const openCloseToggles = within(getByTestId('error-details-table')).queryAllByText('Open');

      fireEvent.click(openCloseToggles[0]);
      fireEvent.click(openCloseToggles[1]);

      expect(openCloseToggles[0].textContent).toBe('Close');
      expect(getByText(firstErrorItemMessage, { exact: false }));

      expect(openCloseToggles[1].textContent).toBe('Close');
      expect(getByText(secondErrorItemMessage, { exact: false }));
    });

    it('should show all item messages when dropdown open', async () => {
      const errors = [errorReportErrorBuilder()] as ErrorReportError[];

      errors[0].items = [itemBuilder() as Items, itemBuilder() as Items, itemBuilder() as Items];
      const openErrors = [errors[0].errCode];

      const fileType = 'Workplace';

      const { getByText } = await render(ErrorDetailsTableComponent, {
        componentProperties: {
          errors,
          fileType,
          openErrors,
        },
      });

      const itemMessage1 = makeWorkplaceItemMessage(errors[0].items[0].name, errors[0].items[0].lineNumber);
      const itemMessage2 = makeWorkplaceItemMessage(errors[0].items[1].name, errors[0].items[1].lineNumber);
      const itemMessage3 = makeWorkplaceItemMessage(errors[0].items[2].name, errors[0].items[2].lineNumber);

      expect(getByText(itemMessage1, { exact: false }));
      expect(getByText(itemMessage2, { exact: false }));
      expect(getByText(itemMessage3, { exact: false }));
    });
  });

  describe('when fileType is Staff', () => {
    it('should show a list of errors', async () => {
      const errors = [
        errorReportErrorBuilder(),
        errorReportErrorBuilder(),
        errorReportErrorBuilder(),
      ] as ErrorReportError[];

      errors[0].items = [workerItemBuilder() as Items];
      errors[1].items = [workerItemBuilder() as Items];
      errors[2].items = [workerItemBuilder() as Items];

      const fileType = 'Staff';

      const { getByText } = await render(ErrorDetailsTableComponent, {
        componentProperties: {
          errors,
          fileType,
        },
      });
      expect(getByText(errors[0].error, { exact: false }));
      expect(getByText(errors[1].error, { exact: false }));
      expect(getByText(errors[2].error, { exact: false }));
    });

    it('should show a dropdown after clicking Open and toggle to say Close', async () => {
      const errors = [errorReportErrorBuilder()] as ErrorReportError[];

      errors[0].items = [workerItemBuilder() as Items];

      const fileType = 'Staff';

      const { getByText, queryByText, getByTestId } = await render(ErrorDetailsTableComponent, {
        componentProperties: {
          errors,
          fileType,
        },
      });

      const itemMessage = makeTrainingOrStaffItemMessage(
        errors[0].items[0].worker,
        errors[0].items[0].name,
        errors[0].items[0].lineNumber,
      );

      expect(queryByText(itemMessage, { exact: false })).toBeNull();

      const openCloseToggle = within(getByTestId('error-details-table')).getByText('Open');

      fireEvent.click(openCloseToggle);

      expect(openCloseToggle.textContent).toBe('Close');
      expect(getByText(itemMessage, { exact: false }));
    });

    it('should hide the dropdown and toggle to say Open after clicking Close', async () => {
      const errors = [errorReportErrorBuilder()] as ErrorReportError[];

      errors[0].items = [workerItemBuilder() as Items];
      const openErrors = [errors[0].errCode];

      const fileType = 'Staff';

      const { getByTestId, getByText, queryByText } = await render(ErrorDetailsTableComponent, {
        componentProperties: {
          errors,
          fileType,
          openErrors,
        },
      });

      const openCloseToggle = within(getByTestId('error-details-table')).getByText('Close');

      const itemMessage = makeTrainingOrStaffItemMessage(
        errors[0].items[0].worker,
        errors[0].items[0].name,
        errors[0].items[0].lineNumber,
      );

      expect(getByText(itemMessage, { exact: false }));

      fireEvent.click(openCloseToggle);

      expect(openCloseToggle.textContent).toBe('Open');
      expect(queryByText(itemMessage, { exact: false })).toBeNull();
    });

    it('should show both dropdowns after clicking Open on two errors', async () => {
      const errors = [errorReportErrorBuilder(), errorReportErrorBuilder()] as ErrorReportError[];

      errors[0].items = [workerItemBuilder() as Items];
      errors[1].items = [workerItemBuilder() as Items];

      const fileType = 'Staff';

      const { getByText, queryByText, getByTestId } = await render(ErrorDetailsTableComponent, {
        componentProperties: {
          errors,
          fileType,
        },
      });

      const firstErrorItemMessage = makeTrainingOrStaffItemMessage(
        errors[0].items[0].worker,
        errors[0].items[0].name,
        errors[0].items[0].lineNumber,
      );
      const secondErrorItemMessage = makeTrainingOrStaffItemMessage(
        errors[1].items[0].worker,
        errors[1].items[0].name,
        errors[1].items[0].lineNumber,
      );

      expect(queryByText(firstErrorItemMessage, { exact: false })).toBeNull();
      expect(queryByText(secondErrorItemMessage, { exact: false })).toBeNull();

      const openCloseToggles = within(getByTestId('error-details-table')).queryAllByText('Open');

      fireEvent.click(openCloseToggles[0]);
      fireEvent.click(openCloseToggles[1]);

      expect(openCloseToggles[0].textContent).toBe('Close');
      expect(getByText(firstErrorItemMessage, { exact: false }));

      expect(openCloseToggles[1].textContent).toBe('Close');
      expect(getByText(secondErrorItemMessage, { exact: false }));
    });

    it('should show all item messages when dropdown open', async () => {
      const errors = [errorReportErrorBuilder()] as ErrorReportError[];

      errors[0].items = [workerItemBuilder() as Items, workerItemBuilder() as Items, workerItemBuilder() as Items];
      const openErrors = [errors[0].errCode];

      const fileType = 'Staff';

      const { getByText } = await render(ErrorDetailsTableComponent, {
        componentProperties: {
          errors,
          fileType,
          openErrors,
        },
      });

      const itemMessage1 = makeTrainingOrStaffItemMessage(
        errors[0].items[0].worker,
        errors[0].items[0].name,
        errors[0].items[0].lineNumber,
      );
      const itemMessage2 = makeTrainingOrStaffItemMessage(
        errors[0].items[1].worker,
        errors[0].items[1].name,
        errors[0].items[1].lineNumber,
      );
      const itemMessage3 = makeTrainingOrStaffItemMessage(
        errors[0].items[2].worker,
        errors[0].items[2].name,
        errors[0].items[2].lineNumber,
      );

      expect(getByText(itemMessage1, { exact: false }));
      expect(getByText(itemMessage2, { exact: false }));
      expect(getByText(itemMessage3, { exact: false }));
    });
  });

  describe('when fileType is Training', () => {
    it('should show a list of errors', async () => {
      const errors = [
        errorReportErrorBuilder(),
        errorReportErrorBuilder(),
        errorReportErrorBuilder(),
      ] as ErrorReportError[];

      errors[0].items = [workerItemBuilder() as Items];
      errors[1].items = [workerItemBuilder() as Items];
      errors[2].items = [workerItemBuilder() as Items];

      const fileType = 'Training';

      const { getByText } = await render(ErrorDetailsTableComponent, {
        componentProperties: {
          errors,
          fileType,
        },
      });
      expect(getByText(errors[0].error, { exact: false }));
      expect(getByText(errors[1].error, { exact: false }));
      expect(getByText(errors[2].error, { exact: false }));
    });

    it('should show a dropdown after clicking Open and toggle to say Close', async () => {
      const errors = [errorReportErrorBuilder()] as ErrorReportError[];

      errors[0].items = [workerItemBuilder() as Items];

      const fileType = 'Training';

      const { getByText, queryByText, getByTestId } = await render(ErrorDetailsTableComponent, {
        componentProperties: {
          errors,
          fileType,
        },
      });

      const itemMessage = makeTrainingOrStaffItemMessage(
        errors[0].items[0].worker,
        errors[0].items[0].name,
        errors[0].items[0].lineNumber,
      );

      expect(queryByText(itemMessage, { exact: false })).toBeNull();

      const openCloseToggle = within(getByTestId('error-details-table')).getByText('Open');

      fireEvent.click(openCloseToggle);

      expect(openCloseToggle.textContent).toBe('Close');
      expect(getByText(itemMessage, { exact: false }));
    });

    it('should hide the dropdown and toggle to say Open after clicking Close', async () => {
      const errors = [errorReportErrorBuilder()] as ErrorReportError[];

      errors[0].items = [workerItemBuilder() as Items];
      const openErrors = [errors[0].errCode];

      const fileType = 'Training';

      const { getByTestId, getByText, queryByText } = await render(ErrorDetailsTableComponent, {
        componentProperties: {
          errors,
          fileType,
          openErrors,
        },
      });

      const openCloseToggle = within(getByTestId('error-details-table')).getByText('Close');

      const itemMessage = makeTrainingOrStaffItemMessage(
        errors[0].items[0].worker,
        errors[0].items[0].name,
        errors[0].items[0].lineNumber,
      );
      expect(getByText(itemMessage, { exact: false }));

      fireEvent.click(openCloseToggle);

      expect(openCloseToggle.textContent).toBe('Open');
      expect(queryByText(itemMessage, { exact: false })).toBeNull();
    });

    it('should show both dropdowns after clicking Open on two errors', async () => {
      const errors = [errorReportErrorBuilder(), errorReportErrorBuilder()] as ErrorReportError[];

      errors[0].items = [workerItemBuilder() as Items];
      errors[1].items = [workerItemBuilder() as Items];

      const fileType = 'Training';

      const { getByText, queryByText, getByTestId } = await render(ErrorDetailsTableComponent, {
        componentProperties: {
          errors,
          fileType,
        },
      });

      const firstErrorItemMessage = makeTrainingOrStaffItemMessage(
        errors[0].items[0].worker,
        errors[0].items[0].name,
        errors[0].items[0].lineNumber,
      );
      const secondErrorItemMessage = makeTrainingOrStaffItemMessage(
        errors[1].items[0].worker,
        errors[1].items[0].name,
        errors[1].items[0].lineNumber,
      );

      expect(queryByText(firstErrorItemMessage, { exact: false })).toBeNull();
      expect(queryByText(secondErrorItemMessage, { exact: false })).toBeNull();

      const openCloseToggles = within(getByTestId('error-details-table')).queryAllByText('Open');

      fireEvent.click(openCloseToggles[0]);
      fireEvent.click(openCloseToggles[1]);

      expect(openCloseToggles[0].textContent).toBe('Close');
      expect(getByText(firstErrorItemMessage, { exact: false }));

      expect(openCloseToggles[1].textContent).toBe('Close');
      expect(getByText(secondErrorItemMessage, { exact: false }));
    });

    it('should show all item messages when dropdown open', async () => {
      const errors = [errorReportErrorBuilder()] as ErrorReportError[];

      errors[0].items = [workerItemBuilder() as Items, workerItemBuilder() as Items, workerItemBuilder() as Items];
      const openErrors = [errors[0].errCode];

      const fileType = 'Training';

      const { getByText } = await render(ErrorDetailsTableComponent, {
        componentProperties: {
          errors,
          fileType,
          openErrors,
        },
      });

      const itemMessage1 = makeTrainingOrStaffItemMessage(
        errors[0].items[0].worker,
        errors[0].items[0].name,
        errors[0].items[0].lineNumber,
      );
      const itemMessage2 = makeTrainingOrStaffItemMessage(
        errors[0].items[1].worker,
        errors[0].items[1].name,
        errors[0].items[1].lineNumber,
      );
      const itemMessage3 = makeTrainingOrStaffItemMessage(
        errors[0].items[2].worker,
        errors[0].items[2].name,
        errors[0].items[2].lineNumber,
      );

      expect(getByText(itemMessage1, { exact: false }));
      expect(getByText(itemMessage2, { exact: false }));
      expect(getByText(itemMessage3, { exact: false }));
    });
  });
});
