import moment from 'moment';
import { camelizeKeys } from 'humps';

import { getTimeSlots } from '../../../utils/timeUtils';
import { buildAPIUrl } from '../../../utils/apiUtils';
import constants from '../../../constants/AppConstants';

export const mobileWidthMax = 991;

/**
 * Handles finding and returning a date with free time to reserve.
 * @param {string} selectedDate e.g. 'YYYY-MM-DD'
 * @param {object} resource
 * @returns {string} date with free time to reserve e.g. 'YYYY-MM-DD'
 * or '' if no free time is found
 */
export async function getNextFreeTimes(selectedDate, resource) {
  // from time has to be from now or later
  const now = moment();
  const fromMoment = now.isAfter(selectedDate) ? now : moment(selectedDate);
  const fetchedResource = await fetchResource(resource.id, fromMoment);
  if (!fetchedResource) {
    return '';
  }

  const date = findNextFreeSlotDate(fetchedResource, fromMoment.format('YYYY-MM-DD'));

  return date || '';
}

/**
 * Maps and returns reservations by date
 * @param {object[]} reservations
 * @returns a Map of reservations by date e.g. {
 *  '2023-10-12': [{...reservation}, {...reservation}, ...],
 *  '2023-10-13': [{...reservation}, {...reservation}, ...],
 * }
 */
function mapReservationsByDate(reservations) {
  const reservationMap = new Map();

  const addReservation = (date, reservation) => {
    if (reservationMap.has(date)) {
      reservationMap.get(date).push(reservation);
    } else {
      reservationMap.set(date, [reservation]);
    }
  };

  reservations.forEach((reservation) => {
    const beginMoment = moment(reservation.begin);
    const endMoment = moment(reservation.end);
    addReservation(beginMoment.format('YYYY-MM-DD'), reservation);
    if (!beginMoment.isSame(endMoment, 'day')) {
      addReservation(endMoment.format('YYYY-MM-DD'), reservation);
    }
  });

  return reservationMap;
}

/**
 * Checks if there is free time to reserve within given opening hours
 * @param {string} opens timestamp
 * @param {string} closes timestamp
 * @param {object[]} reservations
 * @param {string} minPeriod e.g. '01:00:00'
 * @param {string} slotSize e.g. '01:00:00'
 * @param {string} cooldown e.g. '01:00:00'
 * @returns {boolean} true if there is free time, false otherwise
 */
export function hasFreeTimeInDay(opens, closes, reservations, minPeriod, slotSize, cooldown) {
  const slots = getTimeSlots(opens, closes, slotSize, reservations, [], cooldown);
  const now = moment();
  const slotsAfterNow = now.isSame(opens, 'day') ? slots.filter(slot => moment(slot.end).isAfter(now)) : slots;

  // when slot size and min period matches, simply return first free slot
  if (slotSize === minPeriod) {
    return slotsAfterNow.some(slot => !slot.reserved && !slot.onCooldown);
  }

  // when slot size and min period are different, check if min period amount of slots are free
  const slotSizeDuration = moment.duration(slotSize);
  const minPeriodDuration = moment.duration(minPeriod);
  const numSlotsInMinPeriod = Math.floor(
    minPeriodDuration.asMinutes() / slotSizeDuration.asMinutes());

  for (let i = 0; i < slotsAfterNow.length; i += 1) {
    const slot = slotsAfterNow[i];
    if (!slot.reserved && !slot.onCooldown) {
      if (i + numSlotsInMinPeriod - 1 < slotsAfterNow.length) {
        const minPeriodSlots = [];
        for (let j = 0; j < numSlotsInMinPeriod; j += 1) {
          minPeriodSlots.push(slots[i + j]);
        }
        if (minPeriodSlots.every(
          minPeriodSlot => !minPeriodSlot.reserved && !minPeriodSlot.onCooldown)) {
          return true;
        }
      }
    }
  }
  return false;
}

/**
 * Finds the next free slot's date in the future.
 * If no free slot is found, returns an empty string.
 * @param {object} resource
 * @param {string} selectedDate e.g. 'YYYY-MM-DD'
 * @returns {string} 'YYYY-MM-DD' or '' if no free slot is found.
 */
