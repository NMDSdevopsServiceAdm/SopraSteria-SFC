import { HttpClientTestingModule } from '@angular/common/http/testing';
import { getTestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { Establishment } from '@core/model/establishment.model';
import { EstablishmentService } from '@core/services/establishment.service';
import { MockActivatedRoute } from '@core/test-utils/MockActivatedRoute';
import { establishmentBuilder, MockEstablishmentService } from '@core/test-utils/MockEstablishmentService';
import { SharedModule } from '@shared/shared.module';
import { render } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';

import { TotalNumberOfStaffComponent } from './total-number-of-staff.component';
import { of } from 'rxjs';

fdescribe('TotalNumberOfStaffComponent', () => {
  const setup = async () => {
    const mockWorkplace = establishmentBuilder() as Establishment;
    const setupTools = await render(TotalNumberOfStaffComponent, {
      imports: [SharedModule, RouterModule, HttpClientTestingModule, ReactiveFormsModule],
      providers: [
        {
          provide: EstablishmentService,
          useClass: MockEstablishmentService,
        },
        {
          provide: ActivatedRoute,
          useValue: new MockActivatedRoute({
            parent: {
              snapshot: {
                data: {
                  establishment: mockWorkplace,
                },
              },
            },
          }),
        },
      ],
    });

    const component = setupTools.fixture.componentInstance;
    const injector = getTestBed();
    const establishmentService = injector.inject(EstablishmentService) as EstablishmentService;
    const postStaffSpy = spyOn(establishmentService, 'postStaff').and.returnValue(of(null));

    return {
      ...setupTools,
      component,
      postStaffSpy,
      mockWorkplace,
    };
  };

  it('should create', async () => {
    const { component } = await setup();
    expect(component).toBeTruthy();
  });

  describe('rendering', () => {
    it('should show a page heading', async () => {
      const { getByRole } = await setup();

      const expectedHeading = 'Update the total number of staff for your workplace';
      expect(getByRole('heading', { level: 1, name: expectedHeading })).toBeTruthy();
    });

    it('should show a reveal text to explain Why we ask for this information', async () => {
      const { getByText } = await setup();
      const revealText = getByText('Why we ask for this information');

      expect(revealText).toBeTruthy();
      userEvent.click(revealText);

      const revealTextContent =
        'We need to know the total number of staff employed in workplaces so that we can calculate how many people work in the sector. ' +
        'We also use it to work out turnover and vacancy rates, staff to service ratios and to see if the sector is growing.';
      expect(getByText(revealTextContent)).toBeTruthy();
    });

    it('should show a Save and return button and a Cancel link', async () => {
      const { getByRole, getByText } = await setup();

      expect(getByRole('button', { name: 'Save and return' })).toBeTruthy();

      const cancelLink = getByText('Cancel');
      expect(cancelLink).toBeTruthy();
    });

    it('should show an input box for number of staff', async () => {
      const { getByLabelText, getByText } = await setup();

      expect(getByText('Number of staff')).toBeTruthy();
      expect(getByLabelText('Number of staff')).toBeTruthy();
    });
  });

  describe('on submit', () => {
    it('should call establishment service postStaff() with the updated number of staff', async () => {
      const { getByLabelText, getByRole, postStaffSpy, mockWorkplace } = await setup();

      const numberInput = getByLabelText('Number of staff');
      userEvent.clear(numberInput);
      userEvent.type(numberInput, '10');

      userEvent.click(getByRole('button', { name: 'Save and return' }));

      expect(postStaffSpy).toHaveBeenCalledWith(mockWorkplace.uid, 10);
    });
  });
});
