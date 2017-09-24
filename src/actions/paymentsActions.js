import {
  BILLING_REQUEST,
  BILLING_SUCCESS,
  BILLING_FAIL,

  PAYPAL_SETTLEMENTS_REQUEST,
  PAYPAL_SETTLEMENTS_SUCCESS,
  PAYPAL_SETTLEMENTS_FAIL,
} from '../constants';

import userApi from '../services/userApi';

export function fetchAll() {
  return (dispatch) => {
    dispatch({ type: BILLING_REQUEST });
    return userApi.get('/payments')
      .then((response) => {
        dispatch({
          type: BILLING_SUCCESS,
          payload: response.data,
        });
      })
      .catch((error) => {
        dispatch({
          type: BILLING_FAIL,
          error,
        });
      });
  };
}

export function paypalSettlements(orderId, replay, cb = null) {
  return (dispatch) => {
    dispatch({ type: PAYPAL_SETTLEMENTS_REQUEST });
    const data = {
      order_id: orderId,
      replay,
    };
    return userApi.post('/sra_settlements', data)
      .then((response) => {
        dispatch({
          type: PAYPAL_SETTLEMENTS_SUCCESS,
          payload: response.data,
        });

        if (cb) {
          cb(response.data);
        }
      })
      .catch((error) => {
        dispatch({
          type: PAYPAL_SETTLEMENTS_FAIL,
          error,
        });
      });
  };
}