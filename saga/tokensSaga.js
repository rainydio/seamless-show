import { call, fork, put, takeEvery, select } from "redux-saga/effects";
import { getEmaLength, getInflation, getTipOptionByTipMessage, getDanglingTokens, getRoundContributedTokens, getEmaContributedTokens, getScheduledTipOptions } from "../selectors";
import { sendDanglingTokensNotice } from "../components";
import {
	addTotalTokens,
	addDanglingTokens,
	resetDanglingTokens,
	addContributedTokens,
	resetContributedTokens,
	addRoundContributedTokens,
	resetRoundContributedTokens,
	setEmaContributedTokens,
	addSubsidizedTokens,
	resetSubsidizedTokens,
} from "../actions";

function * contributionsSaga() {
	yield takeEvery("TIP_RECEIVE", function * ({ username, amount, message }) {
		yield put(addTotalTokens(amount));
		const tipOption = yield select(getTipOptionByTipMessage, message);

		if (tipOption) {
			const danglingTokens = yield select(getDanglingTokens, username);
			yield put(resetDanglingTokens(username));
			yield put(addContributedTokens(tipOption, amount + danglingTokens));
		}
		else {
			yield put(addDanglingTokens(username, amount));
		}
	});

	yield takeEvery("PERFORMANCE_START", function * ({ tipOption }) {
		yield put(resetContributedTokens(tipOption));
	});

	yield takeEvery("DANGLING_TOKENS_ADD", function * ({ username }) {
		yield call(sendDanglingTokensNotice, yield select(), username);
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
