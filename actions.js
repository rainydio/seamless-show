export const setInflation = (inflation) => {
	return { type: "INFLATION_SET", inflation };
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

export const setScene = (scene, goal = null, maxCount = null, maxCountLength = null) => {
	return { type: "SCENE_SET", scene, goal, maxCount, maxCountLength };
};

export const removeScene = (scene) => {
	return { type: "SCENE_REMOVE", scene };
};

export const addTotalTokens = (amount) => {
	return { type: "TOTAL_TOKENS_ADD", amount };
};

export const addCollectedTokens = (scene, amount) => {
	return { type: "COLLECTED_TOKENS_ADD", scene, amount };
};

export const resetCollectedTokens = (scene) => {
	return { type: "COLLECTED_TOKENS_RESET", scene };
};

export const addPerformance = (scene) => {
	return { type: "PERFORMANCE_ADD", scene };
};

export const setCountdownLeft = (countdownLeft) => {
	return { type: "COUNTDOWN_LEFT_SET", countdownLeft };
};

export const setWrappingUp = (wrappingUp) => {
	return { type: "WRAPPING_UP_SET", wrappingUp };
};

export const disableScene = (scene) => {
	return { type: "SCENE_DISABLE", scene };
};

export const enableScene = (scene) => {
	return { type: "SCENE_ENABLE", scene };
};

export const setupScene = (sceneConfig) => {
	return { type: "SCENE_SETUP", sceneConfig };
};


export const startScene = (scene) => {
	return { type: "SCENE_START", scene };
};

export const startNextSceneCountdown = () => {
	return { type: "SCENE_NEXT_COUNTDOWN_START" };
};

export const showMenu = (username) => {
	return { type: "MENU_SHOW", username };
};

export const receiveTip = (username, amount, message) => {
	return { type: "TIP_RECEIVE", username, amount, message };
};
