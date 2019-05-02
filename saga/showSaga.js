import { call, fork, put, takeEvery, takeLatest, select, delay } from "redux-saga/effects";
import { getNext, getWithoutContributionsTipOptions, getJustUnlockedTipOptions, isShowEnding, getCountdownFrom } from "../selectors";
import { updateSubject, drawPanel, sendCountdownNotice, sendGoalReachedNotice } from "../components";
import {
	removeTipOption,
	startPerformance,
	startNextPerformance,
	setCountdownLeft,
	cancelNextPerformanceCountdown,
} from "../actions";

function * updateSubjectSaga() {
	yield takeEvery("PERFORMANCE_START", function * () {
		yield call(updateSubject, yield select());
	});
}

function * drawPanelSaga() {
	yield takeEvery([
		"PERFORMANCE_START",
		"CONTRIBUTED_TOKENS_ADD",
		"CONTRIBUTED_TOKENS_RESET",
		"SUBSIDIZED_TOKENS_ADD",
		"SUBSIDIZED_TOKENS_RESET",
		"COUNTDOWN_LEFT_SET",
	], function * () {
		yield call(drawPanel, yield select());
	});
}

function * announceUnlocksSaga() {
	yield takeEvery("TOTAL_TOKENS_ADD", function * ({ amount }) {
		const unlocked = yield select(getJustUnlockedTipOptions, amount);
		for (const tipOption of unlocked) {
			yield call(sendGoalReachedNotice, yield select(), tipOption);
		}
	});
}

function * startNextPerformanceSaga() {
	yield takeEvery("PERFORMANCE_NEXT_START", function * () {
		const next = yield select(getNext);
		if (next) {
			yield put(startPerformance(next));
		}
	});
}

function * endingShowSaga() {
	yield takeEvery("SHOW_FINISH", function * () {
		const withoutContributions = yield select(getWithoutContributionsTipOptions);
		for (const tipOption of withoutContributions) {
			yield put(removeTipOption(tipOption));
		}
	});

	yield takeEvery("PERFORMANCE_START", function * ({ tipOption }) {
		const ending = yield select(isShowEnding);
		if (ending) {
			yield put(removeTipOption(tipOption));
		}
	});
}

function * countdownSaga() {
	yield takeLatest([
		"PERFORMANCE_NEXT_COUNTDOWN_START",
		"PERFORMANCE_NEXT_COUNTDOWN_CANCEL",
	], function * ({ type }) {
		if (type === "PERFORMANCE_NEXT_COUNTDOWN_CANCEL") {
			yield put(setCountdownLeft(0));
			return;
		}

		const countdownFrom = yield select(getCountdownFrom);
		const startedAt = Date.now();
		while (true) {
			const secondsPassed = Math.floor((Date.now() - startedAt) / 1000);
			const countdownLeft = Math.max(0, countdownFrom - secondsPassed);
			yield put(setCountdownLeft(countdownLeft));
			if (countdownLeft === 0) {
				break;
			}
			yield delay(250);
		}
		yield put(startNextPerformance());
	});

	yield takeEvery("PERFORMANCE_START", function * () {
		yield put(cancelNextPerformanceCountdown());
	});

	yield takeEvery("PERFORMANCE_NEXT_COUNTDOWN_START", function * () {
		yield call(sendCountdownNotice, yield select());
	});
}

export default function * showSaga() {
	yield fork(updateSubjectSaga);
	yield fork(drawPanelSaga);
	yield fork(announceUnlocksSaga);
	yield fork(startNextPerformanceSaga);
	yield fork(endingShowSaga);
	yield fork(countdownSaga);
}
