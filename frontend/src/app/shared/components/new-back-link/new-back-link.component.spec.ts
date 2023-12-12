import { Location } from '@angular/common';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { RouterModule } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { BackService } from '@core/services/back.service';
import { SharedModule } from '@shared/shared.module';
import { fireEvent, render } from '@testing-library/angular';

import { NewBackLinkComponent } from './new-back-link.component';

describe('BackLinkComponent', () => {
  const setup = async () => {
    const { fixture, getByText } = await render(NewBackLinkComponent, {
      imports: [SharedModule, RouterModule, RouterTestingModule, HttpClientTestingModule],
      declarations: [],
      providers: [BackService],
    });
    const component = fixture.componentInstance;

    return { component, fixture, getByText };
  };

  it('should render the BackLinkComponent', async () => {
    const { component } = await setup();

    expect(component).toBeTruthy();
  });

  it('should call the backLinkService when the back link is clicked', async () => {
    const { component, fixture, getByText } = await setup();

    const location = TestBed.inject(Location);
    const locationSpy = spyOn(location, 'back');

    component.showBackLink = true;
    fixture.detectChanges();

    const backLink = getByText('Back');
    fireEvent.click(backLink);
    fixture.detectChanges();

    expect(locationSpy).toHaveBeenCalled();
  });
});
