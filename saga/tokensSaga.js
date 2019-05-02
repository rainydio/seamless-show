import { call, fork, put, takeEvery, select } from "redux-saga/effects";
import { getEmaLength, getInflation, getTipOptionByTipMessage, getUserDanglingTokens, getRoundContributedTokens, getEmaContributedTokens, getScheduledTipOptions } from "../selectors";
import { sendUserDanglingTokensNotice } from "../components";
import {
	addTotalTokens,
	addUserTotalTokens,
	addUserDanglingTokens,
	resetUserDanglingTokens,
	addContributedTokens,
	resetContributedTokens,
	addRoundContributedTokens,
	resetRoundContributedTokens,
	setEmaContributedTokens,
	addSubsidizedTokens,
	resetSubsidizedTokens,
	setUserPreference,
} from "../actions";

function * contributionsSaga() {
	yield takeEvery("TIP_RECEIVE", function * ({ username, amount, message }) {
		yield put(addTotalTokens(amount));
		yield put(addUserTotalTokens(username, amount));
		const tipOption = yield select(getTipOptionByTipMessage, message);

		if (tipOption) {
			const danglingTokens = yield select(getUserDanglingTokens, username);
			yield put(resetUserDanglingTokens(username));
			yield put(addContributedTokens(tipOption, amount + danglingTokens));
			yield put(setUserPreference(username, tipOption));
		}
		else {
			yield put(addUserDanglingTokens(username, amount));
		}
	});

	yield takeEvery("PERFORMANCE_START", function * ({ tipOption }) {
		yield put(resetContributedTokens(tipOption));
	});

	yield takeEvery("USER_DANGLING_TOKENS_ADD", function * ({ username }) {
		yield call(sendUserDanglingTokensNotice, yield select(), username);
	});
}

function * subsidiesSaga() {
	yield takeEvery("CONTRIBUTED_TOKENS_ADD", function * ({ amount }) {
		yield put(addRoundContributedTokens(amount));
	});

	yield takeEvery("PERFORMANCE_START", function * ({ tipOption }) {
		const emaLength = yield select(getEmaLength);
		const emaContributedTokens = yield select(getEmaContributedTokens);
		const roundContributedTokens = yield select(getRoundContributedTokens);
		const k = 2 / (emaLength + 1);
		const ema = (roundContributedTokens * k) + (emaContributedTokens * (1 - k));

		const scheduled = yield select(getScheduledTipOptions);
		const infaltion = yield select(getInflation);
		const infaltionMultiplier = infaltion >= 0
			? 1 + (infaltion / 100)
			: 1 / (1 + (Math.abs(infaltion) / 100));
		const subsidyAmount = ema * infaltionMultiplier / scheduled.length;

		yield put(setEmaContributedTokens(ema));
		yield put(resetRoundContributedTokens());
		yield put(resetSubsidizedTokens(tipOption));
		for (const scheduledTipOption of scheduled) {
			yield put(addSubsidizedTokens(scheduledTipOption, subsidyAmount));
		}
	});
}

export default function * tokensSaga() {
	yield fork(contributionsSaga);
	yield fork(subsidiesSaga);
}
