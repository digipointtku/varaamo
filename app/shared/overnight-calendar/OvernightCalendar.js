import React from 'react';
import DayPicker from 'react-day-picker';
import MomentLocaleUtils from 'react-day-picker/moment';
import moment from 'moment';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import { injectT } from 'i18n';
import {
  filterSelectedReservation,
  getNotSelectableNotificationText,
  getNotificationText,
  getOvernightDatetime,
  getReservationUrl,
  handleDateSelect,
  handleDisableDays,
  handleFormattingSelected,
  isReservingAllowed,
  nextDayBookedModifier,
  nextDayClosedModifier,
  prevDayBookedModifier,
  prevDayClosedModifier,
  reservationsModifier
} from './overnightUtils';
import OvernightCalendarSelector from './OvernightCalendarSelector';
import OvernightSummary from './OvernightSummary';
import { setSelectedDatetimes } from '../../actions/uiActions';
import OvernightLegends from './OvernightLegends';
import { addNotification } from 'actions/notificationsActions';
import OvernightEditSummary from './OvernightEditSummary';

function OvernightCalendar({
  currentLanguage, resource, t, selected, actions,
  history, isLoggedIn, isStrongAuthSatisfied, isMaintenanceModeOn,
  reservationId, onEditCancel, onEditConfirm, handleDateChange, selectedDate
}) {
  if (!resource || !resource.reservations) {
    return null;
  }

  let initialStart = null;
  let initialEnd = null;

  if (selected && selected.length > 1) {
    initialStart = moment(selected[0].begin).toDate();
    initialEnd = moment(selected[1].end).toDate();
  }

  const [startDate, setStartDate] = React.useState(initialStart);
  const [endDate, setEndDate] = React.useState(initialEnd);

  const {
    reservable, reservableAfter, reservableBefore, openingHours, reservations,
    overnightStartTime, overnightEndTime
  } = resource;

  const filteredReservations = reservationId
    ? filterSelectedReservation(reservationId, reservations) : reservations;

  const highlighted = { from: startDate, to: endDate };
  const available = { from: new Date(2024, 2, 4), to: new Date(2024, 2, 8) };
  const start = startDate;
  const end = endDate;

  const now = moment();
  const reservingIsAllowed = isReservingAllowed({
    isLoggedIn, isStrongAuthSatisfied, isMaintenanceModeOn, resource
  });

  const validateAndSelect = (day, { booked, nextBooked, nextClosed }) => {
    const isNextBlocked = !startDate && (nextBooked || nextClosed);
    const isDateDisabled = handleDisableDays({
      day,
      now,
      reservable,
      reservableAfter,
      reservableBefore,
      startDate,
      openingHours,
      reservations: filteredReservations,
    });

    if (!reservingIsAllowed) {
      actions.addNotification({
        message: getNotificationText({
          isLoggedIn, isStrongAuthSatisfied, isMaintenanceModeOn, resource, t
        }),
        type: 'info',
        timeOut: 10000,
      });
      return;
    }

    if (!isDateDisabled && !booked && !isNextBlocked) {
      handleDateSelect(day, startDate, setStartDate, endDate, setEndDate);
      return;
    }

    actions.addNotification({
      message: getNotSelectableNotificationText({
        isDateDisabled, booked, isNextBlocked, t
      }),
      type: 'info',
      timeOut: 10000,
    });
  };

  const isEditing = !!initialStart;

  const handleSelectDatetimes = () => {
    const formattedSelected = handleFormattingSelected(
      startDate, endDate, overnightStartTime, overnightEndTime, resource.id);
    actions.setSelectedDatetimes([formattedSelected, formattedSelected]);
    if (isEditing) {
      onEditConfirm();
    } else {
      const nextUrl = getReservationUrl(undefined, resource.id);
      history.push(nextUrl);
    }
  };

  // for init month use redux's selected > url date > current date
  const initialMonth = initialStart || moment(selectedDate).toDate() || new Date();
  const showSummary = !isEditing && startDate && endDate;
  const showEditSummary = isEditing;

  return (
    <div className="overnight-calendar">
      <DayPicker
        disabledDays={(day) => handleDisableDays({
          day,
          now,
          reservable,
          reservableAfter,
          reservableBefore,
          startDate,
          openingHours,
          reservations: filteredReservations,
        })}
        enableOutsideDays
        firstDayOfWeek={1}
        initialMonth={initialMonth}
        labels={{ previousMonth: t('Overnight.prevMonth'), nextMonth: t('Overnight.nextMonth') }}
        locale={currentLanguage}
        localeUtils={MomentLocaleUtils}
        modifiers={{
          start,
          end,
          highlighted,
          available,
          booked: (day) => reservationsModifier(day, filteredReservations),
          nextBooked: (day) => nextDayBookedModifier(day, filteredReservations),
          nextBookedStartSelected: (day) => (
            startDate ? nextDayBookedModifier(day, filteredReservations) : null),
          nextClosed: (day) => nextDayClosedModifier(day, openingHours),
          prevBooked: (day) => prevDayBookedModifier(day, filteredReservations),
          prevClosed: (day) => prevDayClosedModifier(day, openingHours),
        }}
        onDayClick={validateAndSelect}
        onMonthChange={handleDateChange}
        selectedDays={[startDate, endDate]}
        showOutsideDays
        todayButton={t('Overnight.currentMonth')}
      />
      <OvernightLegends />
      {showSummary && (
        <OvernightSummary
          endDatetime={getOvernightDatetime(endDate, overnightEndTime)}
          handleSelectDatetimes={handleSelectDatetimes}
          selected={selected}
          startDatetime={getOvernightDatetime(startDate, overnightStartTime)}
        />
      )}
      {showEditSummary && (
        <OvernightEditSummary
          endDatetime={getOvernightDatetime(endDate, overnightEndTime)}
          onCancel={onEditCancel}
          onConfirm={handleSelectDatetimes}
          selected={selected}
          startDatetime={getOvernightDatetime(startDate, overnightStartTime)}
        />
      )}
    </div>
  );
}

OvernightCalendar.defaultProps = {
  reservationId: 0,
  selectedDate: '',
};

OvernightCalendar.propTypes = {
  currentLanguage: PropTypes.string.isRequired,
  resource: PropTypes.object.isRequired,
  t: PropTypes.func.isRequired,
  selected: PropTypes.array.isRequired,
  actions: PropTypes.object.isRequired,
  history: PropTypes.object.isRequired,
  isLoggedIn: PropTypes.bool.isRequired,
  isStrongAuthSatisfied: PropTypes.bool.isRequired,
  isMaintenanceModeOn: PropTypes.bool.isRequired,
  reservationId: PropTypes.number,
  onEditCancel: PropTypes.func,
  onEditConfirm: PropTypes.func,
  handleDateChange: PropTypes.func.isRequired,
  selectedDate: PropTypes.string,
};

OvernightCalendar = injectT(OvernightCalendar); // eslint-disable-line
export { OvernightCalendar as UnconnectedOvernightCalendar };


function mapDispatchToProps(dispatch) {
  const actionCreators = {
    setSelectedDatetimes,
    addNotification,
  };

  return { actions: bindActionCreators(actionCreators, dispatch) };
}

export default connect(
  OvernightCalendarSelector,
  mapDispatchToProps,
)(OvernightCalendar);

