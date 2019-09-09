import isEmpty from 'lodash/isEmpty';
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import iconHome from 'hel-icons/dist/shapes/home.svg';

import iconCalendar from 'assets/icons/calendar.svg';
import ReservationAccessCode from 'shared/reservation-access-code';
import ReservationControls from 'shared/reservation-controls';
import ReservationStateLabel from 'shared/reservation-state-label';
import TimeRange from 'shared/time-range';
import { injectT } from 'i18n';
import { getMainImage } from 'utils/imageUtils';
import { getResourcePageUrl } from 'utils/resourceUtils';

class ReservationListItem extends Component {
  renderImage(image) {
    if (image && image.url) {
      return <img alt={image.caption} className="resourceImg" src={image.url} />;
    }
    return null;
  }

  render() {
    const {
      isAdmin, isStaff, reservation, resource, t, unit
    } = this.props;

    const nameSeparator = isEmpty(resource) || isEmpty(unit) ? '' : ', ';

    return (
      <li className="reservation">
        <div className="col-md-3 col-lg-2 image-container">
          <Link
            aria-hidden="true"
            tabIndex="-1"
            to={getResourcePageUrl(resource)}
          >
            {this.renderImage(getMainImage(resource.images))}
          </Link>
        </div>
        <div className="col-xs-12 col-sm-8 col-md-5 col-lg-7 reservation-details">
          <ReservationStateLabel reservation={reservation} />
          <Link to={getResourcePageUrl(resource)}>
            <h2>{resource.name}</h2>
          </Link>
          <div>
            <img alt={t('common.addressStreetLabel')} className="location" src={iconHome} />
            <span className="unit-name">{unit.name}</span>
            {nameSeparator}
            <span>{unit.streetAddress}</span>
          </div>
          <div>
            <img alt={t('common.reservationTimeLabel')} className="timeslot" src={iconCalendar} />
            <TimeRange begin={reservation.begin} end={reservation.end} />
          </div>
          <ReservationAccessCode
            reservation={reservation}
            resource={resource}
            text={t('ReservationListItem.accessCodeText')}
          />
        </div>
        <div className="col-xs-12 col-sm-4 col-md-4 col-lg-3 action-container">
          <ReservationControls
            isAdmin={isAdmin}
            isStaff={isStaff}
            reservation={reservation}
            resource={resource}
          />
        </div>
      </li>
    );
  }
}

ReservationListItem.propTypes = {
  isAdmin: PropTypes.bool.isRequired,
  isStaff: PropTypes.bool.isRequired,
  reservation: PropTypes.object.isRequired,
  resource: PropTypes.object.isRequired,
  t: PropTypes.func.isRequired,
  unit: PropTypes.object.isRequired,
};

export default injectT(ReservationListItem);
