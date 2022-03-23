import { ErrorReportWarning, Items } from '@core/model/bulk-upload.model';
import { build, fake } from '@jackfranklin/test-data-bot';
import { fireEvent, render, within } from '@testing-library/angular';

import { WarningDetailsTableComponent } from './warning-details-table.component';

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

const errorReportWarningBuilder = build('ErrorReportWarning', {
  fields: {
    warning: fake((f) => f.lorem.sentence()),
    warnCode: fake((f) => f.datatype.number({ min: 1000, max: 9999 })),
    items: [],
  },
});

const makeWorkplaceItemMessage = (name: string, lineNumber: number) => {
  return `for workplace '${name}' on line ${lineNumber}`;
};

const makeTrainingOrStaffItemMessage = (worker: string, name: string, lineNumber: number) => {
  return `for staff record '${worker}' at workplace '${name}' on line ${lineNumber}`;
};

describe('WarningDetailsTableComponent', () => {
  it('should create', async () => {
    const component = await render(WarningDetailsTableComponent);
    expect(component).toBeTruthy();
  });

  describe('when fileType is Workplace', () => {
    it('should show a list of warnings', async () => {
      const warnings = [errorReportWarningBuilder()] as ErrorReportWarning[];

      warnings[0].items = [itemBuilder() as Items];

      const fileType = 'Workplace';

      const { getByText } = await render(WarningDetailsTableComponent, {
        componentProperties: {
          warnings,
          fileType,
        },
      });

      expect(getByText(warnings[0].warning, { exact: false }));
    });

    it('should show a dropdown after clicking Open and toggle to say Close', async () => {
      const warnings = [errorReportWarningBuilder()] as ErrorReportWarning[];

      warnings[0].items = [itemBuilder() as Items];

      const fileType = 'Workplace';

      const { getByText, queryByText, getByTestId } = await render(WarningDetailsTableComponent, {
        componentProperties: {
          warnings,
          fileType,
        },
      });

      const itemMessage = makeWorkplaceItemMessage(warnings[0].items[0].name, warnings[0].items[0].lineNumber);
      expect(queryByText(itemMessage, { exact: false })).toBeNull();

      const openCloseToggle = within(getByTestId('warning-details-table')).getByText('Open');

      fireEvent.click(openCloseToggle);

      expect(openCloseToggle.textContent).toBe('Close');
      expect(getByText(itemMessage, { exact: false }));
    });

    it('should hide the dropdown and toggle to say Open after clicking Close', async () => {
      const warnings = [errorReportWarningBuilder()] as ErrorReportWarning[];

      warnings[0].items = [itemBuilder() as Items];
      const openWarnings = [warnings[0].warnCode];

      const fileType = 'Workplace';

      const { getByTestId, getByText, queryByText } = await render(WarningDetailsTableComponent, {
        componentProperties: {
          warnings,
          fileType,
          openWarnings,
        },
      });

      const openCloseToggle = within(getByTestId('warning-details-table')).getByText('Close');

      const itemMessage = makeWorkplaceItemMessage(warnings[0].items[0].name, warnings[0].items[0].lineNumber);
      expect(getByText(itemMessage, { exact: false }));

      fireEvent.click(openCloseToggle);

      expect(openCloseToggle.textContent).toBe('Open');
      expect(queryByText(itemMessage, { exact: false })).toBeNull();
    });

    it('should show both dropdowns after clicking Open on two warnings', async () => {
      const warnings = [errorReportWarningBuilder(), errorReportWarningBuilder()] as ErrorReportWarning[];

      warnings[0].items = [itemBuilder() as Items];
      warnings[1].items = [itemBuilder() as Items];

      const fileType = 'Workplace';

      const { getByText, queryByText, getByTestId } = await render(WarningDetailsTableComponent, {
        componentProperties: {
          warnings,
          fileType,
        },
      });

      const firstWarningItemMessage = makeWorkplaceItemMessage(
        warnings[0].items[0].name,
        warnings[0].items[0].lineNumber,
      );
      const secondWarningItemMessage = makeWorkplaceItemMessage(
        warnings[1].items[0].name,
        warnings[1].items[0].lineNumber,
      );

      expect(queryByText(firstWarningItemMessage, { exact: false })).toBeNull();
      expect(queryByText(secondWarningItemMessage, { exact: false })).toBeNull();

      const openCloseToggles = within(getByTestId('warning-details-table')).queryAllByText('Open');

      fireEvent.click(openCloseToggles[0]);
      fireEvent.click(openCloseToggles[1]);

      expect(openCloseToggles[0].textContent).toBe('Close');
      expect(getByText(firstWarningItemMessage, { exact: false }));

      expect(openCloseToggles[1].textContent).toBe('Close');
      expect(getByText(secondWarningItemMessage, { exact: false }));
    });

    it('should show all item messages when dropdown open', async () => {
      const warnings = [errorReportWarningBuilder()] as ErrorReportWarning[];

      warnings[0].items = [itemBuilder() as Items, itemBuilder() as Items, itemBuilder() as Items];
      const openWarnings = [warnings[0].warnCode];

      const fileType = 'Workplace';

      const { getByText } = await render(WarningDetailsTableComponent, {
        componentProperties: {
          warnings,
          fileType,
          openWarnings,
        },
      });

      const itemMessage1 = makeWorkplaceItemMessage(warnings[0].items[0].name, warnings[0].items[0].lineNumber);
      const itemMessage2 = makeWorkplaceItemMessage(warnings[0].items[1].name, warnings[0].items[1].lineNumber);
      const itemMessage3 = makeWorkplaceItemMessage(warnings[0].items[2].name, warnings[0].items[2].lineNumber);

      expect(getByText(itemMessage1, { exact: false }));
      expect(getByText(itemMessage2, { exact: false }));
      expect(getByText(itemMessage3, { exact: false }));
    });
  });

  describe('when fileType is Staff', () => {
    it('should show a list of warnings', async () => {
      const warnings = [
        errorReportWarningBuilder(),
        errorReportWarningBuilder(),
        errorReportWarningBuilder(),
      ] as ErrorReportWarning[];

      warnings[0].items = [workerItemBuilder() as Items];
      warnings[1].items = [workerItemBuilder() as Items];
      warnings[2].items = [workerItemBuilder() as Items];

      const fileType = 'Staff';

      const { getByText } = await render(WarningDetailsTableComponent, {
        componentProperties: {
          warnings,
          fileType,
        },
      });
      expect(getByText(warnings[0].warning, { exact: false }));
      expect(getByText(warnings[1].warning, { exact: false }));
      expect(getByText(warnings[2].warning, { exact: false }));
    });

    it('should show a dropdown after clicking Open and toggle to say Close', async () => {
      const warnings = [errorReportWarningBuilder()] as ErrorReportWarning[];

      warnings[0].items = [workerItemBuilder() as Items];

      const fileType = 'Staff';

      const { getByText, queryByText, getByTestId } = await render(WarningDetailsTableComponent, {
        componentProperties: {
          warnings,
          fileType,
        },
      });

      const itemMessage = makeTrainingOrStaffItemMessage(
        warnings[0].items[0].worker,
        warnings[0].items[0].name,
        warnings[0].items[0].lineNumber,
      );

      expect(queryByText(itemMessage, { exact: false })).toBeNull();

      const openCloseToggle = within(getByTestId('warning-details-table')).getByText('Open');

      fireEvent.click(openCloseToggle);

      expect(openCloseToggle.textContent).toBe('Close');
      expect(getByText(itemMessage, { exact: false }));
    });

    it('should hide the dropdown and toggle to say Open after clicking Close', async () => {
      const warnings = [errorReportWarningBuilder()] as ErrorReportWarning[];

      warnings[0].items = [workerItemBuilder() as Items];
      const openWarnings = [warnings[0].warnCode];

      const fileType = 'Staff';

      const { getByTestId, getByText, queryByText } = await render(WarningDetailsTableComponent, {
        componentProperties: {
          warnings,
          fileType,
          openWarnings,
        },
      });

      const openCloseToggle = within(getByTestId('warning-details-table')).getByText('Close');

      const itemMessage = makeTrainingOrStaffItemMessage(
        warnings[0].items[0].worker,
        warnings[0].items[0].name,
        warnings[0].items[0].lineNumber,
      );

      expect(getByText(itemMessage, { exact: false }));

      fireEvent.click(openCloseToggle);

      expect(openCloseToggle.textContent).toBe('Open');
      expect(queryByText(itemMessage, { exact: false })).toBeNull();
    });

    it('should show both dropdowns after clicking Open on two warnings', async () => {
      const warnings = [errorReportWarningBuilder(), errorReportWarningBuilder()] as ErrorReportWarning[];

      warnings[0].items = [workerItemBuilder() as Items];
      warnings[1].items = [workerItemBuilder() as Items];

      const fileType = 'Staff';

      const { getByText, queryByText, getByTestId } = await render(WarningDetailsTableComponent, {
        componentProperties: {
          warnings,
          fileType,
        },
      });

      const firstWarningItemMessage = makeTrainingOrStaffItemMessage(
        warnings[0].items[0].worker,
        warnings[0].items[0].name,
        warnings[0].items[0].lineNumber,
      );
      const secondWarningItemMessage = makeTrainingOrStaffItemMessage(
        warnings[1].items[0].worker,
        warnings[1].items[0].name,
        warnings[1].items[0].lineNumber,
      );

      expect(queryByText(firstWarningItemMessage, { exact: false })).toBeNull();
      expect(queryByText(secondWarningItemMessage, { exact: false })).toBeNull();

      const openCloseToggles = within(getByTestId('warning-details-table')).queryAllByText('Open');

      fireEvent.click(openCloseToggles[0]);
      fireEvent.click(openCloseToggles[1]);

      expect(openCloseToggles[0].textContent).toBe('Close');
      expect(getByText(firstWarningItemMessage, { exact: false }));

      expect(openCloseToggles[1].textContent).toBe('Close');
      expect(getByText(secondWarningItemMessage, { exact: false }));
    });

    it('should show all item messages when dropdown open', async () => {
      const warnings = [errorReportWarningBuilder()] as ErrorReportWarning[];

      warnings[0].items = [workerItemBuilder() as Items, workerItemBuilder() as Items, workerItemBuilder() as Items];
      const openWarnings = [warnings[0].warnCode];

      const fileType = 'Staff';

      const { getByText } = await render(WarningDetailsTableComponent, {
        componentProperties: {
          warnings,
          fileType,
          openWarnings,
        },
      });

      const itemMessage1 = makeTrainingOrStaffItemMessage(
        warnings[0].items[0].worker,
        warnings[0].items[0].name,
        warnings[0].items[0].lineNumber,
      );
      const itemMessage2 = makeTrainingOrStaffItemMessage(
        warnings[0].items[1].worker,
        warnings[0].items[1].name,
        warnings[0].items[1].lineNumber,
      );
      const itemMessage3 = makeTrainingOrStaffItemMessage(
        warnings[0].items[2].worker,
        warnings[0].items[2].name,
        warnings[0].items[2].lineNumber,
      );

      expect(getByText(itemMessage1, { exact: false }));
      expect(getByText(itemMessage2, { exact: false }));
      expect(getByText(itemMessage3, { exact: false }));
    });
  });

  describe('when fileType is Training', () => {
    it('should show a list of warnings', async () => {
      const warnings = [
        errorReportWarningBuilder(),
        errorReportWarningBuilder(),
        errorReportWarningBuilder(),
      ] as ErrorReportWarning[];

      warnings[0].items = [workerItemBuilder() as Items];
      warnings[1].items = [workerItemBuilder() as Items];
      warnings[2].items = [workerItemBuilder() as Items];

      const fileType = 'Training';

      const { getByText } = await render(WarningDetailsTableComponent, {
        componentProperties: {
          warnings,
          fileType,
        },
      });
      expect(getByText(warnings[0].warning, { exact: false }));
      expect(getByText(warnings[1].warning, { exact: false }));
      expect(getByText(warnings[2].warning, { exact: false }));
    });

    it('should show a dropdown after clicking Open and toggle to say Close', async () => {
      const warnings = [errorReportWarningBuilder()] as ErrorReportWarning[];

      warnings[0].items = [workerItemBuilder() as Items];

      const fileType = 'Training';

      const { getByText, queryByText, getByTestId } = await render(WarningDetailsTableComponent, {
        componentProperties: {
          warnings,
          fileType,
        },
      });

      const itemMessage = makeTrainingOrStaffItemMessage(
        warnings[0].items[0].worker,
        warnings[0].items[0].name,
        warnings[0].items[0].lineNumber,
      );

      expect(queryByText(itemMessage, { exact: false })).toBeNull();

      const openCloseToggle = within(getByTestId('warning-details-table')).getByText('Open');

      fireEvent.click(openCloseToggle);

      expect(openCloseToggle.textContent).toBe('Close');
      expect(getByText(itemMessage, { exact: false }));
    });

    it('should hide the dropdown and toggle to say Open after clicking Close', async () => {
      const warnings = [errorReportWarningBuilder()] as ErrorReportWarning[];

      warnings[0].items = [workerItemBuilder() as Items];
      const openWarnings = [warnings[0].warnCode];

      const fileType = 'Training';

      const { getByTestId, getByText, queryByText } = await render(WarningDetailsTableComponent, {
        componentProperties: {
          warnings,
          fileType,
          openWarnings,
        },
      });

      const openCloseToggle = within(getByTestId('warning-details-table')).getByText('Close');

      const itemMessage = makeTrainingOrStaffItemMessage(
        warnings[0].items[0].worker,
        warnings[0].items[0].name,
        warnings[0].items[0].lineNumber,
      );
      expect(getByText(itemMessage, { exact: false }));

      fireEvent.click(openCloseToggle);

      expect(openCloseToggle.textContent).toBe('Open');
      expect(queryByText(itemMessage, { exact: false })).toBeNull();
    });

    it('should show both dropdowns after clicking Open on two warnings', async () => {
      const warnings = [errorReportWarningBuilder(), errorReportWarningBuilder()] as ErrorReportWarning[];

      warnings[0].items = [workerItemBuilder() as Items];
      warnings[1].items = [workerItemBuilder() as Items];

      const fileType = 'Training';

      const { getByText, queryByText, getByTestId } = await render(WarningDetailsTableComponent, {
        componentProperties: {
          warnings,
          fileType,
        },
      });

      const firstWarningItemMessage = makeTrainingOrStaffItemMessage(
        warnings[0].items[0].worker,
        warnings[0].items[0].name,
        warnings[0].items[0].lineNumber,
      );
      const secondWarningItemMessage = makeTrainingOrStaffItemMessage(
        warnings[1].items[0].worker,
        warnings[1].items[0].name,
        warnings[1].items[0].lineNumber,
      );

      expect(queryByText(firstWarningItemMessage, { exact: false })).toBeNull();
      expect(queryByText(secondWarningItemMessage, { exact: false })).toBeNull();

      const openCloseToggles = within(getByTestId('warning-details-table')).queryAllByText('Open');

      fireEvent.click(openCloseToggles[0]);
      fireEvent.click(openCloseToggles[1]);

      expect(openCloseToggles[0].textContent).toBe('Close');
      expect(getByText(firstWarningItemMessage, { exact: false }));

      expect(openCloseToggles[1].textContent).toBe('Close');
      expect(getByText(secondWarningItemMessage, { exact: false }));
    });

    it('should show all item messages when dropdown open', async () => {
      const warnings = [errorReportWarningBuilder()] as ErrorReportWarning[];

      warnings[0].items = [workerItemBuilder() as Items, workerItemBuilder() as Items, workerItemBuilder() as Items];
      const openWarnings = [warnings[0].warnCode];

      const fileType = 'Training';

      const { getByText } = await render(WarningDetailsTableComponent, {
        componentProperties: {
          warnings,
          fileType,
          openWarnings,
        },
      });

      const itemMessage1 = makeTrainingOrStaffItemMessage(
        warnings[0].items[0].worker,
        warnings[0].items[0].name,
        warnings[0].items[0].lineNumber,
      );
      const itemMessage2 = makeTrainingOrStaffItemMessage(
        warnings[0].items[1].worker,
        warnings[0].items[1].name,
        warnings[0].items[1].lineNumber,
      );
      const itemMessage3 = makeTrainingOrStaffItemMessage(
        warnings[0].items[2].worker,
        warnings[0].items[2].name,
        warnings[0].items[2].lineNumber,
      );

      expect(getByText(itemMessage1, { exact: false }));
      expect(getByText(itemMessage2, { exact: false }));
      expect(getByText(itemMessage3, { exact: false }));
    });
  });
});
