import cb from "chaturbate";
import equal from "deep-equal";
import { call, fork, put, take, takeEvery, takeLatest, select, delay } from "redux-saga/effects";
import {
	setInflation,
	setCountdownFrom,
	setSubjectTemplate,
	setTipLabel,
	setupScene,
	setScene,
	addTotalTokens,
	addCollectedTokens,
	resetCollectedTokens,
	addPerformance,
	setCountdownLeft,
	disableScene,
	startScene,
} from "./actions";
import {
	getUnlockedScenes,
	getByOption,
	getInfaltionMultiplier,
	getAvailableScenes,
	getScheduledScenes,
	isWrappingUp,
	getCountdownFrom,
	getNext,
} from "./selectors";
import {
	getGoalReachedMsg,
	getMenuMsg,
	getPanel,
	getSubjectMsg,
	getCountdownStartMsg,
} from "./messages";

function * waitChanged(selector, ...args) {
	const prev = yield select(selector, ...args);
	while (true) {
		yield take("*");
		const current = yield select(selector, ...args);
		if (equal(prev, current) === false) {
			return current;
		}
	}
}

function * announceUnlocksSaga() {
	const announced = yield select(getUnlockedScenes);
	while (true) {
		const unlocked = yield waitChanged(getUnlockedScenes);
		for (const scene of unlocked) {
			if (announced.includes(scene) === false) {
				const msg = yield select(getGoalReachedMsg, scene);
				yield call(cb.sendNotice, msg);
				announced.push(scene);
			}
		}
	}
}

function * showMenuSaga() {
	yield takeEvery("MENU_SHOW", function * ({ username }) {
		const msg = yield select(getMenuMsg);
		yield call(cb.sendNotice, msg, username);
	});
}

function * redrawPanelSaga() {
	while (true) {
		yield waitChanged(getPanel);
		yield call(cb.drawPanel);
	}
}

function * updateSubjectSaga() {
	while (true) {
		const subject = yield waitChanged(getSubjectMsg);
		yield call(cb.changeRoomSubject, subject);
	}
}

function * countTotalTokensSaga() {
	yield takeEvery("TIP_RECEIVE", function * ({ amount }) {
		yield put(addTotalTokens(amount));
	});
}

function * collectTokensSaga() {
	yield takeEvery("TIP_RECEIVE", function * ({ amount, message }) {
		if (message !== "") {
			const scene = yield select(getByOption, message);
			if (scene !== null) {
				yield put(addCollectedTokens(scene, amount));

				const multiplier = yield select(getInfaltionMultiplier);
				if (multiplier !== 0) {
					const available = yield select(getAvailableScenes);
					const subsidy = amount * multiplier / available.length;
					for (const otherScene of available) {
						yield put(addCollectedTokens(otherScene, subsidy));
					}
				}
			}
		}
	});
}

function * startSceneSaga() {
	yield takeEvery("SCENE_START", function * ({ scene }) {
		yield put(resetCollectedTokens(scene));
		yield put(addPerformance(scene));
		if (yield select(isWrappingUp)) {
			yield put(disableScene(scene));
		}
	});
}

function * startNextSceneCountdownSaga() {
	yield takeLatest(["SCENE_NEXT_COUNTDOWN_START", "SCENE_START"], function * (action) {
		if (action.type === "SCENE_START") {
			yield put(setCountdownLeft(0));
			return;
		}

		const scheduled = yield select(getScheduledScenes);
		if (scheduled.length === 0) {
			yield put(setCountdownLeft(0));
			return;
		}
		if (scheduled.length === 1) {
			yield put(startScene(scheduled[0]));
			return;
		}

		const msg = yield select(getCountdownStartMsg);
		yield call(cb.sendNotice, msg);

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

		const next = yield select(getNext);
		yield put(startScene(next));
	});
}

function * setupSceneSaga() {
	yield takeEvery("SCENE_SETUP", function * ({ sceneConfig }) {
		let goal = null;
		let maxCount = null;
		let maxCountLength = null;

		const parts = sceneConfig.split(" ");
		for (let i = parts.length - 1; i >= 0; i--) {
			const part = parts[i];
			const goalMatch = part.match(/>=(\d+)/);
			const spacingMatch = part.match(/(\d+)\/(\d+)/);

			if (goalMatch) {
				goal = parseInt(goalMatch[1]);
				parts.splice(i, 1);
				continue;
			}
			if (spacingMatch) {
				maxCount = parseInt(spacingMatch[1]);
				maxCountLength = parseInt(spacingMatch[2]);
				parts.splice(i, 1);
				continue;
			}
		}

		yield put(setScene(parts.join(" "), goal, maxCount, maxCountLength));
	});
}

function * loadSettingsSaga() {
	yield put(setInflation(cb.settings.inflation));
	yield put(setCountdownFrom(cb.settings.countdownFrom));
	yield put(setSubjectTemplate(cb.settings.subjectTemplate));
	yield put(setTipLabel(cb.settings.tipLabel));

	const keys = Object.keys(cb.settings).filter(k => /^scene\d+$/.test(k));
	for (const key of keys) {
		if (cb.settings[key]) {
			yield put(setupScene(cb.settings[key]));
		}
	}
}

export default function * saga() {
	yield fork(announceUnlocksSaga);
	yield fork(showMenuSaga);
	yield fork(redrawPanelSaga);
	yield fork(updateSubjectSaga);
	yield fork(countTotalTokensSaga);
	yield fork(collectTokensSaga);
	yield fork(startSceneSaga);
	yield fork(startNextSceneCountdownSaga);
	yield fork(setupSceneSaga);
	yield fork(loadSettingsSaga);
}