export function findNextFreeSlotDate(resource, selectedDate) {
  const {
    minPeriod, slotSize, cooldown, openingHours, reservations, reservableAfter, reservableBefore
  } = resource;

  const startingDate = getStartingDate(selectedDate, reservableAfter);
  const futureOpeningHours = getFutureOpeningHrs(openingHours, startingDate, reservableBefore);
  const reservationsByDates = mapReservationsByDate(reservations);

  for (let i = 0; i < futureOpeningHours.length; i += 1) {
    const oh = futureOpeningHours[i];
    const reservationsInDate = reservationsByDates.get(oh.date) || { reservations: [] };

    if (hasFreeTimeInDay(
      oh.opens, oh.closes, reservationsInDate, minPeriod, slotSize, cooldown)
    ) {
      return oh.date;
    }
  }
  return '';
}

/**
 * Returns the time that is most in the future. Date options are
 * selectedDate, reservableAfter and today.
 * @param {string} selectedDate e.g. 'YYYY-MM-DD'
 * @param {string} reservableAfter timestamp
 * @returns {string} 'YYYY-MM-DD'
 */
export function getStartingDate(selectedDate, reservableAfter) {
  if (reservableAfter) {
    const dates = [moment(), moment(selectedDate), moment(reservableAfter)];
    return moment.max(dates).format('YYYY-MM-DD');
  }
  const dates = [moment(), moment(selectedDate)];
  return moment.max(dates).format('YYYY-MM-DD');
}

/**
 * Filters and returns opening hours that are same or after starting date, before
 * given reservableBefore and have opens and closes times.
 * @param {object[]} openingHrs
 * @param {string} startingDate e.g. 'YYYY-MM-DD'
 * @param {string} reservableBefore timestamp
 * @returns {object[]} filtered opening hours
 */
export function getFutureOpeningHrs(openingHrs, startingDate, reservableBefore) {
  if (reservableBefore) {
    return openingHrs.filter(oh => {
      const hasOpensCloses = oh.opens && oh.closes;
      const dateAfterStart = moment(oh.date).isSameOrAfter(startingDate, 'day');
      const dateBeforeReservableBefore = moment(oh.date).isBefore(reservableBefore, 'day');
      return hasOpensCloses && dateAfterStart && dateBeforeReservableBefore;
    });
  }
  return openingHrs.filter(oh => {
    const hasOpensCloses = oh.opens && oh.closes;
    const dateAfterStart = moment(oh.date).isSameOrAfter(startingDate, 'day');
    return hasOpensCloses && dateAfterStart;
  });
}

/**
 * Checks if there is free time to reserve within today + 2 days range
 * @param {object} resource
 * @param {string} selectedDate e.g. 'YYYY-MM-DD'
 * @returns {boolean} true if there is free time, false otherwise
 */
export function hasFreeTimesMobile(resource, selectedDate) {
  const {
    minPeriod, slotSize, cooldown, openingHours, reservations, reservableAfter, reservableBefore
  } = resource;

  const startIndex = openingHours.findIndex(oh => oh.date === selectedDate);

  if (startIndex === -1) {
    return false;
  }

  // mobile view shows current day + 2 days
  const nextOpeningHours = [
    openingHours[startIndex],
    openingHours[startIndex + 1],
    openingHours[startIndex + 2],
  ];

  if (nextOpeningHours.some(oh => !oh)) {
    return false;
  }

  // remove unreservable dates that are in the past and outside reservable after/before
  const nowMoment = moment();
  const filteredOpeningHours = filterByReservableAfterBefore(
    nextOpeningHours, reservableAfter, reservableBefore)
    .filter(oh => moment(oh.date).isSameOrAfter(nowMoment, 'day'));

  if (filteredOpeningHours.length < 1) {
    return false;
  }

  const reservationsByDates = mapReservationsByDate(reservations);

  for (let i = 0; i < filteredOpeningHours.length; i += 1) {
    const oh = filteredOpeningHours[i];
    const reservationsInDate = reservationsByDates.get(oh.date) || { reservations: [] };
    if (hasFreeTimeInDay(
      oh.opens, oh.closes, reservationsInDate, minPeriod, slotSize, cooldown)
    ) {
      return true;
    }
  }
  return false;
}

/**
 * Checks if there is free time to reserve within the whole week starting from selected date
 * or from today if selectedDate is in the past
 * @param {object} resource
 * @param {string} selectedDate e.g. 'YYYY-MM-DD'
 * @returns {boolean} true if there is free time, false otherwise
 */
