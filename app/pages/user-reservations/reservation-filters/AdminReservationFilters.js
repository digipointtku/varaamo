
import map from 'lodash/map';
import sortBy from 'lodash/sortBy';
import PropTypes from 'prop-types';
import React, { Component } from 'react';

import constants from 'constants/AppConstants';
import SelectControl from 'pages/search/controls/SelectControl';
import { injectT } from 'i18n';

class AdminReservationFilters extends Component {
  constructor(props) {
    super(props);
    this.handleChange = this.handleChange.bind(this);
  }

  handleChange({ value }) {
    if (value) {
      this.props.onFiltersChange({ state: value });
    }
  }

  render() {
    const { filters, t } = this.props;
    const stateOptions = [
      {
        label: t('common.optionsAllLabel'),
        value: 'all',
      },
      ...sortBy(
        map(
          constants.RESERVATION_STATE_LABELS,
          (value, key) => ({
            label: t(value.labelTextId),
            value: key,
          })
        ),
        'label'
      ),
    ];

    return (
      <div className="reservation-filters">
        <SelectControl
          className="reservation-state-select"
          id="reservation"
          isClearable={false}
          isSearchable={false}
          label={t('UserReservationsPage.preliminaryReservationsHeader')}
          name="reservation-state-select"
          onChange={this.handleChange}
          options={stateOptions}
          value={filters.state}
        />
      </div>
    );
  }
}

AdminReservationFilters.propTypes = {
  filters: PropTypes.object.isRequired,
  onFiltersChange: PropTypes.func.isRequired,
  t: PropTypes.func.isRequired,
};

export default injectT(AdminReservationFilters);
