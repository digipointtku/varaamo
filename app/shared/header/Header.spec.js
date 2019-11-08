import React from 'react';
import Sticky from 'react-sticky-el';
import { shallow } from 'enzyme';

import MainNavbar from 'shared/main-navbar';
import TopNavbar from 'shared/top-navbar';
import Header from './Header';

describe('shared/header/Header', () => {
  const pathname = 'somepath';
  function getWrapper() {
    const defaults = {
      location: { pathname },
    };
    return shallow(
      <Header {...defaults}>
        <div id="child-div" />
      </Header>
    );
  }

  test('renders header', () => {
    const element = getWrapper().find('header');
    expect(element).toHaveLength(1);
    expect(element.prop('className')).toBe('app-Header');
  });

  test('renders top navbar', () => {
    const topNavbar = getWrapper().find(TopNavbar);
    expect(topNavbar).toHaveLength(1);
  });

  test('renders sticky', () => {
    const sticky = getWrapper().find(Sticky);
    expect(sticky).toHaveLength(1);
  });

  test('renders main navbar', () => {
    const mainNavbar = getWrapper().find(MainNavbar);
    expect(mainNavbar).toHaveLength(1);
    expect(mainNavbar.at(0).prop('activeLink')).toBe(pathname);
  });

  test('renders props.children', () => {
    const children = getWrapper().find('#child-div');
    expect(children).toHaveLength(1);
  });
});
