import { HelpAndTipsButtonComponent } from './help-and-tips-button.component';
import { render, fireEvent } from '@testing-library/angular';
import { Component } from '@angular/core';
import { getTestBed } from '@angular/core/testing';
import { Router, RouterModule } from '@angular/router';

describe('HelpAndTipsButtonComponent', () => {
  async function setup() {
    const setupTools = await render(HelpAndTipsButtonComponent, {
      imports: [RouterModule],
      providers: [],
    });

    const injector = getTestBed();
    const router = injector.inject(Router) as Router;
    const routerSpy = spyOn(router, 'navigate').and.returnValue(Promise.resolve(true));

    return {
      ...setupTools,
      component: setupTools.fixture.componentInstance,
      routerSpy,
    };
  }

  it('should create', async () => {
    const { component } = await setup();
    expect(component).toBeTruthy();
  });

  it('should render a button with the text "Get help and tips"', async () => {
    const { getByText } = await setup();
    const buttonText = 'Get help and tips';
    expect(getByText(buttonText)).toBeTruthy();
    expect(getByText(buttonText).nodeName).toBe('BUTTON');
  });

  it('should navigate to help section when clicked', async () => {
    const { getByText, routerSpy } = await setup();

    const button = getByText('Get help and tips');
    fireEvent.click(button);

    expect(routerSpy).toHaveBeenCalledWith(['/help', 'get-started']);
  });
});
