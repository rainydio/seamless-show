import { combineReducers } from "redux";
import omit from "just-omit";

const emaLength = (state = 6, action) => {
	switch (action.type) {
		case "EMA_LENGTH_SET":
			return action.emaLength;
		default:
			return state;
	}
};

const inflation = (state = 15, action) => {
	switch (action.type) {
		case "INFLATION_SET":
			return action.inflation;
		default:
			return state;
	}
};

const countdownFrom = (state = 35, action) => {
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

const tipOptions = (state = { }, action) => {
	switch (action.type) {
		case "TIP_OPTION_SET":
			return Object.assign({ }, state, {
				[action.tipOption]: {
					goal: action.goal,
					limit: action.limit,
					limitLength: action.limitLength,
				},
			});
		case "TIP_OPTION_REMOVE":
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

const contributedTokens = (state = { }, action) => {
	switch (action.type) {
		case "CONTRIBUTED_TOKENS_ADD":
			return Object.assign({ }, state, {
				[action.tipOption]: action.amount + (state[action.tipOption] || 0),
			});
		case "CONTRIBUTED_TOKENS_RESET":
			return omit(state, action.tipOption);
		default:
			return state;
	}
};

const roundContributedTokens = (state = 0, action) => {
	switch (action.type) {
		case "ROUND_CONTRIBUTED_TOKENS_ADD":
			return state + action.amount;
		case "ROUND_CONTRIBUTED_TOKENS_RESET":
			return 0;
		default:
			return state;
	}
};

const emaContributedTokens = (state = 0, action) => {
	switch (action.type) {
		case "EMA_CONTRIBUTED_TOKENS_SET":
			return action.emaContributedTokens;
		default:
			return state;
	}
};

const subsidizedTokens = (state = { }, action) => {
	switch (action.type) {
		case "SUBSIDIZED_TOKENS_ADD":
			return Object.assign({ }, state, {
				[action.tipOption]: action.amount + (state[action.tipOption] || 0),
			});
		case "SUBSIDIZED_TOKENS_RESET":
			return omit(state, action.tipOption);
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
		case "PERFORMANCE_START":
			return [action.tipOption, ...state];
		default:
			return state;
	}
};

const showEnding = (state = false, action) => {
	switch (action.type) {
		case "SHOW_FINISH":
			return true;
		case "SHOW_CONTINUE":
			return false;
		default:
			return state;
	}
};

const userDanglingTokens = (state = { }, action) => {
	switch (action.type) {
		case "USER_DANGLING_TOKENS_ADD":
			return Object.assign({ }, state, {
				[action.username]: action.amount + (state[action.username] || 0),
			});
		case "USER_DANGLING_TOKENS_RESET":
			return omit(state, action.username);
		default:
			return state;
	}
};

const userTotalTokens = (state = { }, action) => {
	switch (action.type) {
		case "USER_TOTAL_TOKENS_ADD":
			return Object.assign({ }, state, {
				[action.username]: action.amount + (state[action.username] || 0),
			});
		default:
			return state;
	}
};

const userPreferences = (state = { }, action) => {
	switch (action.type) {
		case "USER_PREFERENCE_SET":
			return Object.assign({ }, state, {
				[action.username]: Object.assign({ }, state[action.username], {
					[action.tipOption]: true,
				}),
			});
		default:
			return state;
	}
};

const userRateNoticeSent = (state = { }, action) => {
	switch (action.type) {
		case "USER_RATE_NOTICE_SEND_DONE":
			return Object.assign({ }, state, {
				[action.username]: true,
			});
		default:
			return state;
	}
};

export default combineReducers({
	emaLength,
	inflation,
	countdownFrom,
	subjectTemplate,
	tipOptions,
	totalTokens,
	contributedTokens,
	roundContributedTokens,
	emaContributedTokens,
	subsidizedTokens,
	countdownLeft,
	performances,
	showEnding,
	userDanglingTokens,
	userTotalTokens,
	userPreferences,
	userRateNoticeSent,
});
