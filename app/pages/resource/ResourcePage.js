import classNames from 'classnames';
import isEmpty from 'lodash/isEmpty';
import findIndex from 'lodash/findIndex';
import moment from 'moment';
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import Loader from 'react-loader';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import Col from 'react-bootstrap/lib/Col';
import Panel from 'react-bootstrap/lib/Panel';
import Lightbox from 'lightbox-react';
import 'lightbox-react/style.css';

import { fetchResource } from 'actions/resourceActions';
import { clearReservations, toggleResourceMap } from 'actions/uiActions';
import PageWrapper from 'pages/PageWrapper';
import NotFoundPage from 'pages/not-found/NotFoundPage';
import ResourceCalendar from 'shared/resource-calendar';
import ResourceMap from 'shared/resource-map';
import { injectT } from 'i18n';
import {
  getMaxPeriodText, getResourcePageUrl, getMinPeriodText, getEquipment
} from 'utils/resourceUtils';
import ReservationCalendar from './reservation-calendar';
import ResourceHeader from './resource-header';
import ResourceInfo from './resource-info';
import ResourceMapInfo from './resource-map-info';
import resourcePageSelector from './resourcePageSelector';
import {
  createResourceOutlookCalendarLink,
  removeResourceOutlookCalendarLink,
  fetchResourceOutlookCalendarLinks,
} from 'resource-outlook-linker/actions';

class UnconnectedResourcePage extends Component {
  constructor(props) {
    super(props);

    this.state = {
      photoIndex: 0,
      isOpen: false,
    };

    this.fetchResource = this.fetchResource.bind(this);
    this.handleBackButton = this.handleBackButton.bind(this);
    this.createResourceOutlookCalendarLink = this.createResourceOutlookCalendarLink.bind(this);
    this.removeResourceOutlookCalendarLink = this.removeResourceOutlookCalendarLink.bind(this);
    this.fetchResourceOutlookCalendarLinks = this.fetchResourceOutlookCalendarLinks.bind(this);
  }

  componentDidMount() {
    this.props.actions.clearReservations();
    this.fetchResource();
    this.fetchResourceOutlookCalendarLinks();
    window.scrollTo(0, 0);
  }

  componentWillUpdate(nextProps) {
    if (nextProps.date !== this.props.date || nextProps.isLoggedIn !== this.props.isLoggedIn) {
      this.fetchResource(nextProps.date);
    }
  }

  getImageThumbnailUrl(image) {
    const width = 700;
    const height = 420;

    return `${image.url}?dim=${width}x${height}`;
  }

  disableDays = (day) => {
    const { resource: { reservableAfter } } = this.props;
    const beforeDate = reservableAfter || moment();
    return moment(day).isBefore(beforeDate);
  }

  handleDateChange = (newDate) => {
    const { resource, history } = this.props;
    const day = newDate.toISOString().substring(0, 10);
    history.replace(getResourcePageUrl(resource, day));
  };

  handleBackButton() {
    this.props.history.goBack();
  }

  handleImageClick(photoIndex) {
    this.setState(() => ({ isOpen: true, photoIndex }));
  }

  orderImages(images) {
    return [].concat(
      images.filter(image => image.type === 'main'),
      images.filter(image => image.type !== 'main')
    );
  }

  renderImage = (image, index, { mainImageMobileVisibility = false }) => {
    const isMainImage = image.type === 'main';
    const className = classNames('app-ResourceInfo__image-wrapper', {
      'app-ResourceInfo__image-wrapper--main-image': isMainImage,
      'app-ResourceInfo__image-wrapper--mobile-main-image':
        isMainImage && mainImageMobileVisibility,
    });

    return (
      <div className={className} key={image.url}>
        <button
          className="app-ResourceInfo__image-button"
          onClick={() => this.handleImageClick(index)}
          type="button"
        >
          <img
            alt={image.caption}
            className="app-ResourceInfo__image"
            src={this.getImageThumbnailUrl(image)}
          />
        </button>
      </div>
    );
  };

  fetchResourceOutlookCalendarLinks() {
    return this.props.actions.fetchResourceOutlookCalendarLinks();
  }

  createResourceOutlookCalendarLink() {
    return this.props.actions.createResourceOutlookCalendarLink(this.props.resource.id);
  }

  removeResourceOutlookCalendarLink() {
    const link = this.props.calendarLink;
    return this.props.actions.removeResourceOutlookCalendarLink(link.resource, link.id);
  }

  fetchResource(date = this.props.date) {
    const { actions, id } = this.props;
    const start = moment(date)
      .subtract(2, 'M')
      .startOf('month')
      .format();
    const end = moment(date)
      .add(2, 'M')
      .endOf('month')
      .format();

    actions.fetchResource(id, { start, end });
  }

