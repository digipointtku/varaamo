import moment from 'moment';
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import Loader from 'react-loader';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import { fetchFavoritedResources } from 'actions/resourceActions';
import { fetchUnits } from 'actions/unitActions';
import {
  changeAdminResourcesPageDate,
  selectAdminResourceType,
  openConfirmReservationModal,
  unselectAdminResourceType,
} from 'actions/uiActions';
import { injectT } from 'i18n';
import PageWrapper from 'pages/PageWrapper';
import AvailabilityView from 'shared/availability-view';
import ResourceTypeFilter from 'shared/resource-type-filter';
import ReservationSuccessModal from 'shared/modals/reservation-success';
import ReservationConfirmationContainer from 'shared/reservation-confirmation';
import recurringReservations from 'state/recurringReservations';
import adminResourcesPageSelector from './adminResourcesPageSelector';

class UnconnectedAdminResourcesPage extends Component {
  constructor(props) {
    super(props);
    this.state = { selection: null, showExternalResources: false };
    this.fetchResources = this.fetchResources.bind(this);
    this.handleSelect = this.handleSelect.bind(this);
  }

  componentDidMount() {
    const interval = 10 * 60 * 1000;
    this.fetchResources();
    this.updateResourcesTimer = window.setInterval(this.fetchResources, interval);
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.date !== this.props.date || nextProps.location !== this.props.location) {
      this.fetchResources(nextProps.date);
    }
  }

  componentDidUpdate(prevProps) {
    if (!this.props.areResourcesInSync && prevProps.areResourcesInSync) {
      //  refetch to sync if current resources went out of sync
      this.fetchResources(this.props.date);
    }
  }

  componentWillUnmount() {
    this.props.actions.changeAdminResourcesPageDate(null);
    window.clearInterval(this.updateResourcesTimer);
  }

  fetchResources(date = this.props.date) {
    const { isSuperUser } = this.props;
    this.props.actions.fetchUnits();
    this.props.actions.fetchFavoritedResources(moment(date), 'adminResourcesPage', isSuperUser);
  }

  handleSelect(selection) {
    this.setState({ selection });
    this.props.actions.changeRecurringBaseTime(selection);
    this.props.actions.openConfirmReservationModal();
  }

  toggleShowExternalResources = () => {
    this.setState(prevState => ({ showExternalResources: !prevState.showExternalResources }));
  }

  render() {
    const {
      selectedResourceTypes,
      isAdmin,
      isLoggedin,
      isFetchingResources,
      resources: rawResources,
      t,
      resourceTypes,
      externalResources,
    } = this.props;
    const { showExternalResources } = this.state;
    let resources = rawResources;
    if (showExternalResources) {
      resources = resources.concat(externalResources.map(res => res.id));
    }
    return (
      <PageWrapper className="admin-resources-page" fluid title={(t('AdminResourcesPage.adminTitle'))}>
        {isAdmin && <h1>{t('AdminResourcesPage.adminTitle')}</h1>}
        {!isAdmin && <h1>{t('AdminResourcesPage.favoriteTitle')}</h1>}
        <Loader loaded={Boolean(!isFetchingResources || resources.length)}>
          {isLoggedin && (
            <div>
              <ResourceTypeFilter
                externalResources={externalResources}
                onSelectResourceType={this.props.actions.selectAdminResourceType}
                onUnselectResourceType={this.props.actions.unselectAdminResourceType}
                resourceTypes={resourceTypes}
                selectedResourceTypes={selectedResourceTypes}
                showExternalResources={showExternalResources}
                toggleShowExternalResources={this.toggleShowExternalResources}
              />
              <AvailabilityView
                date={this.props.date}
                groups={[{ name: '', resources }]}
                isAdmin={isAdmin}
                onDateChange={this.props.actions.changeAdminResourcesPageDate}
                onSelect={this.handleSelect}
              />
            </div>
          )}
          {isLoggedin && !resources.length && <p>{t('AdminResourcesPage.noResourcesMessage')}</p>}
        </Loader>
        {this.state.selection
          && (
          <ReservationConfirmationContainer
            params={{ id: this.state.selection.resourceId }}
            selectedReservations={[{
              begin: this.state.selection.begin,
              end: this.state.selection.end,
              resource: this.state.selection.resourceId,
            }]}
          />
          )}
        <ReservationSuccessModal />
      </PageWrapper>
    );
  }
}

UnconnectedAdminResourcesPage.propTypes = {
  actions: PropTypes.object.isRequired,
  areResourcesInSync: PropTypes.bool.isRequired,
  date: PropTypes.string.isRequired,
  selectedResourceTypes: PropTypes.arrayOf(PropTypes.string).isRequired,
  isAdmin: PropTypes.bool.isRequired,
  isSuperUser: PropTypes.bool.isRequired,
  isLoggedin: PropTypes.bool.isRequired,
  isFetchingResources: PropTypes.bool.isRequired,
  location: PropTypes.object.isRequired,
  resources: PropTypes.array.isRequired,
  t: PropTypes.func.isRequired,
  resourceTypes: PropTypes.array.isRequired,
  externalResources: PropTypes.array,
};

UnconnectedAdminResourcesPage = injectT(UnconnectedAdminResourcesPage);  // eslint-disable-line

function mapDispatchToProps(dispatch) {
  const actionCreators = {
    changeAdminResourcesPageDate,
    changeRecurringBaseTime: recurringReservations.changeBaseTime,
    fetchFavoritedResources,
    fetchUnits,
    selectAdminResourceType,
    openConfirmReservationModal,
    unselectAdminResourceType,
  };

  return { actions: bindActionCreators(actionCreators, dispatch) };
}

export { UnconnectedAdminResourcesPage };
export default (
  connect(adminResourcesPageSelector, mapDispatchToProps)(injectT(UnconnectedAdminResourcesPage))
);
