import cb from "chaturbate";
import { call, fork, put, takeEvery, select } from "redux-saga/effects";
import { updateSubject, drawPanel } from "../components";
import {
	setEmaLength,
	setInflation,
	setCountdownFrom,
	setSubjectTemplate,
	setTipOption,
	setAdvancedOptions,
	setTipOptionByConfig,
} from "../actions";

function * updateSubjectSaga() {
	yield takeEvery("SUBJECT_TEMPLATE_SET", function * () {
		yield call(updateSubject, yield select());
	});
}

function * drawPanelSaga() {
	yield takeEvery(["TIP_OPTION_SET", "TIP_OPTION_REMOVE"], function * () {
		yield call(drawPanel, yield select());
	});
}

function * setAdvancedOptionsSaga() {
	yield takeEvery("ADVANCED_OPTIONS_SET", function * ({ advancedOptionsConfig }) {
		const advancedOptions = advancedOptionsConfig
			.split(";")
			.map(pair => pair.split("="));

		for (const [key, value] of advancedOptions) {
			switch (key) {
				case "emaLength":
					yield put(setEmaLength(parseInt(value)));
					break;
				case "inflation":
					yield put(setInflation(parseFloat(value)));
					break;
				case "countdownFrom":
					yield put(setCountdownFrom(parseInt(value)));
					break;
			}
		}
	});
}

function * setTipOptionByConfigSaga() {
	yield takeEvery("TIP_OPTION_BY_CONFIG_SET", function * ({ tipOptionConfig }) {
		const tipOption = tipOptionConfig
			.replace(/>=\d+/, "")
			.replace(/\d+\/\d+/, "")
			.trim();

		const goalMatch = tipOptionConfig.match(/>=(\d+)/);
		const goal = goalMatch ? parseInt(goalMatch[1]) : null;

		const limitRuleMatch = tipOptionConfig.match(/(\d+)\/(\d+)/);
		const limit = limitRuleMatch ? parseInt(limitRuleMatch[1]) : null;
		const limitLength = limitRuleMatch ? parseInt(limitRuleMatch[2]) : null;

		yield put(setTipOption(tipOption, goal, limit, limitLength));
	});
}

function * loadSettingsSaga() {
	yield put(setAdvancedOptions(cb.settings.advancedOptions));
	yield put(setSubjectTemplate(cb.settings.subjectTemplate));

	const tipOptionConfigs = Object.keys(cb.settings)
		.filter(key => key.match(/^tipOption\d+$/))
		.filter(key => cb.settings[key])
		.map(key => cb.settings[key]);

	for (const tipOptionConfig of tipOptionConfigs) {
		yield put(setTipOptionByConfig(tipOptionConfig));
	}
}

export default function * settingsSaga() {
	yield fork(updateSubjectSaga);
	yield fork(drawPanelSaga);
	yield fork(setAdvancedOptionsSaga);
	yield fork(setTipOptionByConfigSaga);
	yield fork(loadSettingsSaga);
}
