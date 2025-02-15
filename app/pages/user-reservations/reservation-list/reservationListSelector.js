
import filter from 'lodash/filter';
import orderBy from 'lodash/orderBy';
import values from 'lodash/values';
import { createSelector, createStructuredSelector } from 'reselect';

import ActionTypes from 'constants/ActionTypes';
import { isAdminSelector } from 'state/selectors/authSelectors';
import { resourcesSelector, unitsSelector } from 'state/selectors/dataSelectors';
import requestIsActiveSelectorFactory from 'state/selectors/factories/requestIsActiveSelectorFactory';

const ownReservationsSelector = state => filter(
  state.data.reservations, reservation => reservation.isOwn
);

const sortedReservationsSelector = createSelector(
  ownReservationsSelector,
  reservations => orderBy(values(reservations), ['begin'], ['asc'])
);

const reservationListSelector = createStructuredSelector({
  isAdmin: isAdminSelector,
  isFetchingReservations: requestIsActiveSelectorFactory(ActionTypes.API.RESERVATIONS_GET_REQUEST),
  reservations: sortedReservationsSelector,
  resources: resourcesSelector,
  units: unitsSelector,
});

export default reservationListSelector;
