import PropTypes from 'prop-types';
import React, { Component } from 'react';
import Loader from 'react-loader';
import { connect } from 'react-redux';

import { injectT } from 'i18n';
import ReservationListItem from './ReservationListItem';
import reservationListSelector from './reservationListSelector';

class UnconnectedReservationListContainer extends Component {
  constructor(props) {
    super(props);
    this.renderReservationListItem = this.renderReservationListItem.bind(this);
  }

  renderReservationListItem(reservation) {
    const {
      isAdmin,
      resources,
      units,
      paymentUrlData,
    } = this.props;
    const resource = resources[reservation.resource] || {};
    const unit = resource.unit ? units[resource.unit] || {} : {};

    return (
      <ReservationListItem
        isAdmin={isAdmin}
        key={reservation.url}
        paymentUrlData={paymentUrlData}
        reservation={reservation}
        resource={resource}
        unit={unit}
      />
    );
  }

  render() {
    const {
      emptyMessage,
      loading,
      reservations,
      t,
    } = this.props;

    return (
      <Loader loaded={!loading}>
        {reservations.length
          ? (
            <div>
              <ul className="reservation-list">
                {reservations.map(this.renderReservationListItem)}
              </ul>
            </div>
          )
          : <p>{emptyMessage || t('ReservationListContainer.emptyMessage')}</p>
        }
      </Loader>
    );
  }
}

UnconnectedReservationListContainer.propTypes = {
  emptyMessage: PropTypes.string,
  filter: PropTypes.string, // eslint-disable-line react/no-unused-prop-types
  isAdmin: PropTypes.bool.isRequired,
  loading: PropTypes.bool.isRequired,
  reservations: PropTypes.array.isRequired,
  resources: PropTypes.object.isRequired,
  t: PropTypes.func.isRequired,
  units: PropTypes.object.isRequired,
  paymentUrlData: PropTypes.object,
};
UnconnectedReservationListContainer = injectT(UnconnectedReservationListContainer);  // eslint-disable-line

export { UnconnectedReservationListContainer };
export default connect(reservationListSelector)(UnconnectedReservationListContainer);
