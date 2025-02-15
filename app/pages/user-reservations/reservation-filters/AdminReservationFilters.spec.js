import React from 'react';
import simple from 'simple-mock';

import SelectControl from 'pages/search/controls/SelectControl';
import { shallowWithIntl } from 'utils/testUtils';
import AdminReservationFilters from './AdminReservationFilters';

describe('pages/user-reservations/reservation-filters/AdminReservationFilters', () => {
  const defaultProps = {
    onFiltersChange: simple.stub(),
    filters: { state: 'requested' },
  };

  function getWrapper(extraProps) {
    return shallowWithIntl(<AdminReservationFilters {...defaultProps} {...extraProps} />);
  }

  describe('state filter', () => {
    const select = getWrapper().find(SelectControl);

    test('renders a Select component with correct props', () => {
      expect(select.length).toBe(1);
      expect(select.prop('id')).toBe('reservation');
      expect(select.prop('isClearable')).toBe(false);
      expect(select.prop('isSearchable')).toBe(false);
      expect(select.prop('label')).toBe('UserReservationsPage.preliminaryReservationsHeader');
      expect(select.prop('name')).toBe('reservation-state-select');
      expect(select.prop('onChange')).toBeDefined();
    });

    test('passes correct value to the Select component', () => {
      expect(select.props().value).toBe(defaultProps.filters.state);
    });

    test('passes correct options to the Select component', () => {
      const expected = [
        { label: 'common.optionsAllLabel', value: 'all' },
        { label: 'common.cancelled', value: 'cancelled' },
        { label: 'common.confirmed', value: 'confirmed' },
        { label: 'common.denied', value: 'denied' },
        { label: 'common.paymentAborted', value: 'waiting_for_payment' },
        { label: 'common.requested', value: 'requested' },
        { label: 'common.waitingForCashPayment', value: 'waiting_for_cash_payment' },
        { label: 'common.waitingForPayment', value: 'ready_for_payment' },
      ];
      expect(select.props().options).toEqual(expected);
    });

    describe('onChange', () => {
      const filterOption = { label: 'Label', value: 'new-value' };

      beforeAll(() => {
        select.props().onChange(filterOption);
      });

      test('calls onFiltersChange ', () => {
        expect(defaultProps.onFiltersChange.callCount).toBe(1);
      });

      test('calls onFiltersChange with correct arguments', () => {
        const expected = { state: filterOption.value };
        expect(defaultProps.onFiltersChange.lastCall.args[0]).toEqual(expected);
      });
    });
  });
});
