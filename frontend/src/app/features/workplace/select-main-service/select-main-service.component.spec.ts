import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { EstablishmentService } from '@core/services/establishment.service';
import { MockEstablishmentService } from '@core/test-utils/MockEstablishmentService';
import { SelectMainServiceComponent } from '@features/workplace/select-main-service/select-main-service.component';
import { SharedModule } from '@shared/shared.module';
import { render } from '@testing-library/angular';

describe('SelectMainServiceComponent', () => {
  async function setup() {
    const { fixture, getByText } = await render(SelectMainServiceComponent, {
      imports: [SharedModule, RouterModule, RouterTestingModule, ReactiveFormsModule],
      providers: [
        {
          provide: EstablishmentService,
          useClass: MockEstablishmentService,
        },
      provideHttpClient(), provideHttpClientTesting(),],
    });

    const component = fixture.componentInstance;

    return {
      component,
      getByText,
    };
  }

  it('should render', async () => {
    const { component } = await setup();

    expect(component).toBeTruthy();
  });

  it('should render a subheading of Services', async () => {
    const { getByText } = await setup();
    expect(getByText('Services')).toBeTruthy();
  });

  it('should have cancel link with href back to dashboard', async () => {
    const { getByText } = await setup();

    const cancelLink = getByText('Cancel');
    expect(cancelLink.getAttribute('href')).toEqual('/dashboard');
  });
});