export function hasFreeTimesDesktop(resource, selectedDate) {
  const {
    minPeriod, slotSize, cooldown, openingHours, reservations, reservableAfter, reservableBefore
  } = resource;

  // get all opening hours of the week that are not in the past
  const nowMoment = moment();
  const weekDates = getAllDatesOfWeek(selectedDate).filter(
    date => moment(date).isSameOrAfter(nowMoment, 'day'));

  if (weekDates.length < 1) {
    return false;
  }

  const startIndex = openingHours.findIndex(oh => oh.date === weekDates[0]);
  const nextOpeningHours = [openingHours[startIndex]];
  for (let i = 1; i < weekDates.length; i += 1) {
    nextOpeningHours.push(openingHours[startIndex + i]);
  }

  if (nextOpeningHours.some(oh => !oh)) {
    return false;
  }

  const filteredOpeningHours = filterByReservableAfterBefore(
    nextOpeningHours, reservableAfter, reservableBefore);

  const reservationsByDates = mapReservationsByDate(reservations);

  for (let i = 0; i < filteredOpeningHours.length; i += 1) {
    const oh = filteredOpeningHours[i];
    const reservationsInDate = reservationsByDates.get(oh.date) || { reservations: [] };
    if (hasFreeTimeInDay(
      oh.opens, oh.closes, reservationsInDate, minPeriod, slotSize, cooldown)
    ) {
      return true;
    }
  }
  return false;
}

/**
 * Returns all dates that are in the same week as selectedDate.
 * @param {string} selectedDate 'YYYY-MM-DD'
 * @returns {string[]} ['YYYY-MM-DD', 'YYYY-MM-DD', ...]}
 */
export function getAllDatesOfWeek(selectedDate) {
  const startDate = moment(selectedDate, 'YYYY-MM-DD').startOf('week');
  const endDate = startDate.clone().endOf('week');

  const result = [];

  const currentDate = startDate.clone();
  while (currentDate.isSameOrBefore(endDate)) {
    result.push(currentDate.format('YYYY-MM-DD'));
    currentDate.add(1, 'days');
  }

  return result;
}

/**
 * Fetches resource data starting from given date up to 4 months after given date.
 * @param {string} id the id of resource to fetch
 * @param {string} date 'YYYY-MM-DD'
 * @returns {object} resource object with data starting from given date
 * up to 4 months after given date
 */
export async function fetchResource(id, date) {
  const start = moment(date)
    .subtract(0, 'M')
    .startOf('month')
    .format();
  const end = moment(date)
    .add(4, 'M')
    .endOf('month')
    .format();

  const apiUrl = buildAPIUrl(`resource/${id}`, { start, end });
  const response = await fetch(apiUrl, {
    method: 'GET',
    headers: constants.REQUIRED_API_HEADERS,
  });
  if (!response.ok) {
    return null;
  }
  const data = await response.json();
  return camelizeKeys(data);
}

/**
 * Handles creating a not-found notification for free times search
 * @param {function} addNotification
 * @param {function} t
 */
export function createNotFoundNotification(addNotification, t) {
  addNotification({
    message: t('ResourceFreeTime.notificationNotFound'),
    type: 'info',
    timeOut: 10000,
  });
}

/**
 * Handles creating a found notification for free times search
 * @param {function} addNotification
 * @param {function} t
 * @param {string} date e.g 'YYYY-MM-DD'
 */
export function createFoundNotification(addNotification, t, date) {
  const formattedDate = moment(date).format('dddd D.M');
  addNotification({
    message: `${t('ResourceFreeTime.notificationFound')} ${formattedDate}`,
    type: 'info',
    timeOut: 10000,
  });
}

/**
 * Formats given date string to Date obj
 * @param {string} date 'YYYY-MM-DD'
 * @returns {object} Date obj
 */
export function formatToDateObject(date) {
  return moment(date).utc(true).toDate();
}

/**
 * Filters opening hours by reservableAfter and reservableBefore.
 * @param {object[]} openingHrs
 * @param {string} reservableAfter timestamp
 * @param {string} reservableBefore timestamp
 * @returns {object[]} filtered opening hours. If reservableAfter and reservableBefore are
 * not given, returns the same opening hours.
 */
export function filterByReservableAfterBefore(openingHrs, reservableAfter, reservableBefore) {
  if (!reservableAfter && !reservableBefore) {
    return openingHrs;
  }

  return openingHrs.filter(oh => {
    if (!oh || !oh.opens) {
      return false;
    }
    const opensMoment = moment(oh.opens);
    if (reservableAfter && !reservableBefore) {
      return opensMoment.isSameOrAfter(reservableAfter, 'day');
    }
    if (!reservableAfter && reservableBefore) {
      return opensMoment.isBefore(reservableBefore, 'day');
    }
    return opensMoment.isSameOrAfter(reservableAfter, 'day')
      && opensMoment.isBefore(reservableBefore, 'day');
  });
}
