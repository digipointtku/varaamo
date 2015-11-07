import Immutable from 'seamless-immutable';

import types from 'constants/ActionTypes';

const initialState = Immutable({
  token: null,
  userId: null,
});

function authReducer(state = initialState, action) {
  switch (action.type) {

  case types.API.LOGOUT:
    return initialState;

  default:
    return state;
  }
}

export default authReducer;