  render() {
    const {
      actions,
      date,
      isFetchingResource,
      isLoggedIn,
      location,
      match,
      resource,
      showMap,
      t,
      unit,
      history,
      contrast,
      currentLanguage,
    } = this.props;
    const { params } = match;
    const { isOpen, photoIndex } = this.state;

    if (isEmpty(resource) && !isFetchingResource) {
      return <NotFoundPage />;
    }

    const maxPeriodText = getMaxPeriodText(t, resource);
    const minPeriodText = getMinPeriodText(t, resource);
    const images = this.orderImages(resource.images || []);
    const equipment = getEquipment(resource);

    const mainImageIndex = findIndex(images, image => image.type === 'main');
    const mainImage = mainImageIndex != null ? images[mainImageIndex] : null;
    const showBackButton = !!location.state && !!location.state.fromSearchResults;
    const showOutlookCalendarLinkButton = this.props.resource.userPermissions
      && (
        this.props.resource.userPermissions.isManager
        || this.props.resource.userPermissions.isAdmin
      );

    return (
      <div className="app-ResourcePage">
        <Loader loaded={!isEmpty(resource)}>
          <ResourceHeader
            contrast={contrast}
            isLoggedIn={isLoggedIn}
            onBackClick={this.handleBackButton}
            onMapClick={actions.toggleResourceMap}
            onOutlookCalendarLinkCreateClick={this.createResourceOutlookCalendarLink}
            onOutlookCalendarLinkRemoveClick={this.removeResourceOutlookCalendarLink}
            outlookLinkExists={!!this.props.calendarLink}
            resource={resource}
            showBackButton={showBackButton}
            showMap={showMap}
            showOutlookCalendarLinkButton={showOutlookCalendarLinkButton}
            unit={unit}
          />
          {showMap && unit && <ResourceMapInfo currentLanguage={currentLanguage} unit={unit} />}
          {showMap && (
            <ResourceMap
              location={location}
              resourceIds={[resource.id]}
              selectedUnitId={unit ? unit.id : null}
              showMap={showMap}
            />
          )}
          {!showMap && (
            <PageWrapper title={resource.name || ''} transparent>
              <div>
                <Col className="app-ResourcePage__content" lg={9} md={9} xs={12}>
                  {mainImage
                    && this.renderImage(mainImage, mainImageIndex, {
                      mainImageMobileVisibility: true,
                    })}
                  <ResourceInfo
                    currentLanguage={currentLanguage}
                    equipment={equipment}
                    isLoggedIn={isLoggedIn}
                    resource={resource}
                    unit={unit}
                  />

                  <Panel defaultExpanded header={t('ResourceInfo.reserveTitle')} role="region">
                    <Panel.Heading>
                      <Panel.Title componentClass="h2">
                        {t('ResourceCalendar.header')}
                      </Panel.Title>
                    </Panel.Heading>
                    {resource.externalReservationUrl && (
                    <form action={resource.externalReservationUrl}>
                      <input
                        className="btn btn-primary"
                        type="submit"
                        value="Siirry ulkoiseen ajanvarauskalenteriin"
                      />
                    </form>
                    )}
                    {!resource.externalReservationUrl && (
                    <div>
                      {/* Show reservation min period text */}
                      {resource.minPeriod && (
                      <div className="app-ResourcePage__content-min-period">
                        <p>{`${t('ReservationInfo.reservationMinLength')} ${minPeriodText}`}</p>
                      </div>
                      )}
                      {/* Show reservation max period text */}
                      {resource.maxPeriod && (
                      <div className="app-ResourcePage__content-max-period">
                        <p>{`${t('ReservationInfo.reservationMaxLength')} ${maxPeriodText}`}</p>
                      </div>
                      )}

                      <ResourceCalendar
                        disableDays={this.disableDays}
                        onDateChange={this.handleDateChange}
                        resourceId={resource.id}
                        selectedDate={date}
                      />
                      <ReservationCalendar
                        history={history}
                        location={location}
                        params={params}
                      />
                    </div>
                    )}

                  </Panel>
                </Col>
                <Col className="app-ResourceInfo__images" lg={3} md={3} xs={12}>
                  <section>
                    {images.map(this.renderImage)}
                  </section>
                </Col>
              </div>
            </PageWrapper>
          )}
        </Loader>

        <div>
          {isOpen && (
            <Lightbox
              imageCaption={images[photoIndex].caption}
              mainSrc={images[photoIndex].url}
              nextSrc={images[(photoIndex + 1) % images.length].url}
              onCloseRequest={() => this.setState(() => ({ isOpen: false }))}
              onMoveNextRequest={() => this.setState(state => ({
                photoIndex: (state.photoIndex + 1) % images.length,
              }))
              }
              onMovePrevRequest={() => this.setState(state => ({
                photoIndex: (state.photoIndex + (images.length - 1)) % images.length,
              }))
              }
              prevSrc={images[(photoIndex + (images.length - 1)) % images.length].url}
              reactModalStyle={{ overlay: { zIndex: 2000 } }}
            />
          )}
        </div>
      </div>
    );
  }
}

UnconnectedResourcePage.propTypes = {
  actions: PropTypes.object.isRequired,
  date: PropTypes.string.isRequired,
  id: PropTypes.string.isRequired,
  isFetchingResource: PropTypes.bool.isRequired,
  isLoggedIn: PropTypes.bool.isRequired,
  location: PropTypes.object.isRequired,
  match: PropTypes.object.isRequired,
  resource: PropTypes.object.isRequired,
  showMap: PropTypes.bool.isRequired,
  t: PropTypes.func.isRequired,
  unit: PropTypes.object.isRequired,
  history: PropTypes.object.isRequired,
  contrast: PropTypes.string,
  currentLanguage: PropTypes.string,
  calendarLink: PropTypes.object,
};
UnconnectedResourcePage = injectT(UnconnectedResourcePage); // eslint-disable-line

function mapDispatchToProps(dispatch) {
  const actionCreators = {
    clearReservations,
    fetchResource,
    toggleResourceMap,
    fetchResourceOutlookCalendarLinks,
    createResourceOutlookCalendarLink,
    removeResourceOutlookCalendarLink,
  };

  return { actions: bindActionCreators(actionCreators, dispatch) };
}

export { UnconnectedResourcePage };
export default connect(
  resourcePageSelector,
  mapDispatchToProps
)(UnconnectedResourcePage);
