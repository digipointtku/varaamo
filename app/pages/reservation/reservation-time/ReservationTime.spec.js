import React from 'react';
import simple from 'simple-mock';
import moment from 'moment';
import Button from 'react-bootstrap/lib/Button';

import ReservationCalendar from 'pages/resource/reservation-calendar';
import ResourceCalendar from 'shared/resource-calendar';
import { shallowWithIntl } from 'utils/testUtils';
import Reservation from 'utils/fixtures/Reservation';
import Resource from 'utils/fixtures/Resource';
import Unit from 'utils/fixtures/Unit';
import ReservationTime from './ReservationTime';
import ReservationDetails from '../reservation-details/ReservationDetails';
import OvernightCalendar from '../../../shared/overnight-calendar/OvernightCalendar';

describe('pages/reservation/reservation-time/ReservationTime', () => {
  const history = {
    replace: () => {},
  };

  const defaultProps = {
    history,
    location: {},
    onCancel: simple.mock(),
    onConfirm: simple.mock(),
    match: { params: {} },
    resource: Resource.build(),
    selectedReservation: Reservation.build(),
    selectedTime: { begin: 'beginTimeString', end: 'endTimeString' },
    unit: Unit.build(),
  };

  function getWrapper(extraProps) {
    return shallowWithIntl(<ReservationTime {...defaultProps} {...extraProps} />);
  }

  test('renders header text', () => {
    const header = getWrapper().find('.reservationTime__Header');
    expect(header).toHaveLength(1);
    expect(header.text()).toBe('ReservationPhase.timeTitle');
  });

  describe('when reservation is single day', () => {
    test('doesnt render OvernightCalendar', () => {
      const overnightCalendar = getWrapper().find(OvernightCalendar);
      expect(overnightCalendar).toHaveLength(0);
    });

    test('renders ResourceCalendar', () => {
      const wrapper = getWrapper();
      const instance = wrapper.instance();
      const resourceCalendar = wrapper.find(ResourceCalendar);
      const date = moment(defaultProps.selectedReservation.begin).format('YYYY-MM-DD');

      expect(resourceCalendar).toHaveLength(1);
      expect(resourceCalendar.prop('onDateChange')).toBe(instance.handleDateChange);
      expect(resourceCalendar.prop('selectedDate')).toBe(date);
    });

    test('renders ReservationCalendar', () => {
      const location = { query: { q: 1 } };
      const reservationCalendar = getWrapper({ location }).find(ReservationCalendar);

      expect(reservationCalendar).toHaveLength(1);
      expect(reservationCalendar.prop('location')).toEqual(location);
      expect(reservationCalendar.prop('params')).toEqual({ id: defaultProps.resource.id });
    });

    test('renders cancel button', () => {
      const onCancel = () => undefined;
      const wrapper = getWrapper({ onCancel });
      const button = wrapper.find('.cancel_Button');
      expect(button).toHaveLength(1);
      expect(button.prop('bsStyle')).toBe('warning');
      expect(button.prop('onClick')).toBe(onCancel);
      expect(button.prop('children')).toBe('ReservationInformationForm.cancelEdit');
    });

    test('renders next button', () => {
      const onConfirm = () => undefined;
      const wrapper = getWrapper({ onConfirm });
      const button = wrapper.find('.next_Button');
      expect(button).toHaveLength(1);
      expect(button.prop('bsStyle')).toBe('primary');
      expect(button.prop('onClick')).toBe(onConfirm);
      expect(button.prop('children')).toBe('common.continue');
    });
  });

  describe('when reservation is overnight', () => {
    const resource = Resource.build({ overnightReservations: true });
    const selectedReservation = Reservation.build({ begin: '2018-01-01', end: '2018-01-02' });

    test('renders OvernightCalendar', () => {
      const wrapper = getWrapper({ selectedReservation, resource });
      const instance = wrapper.instance();
      const overnightCalendar = wrapper.find(OvernightCalendar);

      expect(overnightCalendar).toHaveLength(1);
      expect(overnightCalendar.prop('handleDateChange')).toBe(instance.handleDateChange);
      expect(overnightCalendar.prop('history')).toBe(history);
      expect(overnightCalendar.prop('onEditCancel')).toBe(defaultProps.onCancel);
      expect(overnightCalendar.prop('onEditConfirm')).toBe(defaultProps.onConfirm);
      expect(overnightCalendar.prop('params')).toStrictEqual({ id: resource.id });
      expect(overnightCalendar.prop('reservationId')).toBe(selectedReservation.id);
      expect(overnightCalendar.prop('resource')).toBe(resource);
    });

    test('doesnt render ResourceCalendar', () => {
      const resourceCalendar = getWrapper({ selectedReservation, resource }).find(ResourceCalendar);
      expect(resourceCalendar).toHaveLength(0);
    });

    test('doesnt render ReservationCalendar', () => {
      const reservationCalendar = getWrapper({ selectedReservation, resource })
        .find(ResourceCalendar);
      expect(reservationCalendar).toHaveLength(0);
    });
  });

  test('renders reservation details', () => {
    const details = getWrapper().find(ReservationDetails);
    expect(details).toHaveLength(1);
    expect(details.prop('resourceName')).toBe(defaultProps.resource.name);
    expect(details.prop('unitName')).toBe(defaultProps.unit.name);
  });

  describe('reservation time controls', () => {
    const wrapper = getWrapper();

    test('is rendered', () => {
      const controls = wrapper.find('.app-ReservationTime__controls');
      expect(controls.length).toBe(1);
    });

    test('renders cancel button with correct props', () => {
      const buttons = wrapper.find('.app-ReservationTime__controls').find(Button);
      expect(buttons.length).toBe(2);
      expect(buttons.at(0).prop('bsStyle')).toBe('warning');
      expect(buttons.at(0).prop('onClick')).toBe(defaultProps.onCancel);
      expect(buttons.at(0).prop('children')).toBe('ReservationInformationForm.cancelEdit');
    });

    describe('continue button', () => {
      test('renders with correct props', () => {
        const buttons = wrapper.find('.app-ReservationTime__controls').find(Button);
        expect(buttons.length).toBe(2);
        expect(buttons.at(1).prop('bsStyle')).toBe('primary');
        expect(buttons.at(1).prop('onClick')).toBe(defaultProps.onConfirm);
        expect(buttons.at(1).prop('children')).toBe('common.continue');
      });

      test('prop disabled is false when selected time is not empty', () => {
        // default props sets selected time to be not empty
        const buttons = wrapper.find('.app-ReservationTime__controls').find(Button);
        expect(buttons.length).toBe(2);
        expect(buttons.at(1).prop('disabled')).toBe(false);
      });

      test('prop disabled is true when selected time is empty', () => {
        const buttons = getWrapper({ selectedTime: {} }).find('.app-ReservationTime__controls').find(Button);
        expect(buttons.length).toBe(2);
        expect(buttons.at(1).prop('disabled')).toBe(true);
      });
    });
  });

  describe('handleDateChange', () => {
    const date = new Date();
    const day = date.toISOString().substring(0, 10);
    const expectedPath = `/reservation?date=${day}&resource=${defaultProps.resource.id}`;
    let instance;
    let historyMock;

    beforeAll(() => {
      instance = getWrapper().instance();
      historyMock = simple.mock(history, 'replace');
      instance.handleDateChange(date);
    });

    afterAll(() => {
      simple.restore();
    });

    test('calls history replace with correct path', () => {
      expect(historyMock.callCount).toBe(1);
      expect(historyMock.lastCall.args).toEqual([expectedPath]);
    });

    test('sets correct state.selectedDate value', () => {
      expect(instance.state.selectedDate).toEqual(day);
    });
  });
});
