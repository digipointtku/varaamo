import React from 'react';

import { shallowWithIntl } from 'utils/testUtils';
import ReservationPhases from './ReservationPhases';
import ReservationPhase from './ReservationPhase';

describe('pages/reservation/reservation-phases/ReservationPhases', () => {
  const defaultProps = {
    currentPhase: 'information',
    isEditing: false,
    hasProducts: false,
    needManualConfirmation: false,
  };

  function getWrapper(extraProps) {
    return shallowWithIntl(<ReservationPhases {...defaultProps} {...extraProps} />);
  }

  test('checks aria-hidden is true', () => {
    const hidden = getWrapper().find('.app-ReservationPage__phases');
    expect(hidden).toHaveLength(1);
    expect(hidden.prop('aria-hidden')).toBe('true');
  });

  describe('when currentPhase is information', () => {
    test('renders two phases with correct props when isEditing false', () => {
      const phases = getWrapper({
        currentPhase: 'information',
        isEditing: false,
      }).find(ReservationPhase);

      expect(phases).toHaveLength(2);
      expect(phases.at(0).prop('cols')).toBe(6);
      expect(phases.at(0).prop('index')).toBe(1);
      expect(phases.at(0).prop('isActive')).toBe(true);
      expect(phases.at(0).prop('isCompleted')).toBe(false);
      expect(phases.at(0).prop('title')).toBe('ReservationPhase.informationTitle');
      expect(phases.at(1).prop('cols')).toBe(6);
      expect(phases.at(1).prop('index')).toBe(2);
      expect(phases.at(1).prop('isActive')).toBe(false);
      expect(phases.at(1).prop('isCompleted')).toBe(false);
      expect(phases.at(1).prop('title')).toBe('ReservationPhase.confirmationTitle');
    });

    test('renders three phases with correct props when isEditing true', () => {
      const phases = getWrapper({
        currentPhase: 'information',
        isEditing: true,
      }).find(ReservationPhase);

      expect(phases).toHaveLength(3);
      expect(phases.at(0).prop('cols')).toBe(4);
      expect(phases.at(0).prop('index')).toBe(1);
      expect(phases.at(0).prop('isActive')).toBe(false);
      expect(phases.at(0).prop('isCompleted')).toBe(true);
      expect(phases.at(0).prop('title')).toBe('ReservationPhase.timeTitle');
      expect(phases.at(1).prop('cols')).toBe(4);
      expect(phases.at(1).prop('index')).toBe(2);
      expect(phases.at(1).prop('isActive')).toBe(true);
      expect(phases.at(1).prop('isCompleted')).toBe(false);
      expect(phases.at(1).prop('title')).toBe('ReservationPhase.informationTitle');
      expect(phases.at(2).prop('cols')).toBe(4);
      expect(phases.at(2).prop('index')).toBe(3);
      expect(phases.at(2).prop('isActive')).toBe(false);
      expect(phases.at(2).prop('isCompleted')).toBe(false);
      expect(phases.at(2).prop('title')).toBe('ReservationPhase.confirmationTitle');
    });
  });

  describe('when currentPhase is confirmation', () => {
    test('renders two phases with correct props when isEditing false', () => {
      const phases = getWrapper({
        currentPhase: 'confirmation',
        isEditing: false,
      }).find(ReservationPhase);

      expect(phases).toHaveLength(2);
      expect(phases.at(0).prop('cols')).toBe(6);
      expect(phases.at(0).prop('index')).toBe(1);
      expect(phases.at(0).prop('isActive')).toBe(false);
      expect(phases.at(0).prop('isCompleted')).toBe(true);
      expect(phases.at(0).prop('title')).toBe('ReservationPhase.informationTitle');
      expect(phases.at(1).prop('cols')).toBe(6);
      expect(phases.at(1).prop('index')).toBe(2);
      expect(phases.at(1).prop('isActive')).toBe(true);
      expect(phases.at(1).prop('isCompleted')).toBe(false);
      expect(phases.at(1).prop('title')).toBe('ReservationPhase.confirmationTitle');
    });

    test('renders three phases with correct props when isEditing true', () => {
      const phases = getWrapper({
        currentPhase: 'confirmation',
        isEditing: true,
      }).find(ReservationPhase);

      expect(phases).toHaveLength(3);
      expect(phases.at(0).prop('cols')).toBe(4);
      expect(phases.at(0).prop('index')).toBe(1);
      expect(phases.at(0).prop('isActive')).toBe(false);
      expect(phases.at(0).prop('isCompleted')).toBe(true);
      expect(phases.at(0).prop('title')).toBe('ReservationPhase.timeTitle');
      expect(phases.at(1).prop('cols')).toBe(4);
      expect(phases.at(1).prop('index')).toBe(2);
      expect(phases.at(1).prop('isActive')).toBe(false);
      expect(phases.at(1).prop('isCompleted')).toBe(true);
      expect(phases.at(1).prop('title')).toBe('ReservationPhase.informationTitle');
      expect(phases.at(2).prop('cols')).toBe(4);
      expect(phases.at(2).prop('index')).toBe(3);
      expect(phases.at(2).prop('isActive')).toBe(true);
      expect(phases.at(2).prop('isCompleted')).toBe(false);
      expect(phases.at(2).prop('title')).toBe('ReservationPhase.confirmationTitle');
    });
  });

  describe('when hasProducts is true and isEditing is true', () => {
    test('renders three phases', () => {
      const phases = getWrapper({
        currentPhase: 'confirmation',
        isEditing: true,
        hasProducts: true
      }).find(ReservationPhase);
      expect(phases).toHaveLength(3);
    });
  });

  describe('when hasProducts is true and isEditing is false', () => {
    test('renders four phases', () => {
      const phases = getWrapper({
        currentPhase: 'confirmation',
        isEditing: false,
        hasProducts: true
      }).find(ReservationPhase);
      expect(phases).toHaveLength(4);
      expect(phases.at(0).prop('title')).toBe('ReservationPhase.productsTitle');
      expect(phases.at(2).prop('title')).toBe('ReservationPhase.paymentTitle');
    });
  });

  describe('when hasProducts is true, isEditing is true and needManualConfirmation is true', () => {
    test('renders three phases', () => {
      const phases = getWrapper({
        currentPhase: 'confirmation',
        isEditing: true,
        hasProducts: true
      }).find(ReservationPhase);
      expect(phases).toHaveLength(3);
    });
  });

  describe('when hasProducts is true, isEditing is false, needManualConfirmation is true and isStaff is true', () => {
    test('renders four phases', () => {
      const phases = getWrapper({
        currentPhase: 'confirmation',
        isEditing: false,
        isStaff: true,
        hasProducts: true
      }).find(ReservationPhase);
      expect(phases).toHaveLength(4);
    });
  });
});
