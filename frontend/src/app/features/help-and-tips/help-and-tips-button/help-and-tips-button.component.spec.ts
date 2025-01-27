import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HelpAndTipsButtonComponent } from './help-and-tips-button.component';
import { render } from '@testing-library/angular';
import { Component } from '@angular/core';
import exp from 'constants';

fdescribe('HelpAndTipsButtonComponent', () => {
  async function setup() {
    const setupTools = await render(HelpAndTipsButtonComponent, {
      imports: [],
      providers: []
    });

    return {
      ...setupTools,
      component: setupTools.fixture.componentInstance
    }
  }

  it('should create', async () => {
    const { component } = await setup();
    expect(component).toBeTruthy();
  });

  it('should render a button with the text "Get help and tips"', async () => {
    const { component, getByText } = await setup();
    const buttonText = 'Get help and tips';
    expect(getByText(buttonText)).toBeTruthy();
    expect(getByText(buttonText).nodeName).toBe('BUTTON');
  })

});
