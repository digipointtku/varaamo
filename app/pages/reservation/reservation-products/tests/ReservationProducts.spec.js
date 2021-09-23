import React from 'react';
import Immutable from 'seamless-immutable';
import {
  Button, Col, Row, Well
} from 'react-bootstrap';
import Loader from 'react-loader';
import { isEmpty } from 'lodash';
import moment from 'moment';

import { shallowWithIntl } from 'utils/testUtils';
import OrderLine from 'utils/fixtures/OrderLine';
import Product from 'utils/fixtures/Product';
import Resource from 'utils/fixtures/Resource';
import Unit from 'utils/fixtures/Unit';
import ReservationProducts from '../ReservationProducts';
import MandatoryProducts from '../mandatory-products/MandatoryProducts';
import ExtraProducts from '../extra-products/ExtraProducts';
import ProductsSummary from '../ProductsSummary';

describe('reservation-products/ProductsSummary', () => {
  const resource = Immutable(Resource.build());

  const defaultProps = {
    changeProductQuantity: () => {},
    currentLanguage: 'fi',
    isEditing: false,
    onBack: () => {},
    onCancel: () => {},
    onConfirm: () => {},
    order: {
      begin: '2021-09-24T11:00:00+03:00',
      end: '2021-09-24T11:30:00+03:00',
      order_lines: [OrderLine.build({ product: Product.build(), quantity: 1 })],
      price: '5.00'
    },
    resource,
    selectedTime: {
      begin: '2021-09-24T07:00:00.000Z',
      end: '2021-09-24T07:30:00.000Z',
    },
    unit: Unit.build()
  };

  function getWrapper(extraProps) {
    return shallowWithIntl(<ReservationProducts {...defaultProps} {...extraProps} />);
  }

  describe('renders', () => {
    test('wrapping div', () => {
      const div = getWrapper().find('div.app-ReservationProducts');
      expect(div).toHaveLength(1);
    });

    test('heading', () => {
      const heading = getWrapper().find('h2#reservation-products-page-heading');
      expect(heading).toHaveLength(1);
      expect(heading.prop('className')).toBe('visually-hidden');
      expect(heading.text()).toBe('ReservationPhase.productsTitle');
    });

    const productsSection = getWrapper().find('#reservation-products-page-main-row');
    test('products main Row', () => {
      expect(productsSection).toHaveLength(1);
    });

    const cols = productsSection.find(Col);
    test('correct amount of Cols', () => {
      expect(cols).toHaveLength(6);
    });

    test('products section first Col', () => {
      const col = cols.at(0);
      expect(col).toHaveLength(1);
      expect(col.prop('lg')).toBe(8);
      expect(col.prop('sm')).toBe(12);
    });

    describe('when order has an error', () => {
      test('error message', () => {
        const message = getWrapper({ order: { error: true } }).find('#products-error-message');
        expect(message).toHaveLength(1);
        expect(message.text()).toBe('Notifications.errorMessage');
      });
    });

    describe('when order has no error', () => {
      test('Loader', () => {
        const loader = getWrapper().find(Loader);
        expect(loader).toHaveLength(1);
        expect(loader.prop('loaded')).toBe(!defaultProps.order.loadingData);
      });

      test('MandatoryProducts', () => {
        const mandatoryProducts = getWrapper().find(MandatoryProducts);
        expect(mandatoryProducts).toHaveLength(1);
        expect(mandatoryProducts.prop('currentLanguage')).toBe(defaultProps.currentLanguage);
        expect(mandatoryProducts.prop('orderLines')).toBe(defaultProps.order.order_lines);
      });

      test('ExtraProducts', () => {
        const extraProducts = getWrapper().find(ExtraProducts);
        expect(extraProducts).toHaveLength(1);
        expect(extraProducts.prop('changeProductQuantity')).toBe(defaultProps.changeProductQuantity);
        expect(extraProducts.prop('currentLanguage')).toBe(defaultProps.currentLanguage);
        expect(extraProducts.prop('orderLines')).toBe(defaultProps.order.order_lines);
      });

      test('ProductsSummary', () => {
        const productsSummary = getWrapper().find(ProductsSummary);
        expect(productsSummary).toHaveLength(1);
        expect(productsSummary.prop('order')).toBe(defaultProps.order);
      });
    });

    describe('form controls', () => {
      test('wrapping div', () => {
        const formControls = getWrapper().find('div.form-controls');
        expect(formControls).toHaveLength(1);
      });

      describe('when editing reservation', () => {
        const formControls = getWrapper({ isEditing: true }).find('div.form-controls');
        const buttons = formControls.find(Button);
        test('correct amount of Buttons', () => {
          expect(buttons).toHaveLength(3);
        });

        test('first Button', () => {
          const button = buttons.at(0);
          expect(button.prop('bsStyle')).toBe('warning');
          expect(button.prop('onClick')).toBe(defaultProps.onCancel);
          expect(button.prop('children')).toBe('ReservationInformationForm.cancelEdit');
        });

        test('2nd Button', () => {
          const button = buttons.at(1);
          expect(button.prop('bsStyle')).toBe('default');
          expect(button.prop('onClick')).toBe(defaultProps.onBack);
          expect(button.prop('children')).toBe('common.previous');
        });

        test('3rd Button', () => {
          const button = buttons.at(2);
          expect(button.prop('bsStyle')).toBe('primary');
          expect(button.prop('className')).toBe('next_Button');
          expect(button.prop('disabled')).toBe(isEmpty(defaultProps.selectedTime) || !!defaultProps.order.error);
          expect(button.prop('onClick')).toBe(defaultProps.onConfirm);
          expect(button.prop('children')).toBe('common.continue');
        });
      });

      describe('when not editing reservation', () => {
        const formControls = getWrapper({ isEditing: false }).find('div.form-controls');
        const buttons = formControls.find(Button);
        test('correct amount of Buttons', () => {
          expect(buttons).toHaveLength(2);
        });

        test('first Button', () => {
          const button = buttons.at(0);
          expect(button.prop('bsStyle')).toBe('warning');
          expect(button.prop('onClick')).toBe(defaultProps.onCancel);
          expect(button.prop('children')).toBe('common.cancel');
        });

        test('2nd Button', () => {
          const button = buttons.at(1);
          expect(button.prop('bsStyle')).toBe('primary');
          expect(button.prop('className')).toBe('next_Button');
          expect(button.prop('disabled')).toBe(isEmpty(defaultProps.selectedTime) || !!defaultProps.order.error);
          expect(button.prop('onClick')).toBe(defaultProps.onConfirm);
          expect(button.prop('children')).toBe('common.continue');
        });
      });
    });

    describe('reservation details', () => {
      test('container Col', () => {
        const col = getWrapper().find(Col).at(1);
        expect(col.prop('lg')).toBe(4);
        expect(col.prop('sm')).toBe(12);
      });

      const details = getWrapper().find(Well);
      test('details Well', () => {
        expect(details).toHaveLength(1);
      });

      test('heading', () => {
        const heading = details.find('h2');
        expect(heading).toHaveLength(1);
        expect(heading.text()).toBe('ReservationPage.detailsTitle');
      });

      const detailRows = details.find(Row);
      test('correct amount of sub Rows', () => {
        expect(detailRows).toHaveLength(2);
      });

      describe('first sub row', () => {
        const firstRow = detailRows.at(0);
        test('label Col', () => {
          const label = firstRow.find('.app-ReservationDetails__label');
          expect(label).toHaveLength(1);
          expect(label.prop('md')).toBe(4);
          expect(label.prop('children')).toBe('common.resourceLabel');
        });

        test('value Col', () => {
          const label = firstRow.find('.app-ReservationDetails__value');
          expect(label).toHaveLength(1);
          expect(label.prop('md')).toBe(8);
          expect(label.prop('children')).toStrictEqual([defaultProps.resource.name, <br />, defaultProps.unit.name]);
        });
      });

      describe('second sub row', () => {
        const firstRow = detailRows.at(1);
        test('label Col', () => {
          const label = firstRow.find('.app-ReservationDetails__label');
          expect(label).toHaveLength(1);
          expect(label.prop('md')).toBe(4);
          expect(label.prop('children')).toBe('ReservationPage.detailsTime');
        });

        test('value Col', () => {
          const { selectedTime } = defaultProps;
          const beginText = moment(selectedTime.begin).format('D.M.YYYY HH:mm');
          const endText = moment(selectedTime.end).format('HH:mm');
          const hours = moment(selectedTime.end).diff(selectedTime.begin, 'minutes') / 60;
          const label = firstRow.find('.app-ReservationDetails__value');
          expect(label).toHaveLength(1);
          expect(label.prop('md')).toBe(8);
          expect(label.prop('children')).toBe(`${beginText}–${endText} (${hours} h)`);
        });
      });
    });
  });
});
