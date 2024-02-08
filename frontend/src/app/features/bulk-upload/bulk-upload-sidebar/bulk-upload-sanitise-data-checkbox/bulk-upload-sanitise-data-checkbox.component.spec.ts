import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { SharedModule } from '@shared/shared.module';
import { fireEvent, render } from '@testing-library/angular';
import { spy } from 'sinon';

import { BulkUploadSanitiseDataCheckboxComponent } from './bulk-upload-sanitise-data-checkbox.component';

describe('BulkUploadSanitiseDataCheckboxComponent', () => {
  const setup = async (sanitise = true) => {
    const { fixture, getByText, getByTestId } = await render(BulkUploadSanitiseDataCheckboxComponent, {
      imports: [RouterTestingModule, HttpClientTestingModule, SharedModule],
      providers: [],
      componentProperties: {
        sanitise,
        checkboxToggled: {
          emit: spy(),
        } as any,
      },
    });
    const component = fixture.componentInstance;

    return { component, fixture, getByText, getByTestId };
  };

  it('should render a BulkUploadSanitiseDataCheckboxComponent', async () => {
    const { component } = await setup();
    expect(component).toBeTruthy();
  });

  it('should emit checkboxToggled event with false when the checkbox is checked', async () => {
    const { component, fixture, getByTestId } = await setup();
    const checkboxToggledSpy = spyOn(component.checkboxToggled, 'emit').and.callThrough();

    const checkbox = getByTestId('showDataCheckbox');
    fireEvent.click(checkbox);

    fixture.detectChanges();

    expect(checkboxToggledSpy).toHaveBeenCalledWith(false);
  });

  it('should emit checkboxToggled event with true when the checkbox is unchecked', async () => {
    const { component, fixture, getByTestId } = await setup();
    component.sanitise = false;

    const checkboxToggledSpy = spyOn(component.checkboxToggled, 'emit').and.callThrough();

    const checkbox = getByTestId('showDataCheckbox');
    fireEvent.click(checkbox);

    fixture.detectChanges();

    expect(checkboxToggledSpy).toHaveBeenCalledWith(true);
  });
});
