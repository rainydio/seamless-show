export const setTaxPercentage = (taxPercentage) => {
	return { type: "TAX_PERCENTAGE_SET", taxPercentage };
};

export const setSubsidyPercentage = (subsidyPercentage) => {
	return { type: "SUBSIDY_PERCENTAGE_SET", subsidyPercentage };
};

export const setCountdownFrom = (countdownFrom) => {
	return { type: "COUNTDOWN_FROM_SET", countdownFrom };
};

export const setSubjectTemplate = (subjectTemplate) => {
	return { type: "SUBJECT_TEMPLATE_SET", subjectTemplate };
};

export const setTipLabel = (tipLabel) => {
	return { type: "TIP_LABEL_SET", tipLabel };
};

export const setEnabled = (tipOption, enabled) => {
	return { type: "TIP_OPTION_ENABLED_SET", tipOption, enabled };
};

export const setGoal = (tipOption, goal) => {
	return { type: "GOAL_SET", tipOption, goal };
};

export const removeGoal = (tipOption) => {
	return { type: "GOAL_REMOVE", tipOption };
};

export const setLimit = (tipOption, count, length) => {
	return { type: "LIMIT_SET", tipOption, count, length };
};

export const removeLimit = (tipOption) => {
	return { type: "LIMIT_REMOVE", tipOption };
};

export const addTotalTokens = (amount) => {
	return { type: "TOTAL_TOKENS_ADD", amount };
};

export const addBudgetTokens = (amount) => {
	return { type: "BUDGET_TOKENS_ADD", amount };
};

export const removeBudgetTokens = (amount) => {
	return { type: "BUDGET_TOKENS_REMOVE", amount };
};

export const addCollectedTokens = (tipOption, amount) => {
	return { type: "COLLECTED_TOKENS_ADD", tipOption, amount };
};

export const resetCollectedTokens = (tipOption) => {
	return { type: "COLLECTED_TOKENS_RESET", tipOption };
};

export const setCountdownLeft = (countdownLeft) => {
	return { type: "COUNTDOWN_LEFT_SET", countdownLeft };
};

export const addPerformance = (tipOption) => {
	return { type: "PERFORMANCE_ADD", tipOption };
};

export const setShowEnding = (showEnding) => {
	return { type: "SHOW_ENDING_SET", showEnding };
};
