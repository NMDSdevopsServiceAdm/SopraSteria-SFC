import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { render } from '@testing-library/angular';

import { TotalStaffComponent } from './total-staff.component';
import { SharedModule } from '@shared/shared.module';
import { ReactiveFormsModule, UntypedFormBuilder } from '@angular/forms';
import { EstablishmentService } from '@core/services/establishment.service';
import { MockEstablishmentServiceWithOverrides } from '@core/test-utils/MockEstablishmentService';
import { HttpClient } from '@angular/common/http';

describe('TotalStaffComponent', () => {
  const formBuilder = new UntypedFormBuilder();

  const setup = async (overrides: any = {}) => {
    const setupTools = await render(TotalStaffComponent, {
      imports: [SharedModule, ReactiveFormsModule],
      providers: [
        {
          provide: EstablishmentService,
          useFactory: MockEstablishmentServiceWithOverrides.factory(overrides),
          deps: [HttpClient],
        },
      provideHttpClient(), provideHttpClientTesting(),],
      componentProperties: {
        establishmentUid: 'mock-uid',
        showHint: overrides.showHint ?? true,
        form: formBuilder.group({ totalStaff: '' }),
      },
    });

    const component = setupTools.fixture.componentInstance;

    return { ...setupTools, component };
  };

  it('should create', async () => {
    const component = await setup();
    expect(component).toBeTruthy();
  });

  it('should render the reveal', async () => {
    const { getByTestId } = await setup();

    expect(getByTestId('totalStaffRevealTitle')).toBeTruthy();
    expect(getByTestId('totalStaffRevealText')).toBeTruthy();
  });

  it('should prefill the number of staff', async () => {
    const staffNumber = 20;
    const { getByLabelText } = await setup({
      establishmentObj: { numberOfStaff: staffNumber },
    });

    const numberInput = getByLabelText('Number of staff') as HTMLInputElement;
    expect(numberInput.value).toEqual(`${staffNumber}`);
  });
});