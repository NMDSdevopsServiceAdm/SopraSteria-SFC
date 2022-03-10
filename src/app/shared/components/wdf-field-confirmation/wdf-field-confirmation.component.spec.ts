import { HttpClientTestingModule } from '@angular/common/http/testing';
import { BrowserModule } from '@angular/platform-browser';
import { RouterTestingModule } from '@angular/router/testing';
import { WdfModule } from '@features/wdf/wdf-data-change/wdf.module';
import { SharedModule } from '@shared/shared.module';
import { render } from '@testing-library/angular';

import { WdfFieldConfirmationComponent } from './wdf-field-confirmation.component';

describe('WdfFieldConfirmationComponent', async () => {
  const setup = async () => {
    const { fixture, getByText, queryByText } = await render(WdfFieldConfirmationComponent, {
      imports: [SharedModule, RouterTestingModule, HttpClientTestingModule, BrowserModule, WdfModule],
      providers: [],
      declarations: [],
      componentProperties: {
        changeLink: ['123', 'nationality'],
        workerUid: 'abc123',
      },
    });

    const component = fixture.componentInstance;

    return { component, fixture, getByText, queryByText };
  };

  it('should render a WdfFieldConfirmationComponent', async () => {
    const { component } = await setup();
    expect(component).toBeTruthy();
  });

  it('should show meeting requirements message when Yes it is is clicked', async () => {
    const { fixture, getByText } = await setup();

    const yesItIsButton = getByText('Yes, it is', { exact: false });
    yesItIsButton.click();

    fixture.detectChanges();

    expect(getByText('Meeting requirements')).toBeTruthy();
  });

  it('should call workerUid setter when worker uid is changed', async () => {
    const { component } = await setup();

    const setterSpy = spyOnProperty(component, 'workerUid', 'set').and.callThrough();

    component.workerUid = 'def456';

    expect(component.workerUid).toEqual('def456');
    expect(setterSpy).toHaveBeenCalledWith('def456');
  });

  it('should remove meeting requirements message and show confirmation button when resetConfirmButtonClicked is run', async () => {
    const { component, fixture, getByText, queryByText } = await setup();

    const yesItIsButton = getByText('Yes, it is', { exact: false });
    yesItIsButton.click();

    fixture.detectChanges();

    expect(getByText('Meeting requirements')).toBeTruthy();

    component.resetConfirmButtonClicked();
    fixture.detectChanges();

    expect(queryByText('Meeting requirements')).toBeFalsy();
    expect(getByText('Yes, it is', { exact: false })).toBeTruthy();
  });
});
