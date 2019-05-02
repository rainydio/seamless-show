import { call, put, takeEvery, select } from "redux-saga/effects";
import { getRateNoticeRecipientList } from "../selectors";
import { sendRateNotice } from "../components";
import { doneSendUserRateNotice } from "../actions";

export default function * rateNoticeSaga() {
	yield takeEvery("PERFORMANCE_START", function * () {
		const usernames = yield select(getRateNoticeRecipientList);
		for (const username of usernames) {
			yield call(sendRateNotice, yield select(), username);
			yield put(doneSendUserRateNotice(username));
		}
	});
}
