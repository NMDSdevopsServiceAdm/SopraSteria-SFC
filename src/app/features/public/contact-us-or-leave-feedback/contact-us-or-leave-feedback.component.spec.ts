import { HttpClientTestingModule } from '@angular/common/http/testing';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { RouterTestingModule } from '@angular/router/testing';
import { BreadcrumbService } from '@core/services/breadcrumb.service';
import { MockBreadcrumbService } from '@core/test-utils/MockBreadcrumbService';
import { SharedModule } from '@shared/shared.module';
import { render } from '@testing-library/angular';

import { ContactUsComponent } from '../contact-us/contact-us.component';

describe('ContactUsComponent', () => {
  const setup = async () => {
    const { fixture, getByText, getAllByText, getByTestId, queryByText } = await render(ContactUsComponent, {
      imports: [RouterTestingModule, HttpClientTestingModule, BrowserModule, SharedModule, ReactiveFormsModule],
      providers: [{ provide: BreadcrumbService, useClass: MockBreadcrumbService }, FormBuilder],
    });
    const component = fixture.componentInstance;

    return { component, fixture, getByText, getAllByText, getByTestId, queryByText };
  };

  it('should render a ContactUsComponent', async () => {
    const { component } = await setup();
    expect(component).toBeTruthy();
  });
});
