import { takeEvery, put, call } from 'redux-saga/effects';
import axiosInstance from './config';
import { requestUserSessionSuccess, requestUserSessionFailure } from './slice/userSessionSlice';

function* userSessionInfoApi(action) {
  try {
    const { sessionName, userName, sessionPasscode } = action.payload;
    const response = yield call(axiosInstance.post, '/getSignature', {
      sessionName,
      userName,
      sessionPasscode,
    });
    yield put(requestUserSessionSuccess(response.data));
  } catch (error) {
    yield put(requestUserSessionFailure(error.message));
  }
}

function* watchUserSessionInfo() {
  yield takeEvery('userSession/requestUserSession', userSessionInfoApi);
}

export default function* rootSaga() {
  yield watchUserSessionInfo();
}
