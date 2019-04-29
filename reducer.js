import { combineReducers } from "redux";
import omit from "just-omit";

const inflation = (state = 1, action) => {
	switch (action.type) {
		case "INFLATION_SET":
			return action.inflation;
		default:
			return state;
	}
};

const countdownFrom = (state = 30, action) => {
	switch (action.type) {
		case "COUNTDOWN_FROM_SET":
			return action.countdownFrom;
		default:
			return state;
	}
};

const subjectTemplate = (state = "", action) => {
	switch (action.type) {
		case "SUBJECT_TEMPLATE_SET":
			return action.subjectTemplate;
		default:
			return state;
	}
};

const tipLabel = (state = "", action) => {
	switch (action.type) {
		case "TIP_LABEL_SET":
			return action.tipLabel;
		default:
			return state;
	}
};

const scenes = (state = { }, action) => {
	switch (action.type) {
		case "SCENE_SET":
			return Object.assign({ }, state, {
				[action.scene]: {
					goal: action.goal,
					maxCount: action.maxCount,
					maxCountLength: action.maxCountLength,
				},
			});
		case "SCENE_REMOVE":
			return omit(state, action.scene);
		default:
			return state;
	}
};

const totalTokens = (state = 0, action) => {
	switch (action.type) {
		case "TOTAL_TOKENS_ADD":
			return state + action.amount;
		default:
			return state;
	}
};

const collectedTokens = (state = { }, action) => {
	switch (action.type) {
		case "COLLECTED_TOKENS_ADD":
			return Object.assign({ }, state, {
				[action.scene]: action.amount + (state[action.scene] || 0),
			});
		case "COLLECTED_TOKENS_RESET":
			return Object.assign({ }, state, {
				[action.scene]: 0,
			});
		default:
			return state;
	}
};

const performances = (state = [], action) => {
	switch (action.type) {
		case "PERFORMANCE_ADD":
			return [action.scene, ...state];
		default:
			return state;
	}
};

const countdownLeft = (state = 0, action) => {
	switch (action.type) {
		case "COUNTDOWN_LEFT_SET":
			return action.countdownLeft;
		default:
			return state;
	}
};

const wrappingUp = (state = false, action) => {
	switch (action.type) {
		case "WRAPPING_UP_SET":
			return action.wrappingUp;
		default:
			return state;
	}
};

const disabledScenes = (state = [], action) => {
	switch (action.type) {
		case "SCENE_DISABLE":
			return Object.assign({ }, state, {
				[action.scene]: true,
			});
		case "SCENE_ENABLE":
			return Object.assign({ }, state, {
				[action.scene]: false,
			});
		default:
			return state;
	}
};

export default combineReducers({
	inflation,
	countdownFrom,
	tipLabel,
	subjectTemplate,
	scenes,
	totalTokens,
	collectedTokens,
	performances,
	countdownLeft,
	wrappingUp,
	disabledScenes,
});
