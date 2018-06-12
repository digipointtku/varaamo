import { expect } from 'chai';
import React from 'react';
import { browserHistory } from 'react-router';
import Immutable from 'seamless-immutable';
import simple from 'simple-mock';
import Button from 'react-bootstrap/lib/Button';
import Row from 'react-bootstrap/lib/Row';

import ReservationDate from 'shared/reservation-date';
import Reservation from 'utils/fixtures/Reservation';
import Resource from 'utils/fixtures/Resource';
import User from 'utils/fixtures/User';
import { getResourcePageUrl } from 'utils/resourceUtils';
import { shallowWithIntl } from 'utils/testUtils';
import ReservationConfirmation from './ReservationConfirmation';

describe('pages/reservation/reservation-confirmation/ReservationConfirmation', () => {
  const defaultProps = {
    isEdited: false,
    reservation: Immutable(Reservation.build({ user: User.build() })),
    resource: Immutable(Resource.build()),
  };

  function getWrapper(extraProps) {
    return shallowWithIntl(<ReservationConfirmation {...defaultProps} {...extraProps} />);
  }

  it('renders an Row element', () => {
    expect(getWrapper().find(Row)).to.have.length(1);
  });

  it('renders correct header when prop isEdited is false', () => {
    const header = getWrapper({ isEdited: false }).find('.app-ReservationPage__header');
    expect(header).to.have.length(1);
    expect(header.text()).to.equal('ReservationConfirmation.reservationCreatedTitle');
  });

  it('renders correct header when prop isEdited is false', () => {
    const header = getWrapper({ isEdited: true }).find('.app-ReservationPage__header');
    expect(header).to.have.length(1);
    expect(header.text()).to.equal('ReservationConfirmation.reservationEditedTitle');
  });

  it('renders ReservationDate with correct props', () => {
    const reservationDate = getWrapper().find(ReservationDate);
    expect(reservationDate).to.have.length(1);
    expect(reservationDate.prop('beginDate')).to.equal(defaultProps.reservation.begin);
    expect(reservationDate.prop('endDate')).to.equal(defaultProps.reservation.end);
  });

  it('renders resource name', () => {
    const name = getWrapper().find('.app-ReservationConfirmation__resource-name');
    expect(name).to.have.length(1);
    expect(name.text()).to.equal(defaultProps.resource.name);
  });

  it('renders Button with correct props', () => {
    const button = getWrapper().find(Button);
    expect(button).to.have.length(1);
    expect(button.prop('onClick')).to.be.a('function');
  });

  it('renders reserverName', () => {
    const reservation = Reservation.build({
      reserverName: 'reserver name',
      reserverId: 'reserver id',
      reserverPhoneNumber: '050 1234567',
      reserverEmailAddress: 'reserver email',
      eventSubject: 'event subject',
      eventDescription: 'event description',
      numberOfParticipants: 12,
      comments: 'comments',
      reserverAddressStreet: 'reserver address street',
      reserverAddressZip: 'reserver address zip',
      reserverAddressCity: 'reserver address city',
      billingAddressStreet: 'billing address street',
      billingAddressZip: 'billing address zip',
      billingAddressCity: 'billing address city',
      user: User.build(),
    });
    const fields = getWrapper({ reservation }).find('.app-ReservationConfirmation__field');
    expect(fields).to.have.length(14);
  });

  describe('Button onClick', () => {
    let button;
    let instance;

    before(() => {
      const wrapper = getWrapper();
      button = wrapper.find(Button);
      instance = wrapper.instance();
      instance.handleResourceButton = simple.mock();
    });

    afterEach(() => {
      instance.handleResourceButton.reset();
    });

    after(() => {
      simple.restore();
    });

    it('calls handleResourceButton', () => {
      expect(button).to.have.length(1);
      expect(button.prop('onClick')).to.be.a('function');
      button.prop('onClick')();
      expect(instance.handleResourceButton.callCount).to.equal(1);
    });
  });

  describe('handleResourceButton', () => {
    const day = defaultProps.reservation.begin.substring(0, 10);
    const expectedPath = getResourcePageUrl(defaultProps.resource, day);
    let instance;
    let browserHistoryMock;

    before(() => {
      instance = getWrapper().instance();
      browserHistoryMock = simple.mock(browserHistory, 'replace');
      instance.handleResourceButton();
    });

    after(() => {
      simple.restore();
    });

    it('calls browserHistory replace with correct path', () => {
      expect(browserHistoryMock.callCount).to.equal(1);
      expect(browserHistoryMock.lastCall.args).to.deep.equal([expectedPath]);
    });
  });
});
