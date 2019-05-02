import { fork } from "redux-saga/effects";
import settingsSaga from "./settingsSaga";
import showSaga from "./showSaga";
import tokensSaga from "./tokensSaga";
import rateNoticeSaga from "./rateNoticeSaga";

export default function * saga() {
	yield fork(settingsSaga);
	yield fork(showSaga);
	yield fork(tokensSaga);
	yield fork(rateNoticeSaga);
}
