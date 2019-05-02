// reducer actions

export const setEmaLength = (emaLength) => {
	return { type: "EMA_LENGTH_SET", emaLength };
};

export const setInflation = (inflation) => {
	return { type: "INFLATION_SET", inflation };
};

export const setCountdownFrom = (countdownFrom) => {
	return { type: "COUNTDOWN_FROM_SET", countdownFrom };
};

export const setSubjectTemplate = (subjectTemplate) => {
	return { type: "SUBJECT_TEMPLATE_SET", subjectTemplate };
};

export const setTipOption = (tipOption, goal, limit, limitLength) => {
	return { type: "TIP_OPTION_SET", tipOption, goal, limit, limitLength };
};

export const removeTipOption = (tipOption) => {
	return { type: "TIP_OPTION_REMOVE", tipOption };
};

export const addTotalTokens = (amount) => {
	return { type: "TOTAL_TOKENS_ADD", amount };
};

export const addContributedTokens = (tipOption, amount) => {
	return { type: "CONTRIBUTED_TOKENS_ADD", tipOption, amount };
};

export const resetContributedTokens = (tipOption) => {
	return { type: "CONTRIBUTED_TOKENS_RESET", tipOption };
};

export const addRoundContributedTokens = (amount) => {
	return { type: "ROUND_CONTRIBUTED_TOKENS_ADD", amount };
};

export const resetRoundContributedTokens = () => {
	return { type: "ROUND_CONTRIBUTED_TOKENS_RESET" };
};

export const setEmaContributedTokens = (emaContributedTokens) => {
	return { type: "EMA_CONTRIBUTED_TOKENS_SET", emaContributedTokens };
};

export const addSubsidizedTokens = (tipOption, amount) => {
	return { type: "SUBSIDIZED_TOKENS_ADD", tipOption, amount };
};

export const resetSubsidizedTokens = (tipOption) => {
	return { type: "SUBSIDIZED_TOKENS_RESET", tipOption };
};

export const setCountdownLeft = (countdownLeft) => {
	return { type: "COUNTDOWN_LEFT_SET", countdownLeft };
};

export const startPerformance = (tipOption) => {
	return { type: "PERFORMANCE_START", tipOption };
};

export const finishShow = () => {
	return { type: "SHOW_FINISH" };
};

export const continueShow = () => {
	return { type: "SHOW_CONTINUE" };
};

export const addUserDanglingTokens = (username, amount) => {
	return { type: "USER_DANGLING_TOKENS_ADD", username, amount };
};

export const resetUserDanglingTokens = (username) => {
	return { type: "USER_DANGLING_TOKENS_RESET", username };
};

export const addUserTotalTokens = (username, amount) => {
	return { type: "USER_TOTAL_TOKENS_ADD", username, amount };
};

export const setUserPreference = (username, tipOption) => {
	return { type: "USER_PREFERENCE_SET", username, tipOption };
};

export const doneSendUserRateNotice = (username) => {
	return { type: "USER_RATE_NOTICE_SEND_DONE", username };
};

// saga actions

export const setTipOptionByConfig = (tipOptionConfig) => {
	return { type: "TIP_OPTION_BY_CONFIG_SET", tipOptionConfig };
};

export const setAdvancedOptions = (advancedOptionsConfig) => {
	return { type: "ADVANCED_OPTIONS_SET", advancedOptionsConfig };
};

export const receiveTip = (username, amount, message) => {
	return { type: "TIP_RECEIVE", username, amount, message };
};

export const receiveContribution = (username, amount, tipOption) => {
	return { type: "CONTRIBUTION_RECEIVE", username, amount, tipOption };
};

export const startNextPerformance = () => {
	return { type: "PERFORMANCE_NEXT_START" };
};

export const startNextPerformanceCountdown = () => {
	return { type: "PERFORMANCE_NEXT_COUNTDOWN_START" };
};

export const cancelNextPerformanceCountdown = () => {
	return { type: "PERFORMANCE_NEXT_COUNTDOWN_CANCEL" };
};
