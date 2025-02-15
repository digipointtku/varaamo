
import { createAction } from 'redux-actions';
import Immutable from 'seamless-immutable';

import types from 'constants/ActionTypes';
import Reservation from 'utils/fixtures/Reservation';
import Resource from 'utils/fixtures/Resource';
import User from 'utils/fixtures/User';
import dataReducer, { handleData } from './dataReducer';

describe('state/reducers/dataReducer', () => {
  describe('initial state', () => {
    const initialState = dataReducer(undefined, {});

    test('reservations is an empty object', () => {
      expect(initialState.reservations).toEqual({});
    });

    test('resources is an empty object', () => {
      expect(initialState.resources).toEqual({});
    });

    test('units is an empty object', () => {
      expect(initialState.units).toEqual({});
    });

    test('users is an empty object', () => {
      expect(initialState.users).toEqual({});
    });
  });

  describe('handling data', () => {
    const data = {
      resources: {
        'r-1': { value: 'some-value' },
      },
    };

    test('adds the given entities to state', () => {
      const initialState = Immutable({
        resources: {},
      });
      const expectedState = Immutable({
        resources: {
          'r-1': { value: 'some-value' },
        },
      });
      const nextState = handleData(initialState, data);

      expect(nextState).toEqual(expectedState);
    });

    test('does not remove other entities in the same data collection', () => {
      const initialState = Immutable({
        resources: {
          'r-2': { value: 'other-value' },
        },
      });
      const expectedState = Immutable({
        resources: {
          'r-1': { value: 'some-value' },
          'r-2': { value: 'other-value' },
        },
      });
      const nextState = handleData(initialState, data);

      expect(nextState).toEqual(expectedState);
    });

    test('overrides values with the same id in the same data collection', () => {
      const initialState = Immutable({
        resources: {
          'r-1': { value: 'override this' },
        },
      });
      const expectedState = Immutable({
        resources: {
          'r-1': { value: 'some-value' },
        },
      });
      const nextState = handleData(initialState, data);

      expect(nextState).toEqual(expectedState);
    });

    test('does not change the other data collections', () => {
      const initialState = Immutable({
        resources: {},
        units: {
          'u-1': { value: 'unit-value' },
        },
      });
      const expectedState = Immutable({
        resources: {
          'r-1': { value: 'some-value' },
        },
        units: {
          'u-1': { value: 'unit-value' },
        },
      });
      const nextState = handleData(initialState, data);

      expect(nextState).toEqual(expectedState);
      expect(nextState.units).toBe(initialState.units);
    });
  });

  describe('handling actions', () => {
    describe('API.RESERVATION_POST_SUCCESS', () => {
      const postReservationSuccess = createAction(types.API.RESERVATION_POST_SUCCESS);

      test('adds the reservation to reservations', () => {
        const reservation = Reservation.build();
        const initialState = Immutable({
          reservations: {},
          resources: {},
        });
        const action = postReservationSuccess(reservation);
        const nextState = dataReducer(initialState, action);

        const actualReservations = nextState.reservations;
        const expectedReservations = Immutable({
          [reservation.url]: reservation,
        });

        expect(actualReservations).toEqual(expectedReservations);
      });

      test('adds the given reservation to correct resource', () => {
        const resource = Resource.build();
        const reservation = Reservation.build({ resource: resource.id });
        const initialState = Immutable({
          reservations: {},
          resources: { [resource.id]: resource },
        });
        const action = postReservationSuccess(reservation);
        const nextState = dataReducer(initialState, action);
        const actualReservations = nextState.resources[resource.id].reservations;
        const expectedReservations = Immutable([reservation]);

        expect(actualReservations).toEqual(expectedReservations);
      });

      test('does not touch other resource values', () => {
        const resource = Resource.build({
          otherValue: 'whatever',
        });
        const reservation = Reservation.build({ resource: resource.id });
        const initialState = Immutable({
          reservations: {},
          resources: { [resource.id]: resource },
        });
        const action = postReservationSuccess(reservation);
        const nextState = dataReducer(initialState, action);
        const expectedValue = resource.otherValue;
        const actualvalue = nextState.resources[resource.id].otherValue;

        expect(expectedValue).toEqual(actualvalue);
      });
    });

    describe('API.RESERVATION_PUT_SUCCESS', () => {
      const putReservationSuccess = createAction(types.API.RESERVATION_PUT_SUCCESS);

      describe('updating reservations', () => {
        test('adds the reservation to reservations if it is not already there', () => {
          const reservation = Reservation.build();
          const initialState = Immutable({
            reservations: {},
            resources: {},
          });
          const action = putReservationSuccess(reservation);
          const nextState = dataReducer(initialState, action);

          const actualReservations = nextState.reservations;
          const expectedReservations = Immutable({
            [reservation.url]: reservation,
          });

          expect(actualReservations).toEqual(expectedReservations);
        });

        test('updates a reservation already in reservations', () => {
          const oldReservation = Reservation.build({
            begin: 'old-begin',
            end: 'old-end',
          });
          const initialState = Immutable({
            reservations: { [oldReservation.url]: oldReservation },
            resources: {},
          });
          const updatedReservation = Reservation.build({
            begin: 'new-begin',
            end: 'new-end',
            url: oldReservation.url,
          });
          const action = putReservationSuccess(updatedReservation);
          const nextState = dataReducer(initialState, action);

          const actualReservations = nextState.reservations;
          const expectedReservations = Immutable({
            [updatedReservation.url]: updatedReservation,
          });

          expect(actualReservations).toEqual(expectedReservations);
        });
      });

      describe('updating resource reservations', () => {
        test('adds the given reservation to correct resource', () => {
          const resource = Resource.build();
          const reservation = Reservation.build({ resource: resource.id });
          const initialState = Immutable({
            reservations: {},
            resources: { [resource.id]: resource },
          });
          const action = putReservationSuccess(reservation);
          const nextState = dataReducer(initialState, action);
          const actualReservations = nextState.resources[resource.id].reservations;
          const expectedReservations = Immutable([reservation]);

          expect(actualReservations).toEqual(expectedReservations);
        });

        test('updates a reservation already in resource reservations', () => {
          const resource = Resource.build();
          const oldReservation = Reservation.build({
            begin: 'old-begin',
            end: 'old-end',
            resource: resource.id,
          });
          resource.reservations = [oldReservation];

          const initialState = Immutable({
            reservations: {},
            resources: { [resource.id]: resource },
          });
          const updatedReservation = Reservation.build({
            begin: 'new-begin',
            end: 'new-end',
            resource: resource.id,
            url: oldReservation.url,
          });
          const action = putReservationSuccess(updatedReservation);
          const nextState = dataReducer(initialState, action);

          const actualReservations = nextState.resources[resource.id].reservations;
          const expectedReservations = Immutable([updatedReservation]);

          expect(actualReservations).toEqual(expectedReservations);
        });

        test('does not touch other resource values', () => {
          const resource = Resource.build({
            otherValue: 'whatever',
          });
          const reservation = Reservation.build({ resource: resource.id });
          const initialState = Immutable({
            reservations: {},
            resources: { [resource.id]: resource },
          });
          const action = putReservationSuccess(reservation);
          const nextState = dataReducer(initialState, action);
          const expectedValue = resource.otherValue;
          const actualvalue = nextState.resources[resource.id].otherValue;

          expect(expectedValue).toEqual(actualvalue);
        });
      });
    });

    describe('API.RESERVATION_DELETE_SUCCESS', () => {
      const deleteReservationSuccess = createAction(types.API.RESERVATION_DELETE_SUCCESS);

      test('changes reservation state to cancelled in reservations', () => {
        const reservation = Reservation.build({ state: 'confirmed' });
        const initialState = Immutable({
          reservations: { [reservation.url]: reservation },
          resources: {},
        });
        const action = deleteReservationSuccess(reservation);
        const nextState = dataReducer(initialState, action);

        const actual = nextState.reservations[reservation.url];
        const expected = Object.assign({}, reservation, { state: 'cancelled' });

        expect(actual).toEqual(expected);
      });

      test('changes reservation state to cancelled in resource reservations', () => {
        const resource = Resource.build();
        const reservation = Reservation.build({ resource: resource.id, state: 'confirmed' });
        resource.reservations = [reservation];

        const initialState = Immutable({
          reservations: {},
          resources: { [resource.id]: resource },
        });
        const action = deleteReservationSuccess(reservation);
        const nextState = dataReducer(initialState, action);

        const actualReservations = nextState.resources[resource.id].reservations;
        const expected = Immutable([Object.assign({}, reservation, { state: 'cancelled' })]);

        expect(actualReservations[0].state).toEqual(expected[0].state);
      });

      test('does not touch other resource values', () => {
        const resource = Resource.build({
          otherValue: 'whatever',
        });
        const reservation = Reservation.build({ resource: resource.id, state: 'confirmed' });
        const initialState = Immutable({
          reservations: {},
          resources: { [resource.id]: resource },
        });
        const action = deleteReservationSuccess(reservation);
        const nextState = dataReducer(initialState, action);
        const expectedValue = resource.otherValue;
        const actualvalue = nextState.resources[resource.id].otherValue;

        expect(expectedValue).toEqual(actualvalue);
      });
    });

    describe('API.RESOURCES_GET_SUCCESS', () => {
      const resourcesGetSuccess = createAction(
        types.API.RESOURCES_GET_SUCCESS,
        resource => ({ entities: { resources: { [resource.id]: resource } } })
      );

      test('adds resources to state', () => {
        const resource = Resource.build();
        const initialState = Immutable({
          resources: {},
        });
        const action = resourcesGetSuccess(resource);
        const nextState = dataReducer(initialState, action);

        const expected = Immutable({
          [resource.id]: resource,
        });

        expect(nextState.resources).toEqual(expected);
      });

      test('removes resource.reservations if it is null', () => {
        const resource = { id: 'resource-1', reservations: null };
        const initialState = Immutable({
          resources: {},
        });
        const action = resourcesGetSuccess(resource);
        const nextState = dataReducer(initialState, action);

        const expected = Immutable({
          [resource.id]: { id: 'resource-1' },
        });

        expect(nextState.resources).toEqual(expected);
      });

      test('does not replace old reservations value with null', () => {
        const originalResource = Resource.build({
          reservations: [{ foo: 'bar' }],
          state: 'requested',
        });
        const updatedResource = Resource.build({
          id: originalResource.id,
          reservations: null,
          state: 'confirmed',
        });
        const initialState = Immutable({
          resources: { [originalResource.id]: originalResource },
        });
        const action = resourcesGetSuccess(updatedResource);
        const nextState = dataReducer(initialState, action);
        const actualResource = nextState.resources[originalResource.id];

        expect(actualResource.reservations).toEqual(originalResource.reservations);
        expect(actualResource.state).toBe(updatedResource.state);
      });
    });

    describe('API.SEARCH_RESULTS_GET_SUCCESS', () => {
      const searchResultsGetSuccess = createAction(
        types.API.SEARCH_RESULTS_GET_SUCCESS,
        resource => ({ entities: { resources: { [resource.id]: resource } } })
      );

      test('adds resources to state', () => {
        const resource = Resource.build();
        const initialState = Immutable({
          resources: {},
        });
        const action = searchResultsGetSuccess(resource);
        const nextState = dataReducer(initialState, action);

        const expected = Immutable({
          [resource.id]: resource,
        });

        expect(nextState.resources).toEqual(expected);
      });


      test('does not keep old fields in resource', () => {
        const originalResource = Resource.build({
          distance: 400000,
          state: 'requested',
        });
        const updatedResource = Resource.build({
          id: originalResource.id,
          state: 'confirmed',
        });
        const initialState = Immutable({
          resources: { [originalResource.id]: originalResource },
        });
        const action = searchResultsGetSuccess(updatedResource);
        const nextState = dataReducer(initialState, action);
        const actualResource = nextState.resources[originalResource.id];

        expect(actualResource).toEqual(updatedResource);
      });
    });


    describe('API.USER_GET_SUCCESS', () => {
      const userGetSuccess = createAction(types.API.USER_GET_SUCCESS);

      test('adds the user to users', () => {
        const user = User.build();
        const initialState = Immutable({
          users: {},
        });
        const action = userGetSuccess(user);
        const nextState = dataReducer(initialState, action);

        const actualUsers = nextState.users;
        const expectedUsers = Immutable({
          [user.uuid]: user,
        });

        expect(actualUsers).toEqual(expectedUsers);
      });

      test('does not affect previous user values', () => {
        const user = User.build({ previousValue: 'value' });
        const updatedUser = User.build({ uuid: user.uuid, newValue: 'newValue' });
        const initialState = Immutable({
          users: { [user.uuid]: user },
        });
        const action = userGetSuccess(updatedUser);
        const nextState = dataReducer(initialState, action);
        const actualUser = nextState.users[user.uuid];

        expect(actualUser.previousValue).toBe(user.previousValue);
        expect(actualUser.newValue).toBe(updatedUser.newValue);
      });
    });

    describe('API.RESOURCE_UNFAVORITE_POST_SUCCESS', () => {
      const resource = {
        id: '123',
        isFavorite: true,
      };

      const unfavoriteResource = createAction(
        types.API.RESOURCE_UNFAVORITE_POST_SUCCESS,
        payload => payload,
        () => ({ id: resource.id })
      );

      test('changes isFavorite attribute from resource', () => {
        const user = User.build();
        const initialState = Immutable({
          resources: {
            [resource.id]: resource,
          },
        });
        const action = unfavoriteResource(user);
        const nextState = dataReducer(initialState, action);

        expect(nextState.resources[resource.id].isFavorite).toBe(false);
      });
    });

    describe('API.RESOURCE_FAVORITE_POST_SUCCESS', () => {
      const resource = {
        id: '123',
        isFavorite: false,
      };

      const unfavoriteResource = createAction(
        types.API.RESOURCE_FAVORITE_POST_SUCCESS,
        payload => payload,
        () => ({ id: resource.id })
      );

      test('changes isFavorite attribute from resource', () => {
        const user = User.build();
        const initialState = Immutable({
          resources: {
            [resource.id]: resource,
          },
        });
        const action = unfavoriteResource(user);
        const nextState = dataReducer(initialState, action);

        expect(nextState.resources[resource.id].isFavorite).toBe(true);
      });
    });
  });
});
