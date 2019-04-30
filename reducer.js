import { combineReducers } from "redux";
import omit from "just-omit";

const taxPercentage = (state = 100, action) => {
	switch (action.type) {
		case "TAX_PERCENTAGE_SET":
			return action.taxPercentage;
		default:
			return state;
	}
};

const subsidyPercentage = (state = 25, action) => {
	switch (action.type) {
		case "SUBSIDY_PERCENTAGE_SET":
			return action.subsidyPercentage;
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

const tipOptions = (state = { }, action) => {
	switch (action.type) {
		case "TIP_OPTION_ENABLED_SET":
			return Object.assign({ }, state, {
				[action.tipOption]: action.enabled,
			});
		default:
			return state;
	}
};

const goals = (state = { }, action) => {
	switch (action.type) {
		case "GOAL_SET":
			return Object.assign({ }, state, {
				[action.tipOption]: action.goal,
			});
		case "GOAL_REMOVE":
			return omit(state, action.tipOption);
		default:
			return state;
	}
};

const limits = (state = { }, action) => {
	switch (action.type) {
		case "LIMIT_SET":
			return Object.assign({ }, state, {
				[action.tipOption]: {
					count: action.count,
					length: action.length,
				},
			});
		case "LIMIT_REMOVE":
			return omit(state, action.tipOption);
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

const budgetTokens = (state = 0, action) => {
	switch (action.type) {
		case "BUDGET_TOKENS_ADD":
			return state + action.amount;
		case "BUDGET_TOKENS_REMOVE":
			return state - action.amount;
		default:
			return state;
	}
};

const collectedTokens = (state = { }, action) => {
	switch (action.type) {
		case "COLLECTED_TOKENS_ADD":
			return Object.assign({ }, state, {
				[action.tipOption]: action.amount + (state[action.tipOption] || 0),
			});
		case "COLLECTED_TOKENS_RESET":
			return Object.assign({ }, state, {
				[action.tipOption]: 0,
			});
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

const performances = (state = [], action) => {
	switch (action.type) {
		case "PERFORMANCE_ADD":
			return [action.tipOption, ...state];
		default:
			return state;
	}
};

const showEnding = (state = false, action) => {
	switch (action.type) {
		case "SHOW_ENDING_SET":
			return action.showEnding;
		default:
			return state;
	}
};

export default combineReducers({
	taxPercentage,
	subsidyPercentage,
	countdownFrom,
	subjectTemplate,
	tipLabel,
	tipOptions,
	goals,
	limits,
	totalTokens,
	budgetTokens,
	collectedTokens,
	countdownLeft,
	performances,
	showEnding,
});
