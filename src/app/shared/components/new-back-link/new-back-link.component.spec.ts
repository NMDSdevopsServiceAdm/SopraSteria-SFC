import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { RouterModule } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { BackLinkService } from '@core/services/back-link/back-link.service';
import { SharedModule } from '@shared/shared.module';
import { fireEvent, render } from '@testing-library/angular';

import { NewBackLinkComponent } from './new-back-link.component';

describe('NewBackLinkComponent', () => {
  const setup = async () => {
    const { fixture, getByText } = await render(NewBackLinkComponent, {
      imports: [SharedModule, RouterModule, RouterTestingModule, HttpClientTestingModule],
      declarations: [],
      providers: [BackLinkService],
    });
    const component = fixture.componentInstance;

    return { component, fixture, getByText };
  };

  it('should render the NewBackLinkComponent', async () => {
    const { component } = await setup();

    expect(component).toBeTruthy();
  });

  it('should call the backLinkService when the back link is clicked', async () => {
    const { component, fixture, getByText } = await setup();

    const backLinkService = TestBed.inject(BackLinkService);
    const backLinkServiceSpy = spyOn(backLinkService, 'goBack');

    component.back = true;
    fixture.detectChanges();

    const backLink = getByText('Back');
    fireEvent.click(backLink);
    fixture.detectChanges();

    expect(backLinkServiceSpy).toHaveBeenCalled();
  });
});
