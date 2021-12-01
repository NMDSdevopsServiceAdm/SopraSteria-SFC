import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { RouterModule } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { EstablishmentService } from '@core/services/establishment.service';
import { RegistrationsService } from '@core/services/registrations.service';
import { SwitchWorkplaceService } from '@core/services/switch-workplace.service';
import { UserService } from '@core/services/user.service';
import { WindowRef } from '@core/services/window.ref';
import { MockEstablishmentService } from '@core/test-utils/MockEstablishmentService';
import { MockFeatureFlagsService } from '@core/test-utils/MockFeatureFlagService';
import { MockSwitchWorkplaceService } from '@core/test-utils/MockSwitchWorkplaceService';
import { FeatureFlagsService } from '@shared/services/feature-flags.service';
import { SharedModule } from '@shared/shared.module';
import { fireEvent, render } from '@testing-library/angular';
import { of } from 'rxjs';

import { SearchForGroupComponent } from './search-for-group.component';

describe('SearchForGroupComponent', () => {
  async function setup(searchButtonClicked = false) {
    const { fixture, getByText, getByTestId, queryByText, queryAllByText } = await render(SearchForGroupComponent, {
      imports: [
        SharedModule,
        RouterModule,
        RouterTestingModule,
        HttpClientTestingModule,
        FormsModule,
        ReactiveFormsModule,
      ],
      providers: [
        { provide: FeatureFlagsService, useClass: MockFeatureFlagsService },
        {
          provide: EstablishmentService,
          useClass: MockEstablishmentService,
        },
        {
          provide: SwitchWorkplaceService,
          useClass: MockSwitchWorkplaceService,
        },
        RegistrationsService,
        WindowRef,
        UserService,
      ],
    });

    const mockSearchResult = {};

    const component = fixture.componentInstance;

    const establishmentService = TestBed.inject(EstablishmentService);
    const searchGroupsSpy = spyOn(establishmentService, 'searchGroups').and.returnValue(of([mockSearchResult]));

    const switchWorkplaceService = TestBed.inject(SwitchWorkplaceService);
    const switchWorkplaceSpy = spyOn(switchWorkplaceService, 'navigateToWorkplace');

    if (searchButtonClicked) {
      const searchButton = getByTestId('searchButton');
      fireEvent.click(searchButton);

      fixture.detectChanges();
    }

    return {
      component,
      fixture,
      getByText,
      getByTestId,
      queryByText,
      queryAllByText,
      searchGroupsSpy,
      switchWorkplaceSpy,
      mockSearchResult,
    };
  }

  it('should render a SearchForGroupComponent', async () => {
    const { component } = await setup();
    expect(component).toBeTruthy();
  });

  it('should call searchGroups with employerType set to All and onlyParents false when clicking search button with nothing changed', async () => {
    const { searchGroupsSpy } = await setup(true);

    expect(searchGroupsSpy).toHaveBeenCalledWith({
      employerType: 'All',
      onlyParents: false,
    });
  });

  it('should call searchGroups with onlyParents set to true when checkbox clicked and then search button', async () => {
    const { fixture, getByText, getByTestId, searchGroupsSpy } = await setup();

    const onlyParentsCheckbox = getByText('Only search for parents');
    fireEvent.click(onlyParentsCheckbox);

    const searchButton = getByTestId('searchButton');
    fireEvent.click(searchButton);

    fixture.detectChanges();

    expect(searchGroupsSpy).toHaveBeenCalledWith({
      employerType: 'All',
      onlyParents: true,
    });
  });

  it('should call searchGroups with employerType set to Local authority (adult services) when second option from select selected and then search button clicked', async () => {
    const { fixture, getByTestId, searchGroupsSpy } = await setup();

    const select: HTMLSelectElement = fixture.debugElement.query(By.css('#employerType')).nativeElement;
    select.value = select.options[1].value;
    select.dispatchEvent(new Event('change'));
    fixture.detectChanges();

    const searchButton = getByTestId('searchButton');
    fireEvent.click(searchButton);

    expect(searchGroupsSpy).toHaveBeenCalledWith({
      employerType: 'Local Authority (adult services)',
      onlyParents: false,
    });
  });
});
