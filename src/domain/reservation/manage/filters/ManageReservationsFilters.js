import React from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import omit from 'lodash/omit';
import isEmpty from 'lodash/isEmpty';
import get from 'lodash/get';
import { injectIntl, intlShape } from 'react-intl';
import {
  Row,
  Col,
  Grid,
  Button,
} from 'react-bootstrap';

import injectT from '../../../../../app/i18n/injectT';
import TextField from '../../../../common/form/fields/TextField';
import ButtonGroupField from '../../../../common/form/fields/ButtonGroupField';
import DateField from '../../../../common/form/fields/DateField';
import SelectField from '../../../../common/form/fields/SelectField';
import iconTimes from '../../../search/filters/images/times.svg';
import * as dataUtils from '../../../../common/data/utils';
import constants from '../../../../../app/constants/AppConstants';
import { RESERVATION_STATE } from '../../../../constants/ReservationState';
import { RESERVATION_SHOWONLY_FILTERS } from '../../constants';

class ManageReservationsFilters extends React.Component {
  static propTypes = {
    t: PropTypes.func,
    filters: PropTypes.object,
    units: PropTypes.array,
    onSearchChange: PropTypes.func.isRequired,
    onShowOnlyFiltersChange: PropTypes.func.isRequired,
    showOnlyFilters: PropTypes.array,
    intl: intlShape,
  };

  onFilterChange = (filterName, filterValue) => {
    const {
      filters,
      onSearchChange,
    } = this.props;

    // Ensure that start and end are not empty. Otherwise we'll get an error from respa instead of search results.
    if (filterName === 'start' && !filters.end) {
      filters.end = filterValue;
    }
    if (filterName === 'end' && !filters.start) {
      filters.start = filterValue;
    }

    const newFilters = {
      ...omit(filters, filterName),
    };

    if (filterValue && !isEmpty(filterValue)) {
      newFilters[filterName] = filterValue;
    }

    // We want to search for events that happen until the end of the day.
    if (newFilters.end) {
      newFilters.end = moment(newFilters.end).add(1, 'd').toISOString();
    }
    // Let's query respa with full ISO dates to avoid weird bugs.
    if (newFilters.start) {
      newFilters.start = moment(newFilters.start).toISOString();
    }

    onSearchChange(omit(newFilters, 'page'));
  };

  onReset = () => {
    const { onSearchChange, onShowOnlyFiltersChange } = this.props;

    onShowOnlyFiltersChange();
    // Reset show only filters by giving empty selection

    onSearchChange({});
  };

  hasFilters = () => {
    const { filters, showOnlyFilters } = this.props;

    return !isEmpty(omit(filters, 'page')) || !isEmpty(showOnlyFilters);
  };

  getStatusOptions = () => {
    const { t } = this.props;

    return [
      { value: RESERVATION_STATE.CONFIRMED, label: t('Reservation.stateLabelConfirmed') },
      { value: RESERVATION_STATE.CANCELLED, label: t('Reservation.stateLabelCancelled') },
      { value: RESERVATION_STATE.DENIED, label: t('Reservation.stateLabelDenied') },
      { value: RESERVATION_STATE.REQUESTED, label: t('Reservation.stateLabelRequested') },
    ];
  };

  getShowOnlyOptions = () => {
    const { t } = this.props;

    return [
      {
        value:
        RESERVATION_SHOWONLY_FILTERS.FAVORITE,
        label: t('ManageReservationsFilters.showOnly.favoriteButtonLabel')
      },
      {
        value:
        RESERVATION_SHOWONLY_FILTERS.CAN_MODIFY,
        label: t('ManageReservationsFilters.showOnly.canModifyButtonLabel')
      },
    ];
  };

  render() {
    const {
      t,
      filters,
      units,
      intl,
      onShowOnlyFiltersChange,
      showOnlyFilters
    } = this.props;

    const state = get(filters, 'state', null);
    const startDate = get(filters, 'start', null);
    const endDate = get(filters, 'end', null);
    const locale = intl.locale;

    return (
      <div className="app-ManageReservationsFilters">
        <Grid>
          <Row>
            <Col md={3}>
              <ButtonGroupField
                id="stateField"
                label={t('ManageReservationsFilters.statusLabel')}
                onChange={value => this.onFilterChange('state', value)}
                options={this.getStatusOptions()}
                type="checkbox"
                value={state ? state.split(',') : null}
              />
            </Col>
            <Col md={5}>
              <div className="app-ManageReservationsFilters__datePickers">
                <DateField
                  id="startDateField"
                  label={t('ManageReservationsFilters.startDateLabel')}
                  onChange={(value) => {
                    this.onFilterChange('start', moment(value).format(constants.DATE_FORMAT));
                  }}
                  placeholder={t('ManageReservationsFilters.startDatePlaceholder')}
                  value={startDate ? moment(startDate).toDate() : null}
                />
                <div className="separator">-</div>
                <DateField
                  end
                  id="EndDateField"
                  label={t('ManageReservationsFilters.endDateLabel')}
                  onChange={(value) => {
                    this.onFilterChange('end', moment(value).format(constants.DATE_FORMAT));
                  }}
                  placeholder={t('ManageReservationsFilters.endDatePlaceholder')}
                  value={endDate ? moment(endDate).toDate() : null}
                />
              </div>
            </Col>
            <Col md={4}>
              <TextField
                id="searchField"
                label={t('ManageReservationsFilters.searchLabel')}
                onChange={event => this.onFilterChange('reserver_info_search', event.target.value)}
                placeholder={t('ManageReservationsFilters.searchPlaceholder')}
                value={get(filters, 'reserver_info_search', '')}
              />
            </Col>
          </Row>

          <Row>
            <Col md={3}>
              <SelectField
                id="unitField"
                label={t('ManageReservationsFilters.unitLabel')}
                onChange={item => this.onFilterChange('unit', item.value)}
                options={units.map(unit => ({
                  value: unit.id,
                  label: dataUtils.getLocalizedFieldValue(unit.name, locale)
                }))}
                value={get(filters, 'unit', null)}
              />
            </Col>
            <Col md={5}>
              <ButtonGroupField
                id="showOnlyField"
                label={t('ManageReservationsFilters.showOnly.title')}
                onChange={value => onShowOnlyFiltersChange(value)}
                options={this.getShowOnlyOptions()}
                type="checkbox"
                value={showOnlyFilters}
              />
            </Col>
            <Col md={4}>
              {this.hasFilters() && (
                <Button
                  bsStyle="link"
                  className="app-ManageReservationsFilters__resetButton"
                  key="reset-button"
                  onClick={() => this.onReset()}
                >
                  <img alt="" src={iconTimes} />
                  {t('ManageReservationsFilters.resetButton')}
                </Button>
              )}
            </Col>
          </Row>
        </Grid>
      </div>
    );
  }
}

export const UnwrappedManageReservationsFilters = injectT(ManageReservationsFilters);
export default injectIntl(UnwrappedManageReservationsFilters);
