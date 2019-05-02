export const getEmaLength = (state) => {
	return state.emaLength;
};

export const getInflation = (state) => {
	return state.inflation;
};

export const getCountdownFrom = (state) => {
	return state.countdownFrom;
};

export const getSubjectTemplate = (state) => {
	return state.subjectTemplate;
};

export const getTipOptions = (state) => {
	return Object.keys(state.tipOptions);
};

export const getGoal = (state, tipOption) => {
	return state.tipOptions[tipOption].goal;
};

export const getLimit = (state, tipOption) => {
	return state.tipOptions[tipOption].limit;
};

export const getLimitLength = (state, tipOption) => {
	return state.tipOptions[tipOption].limitLength;
};

export const getTotalTokens = (state) => {
	return state.totalTokens;
};

export const getDanglingTokens = (state, username) => {
	return state.danglingTokens[username] || 0;
};

export const getContributedTokens = (state, tipOption) => {
	return state.contributedTokens[tipOption] || 0;
};

export const getRoundContributedTokens = (state) => {
	return state.roundContributedTokens;
};

export const getEmaContributedTokens = (state) => {
	return state.emaContributedTokens;
};

export const getSubsidizedTokens = (state, tipOption) => {
	return state.subsidizedTokens[tipOption] || 0;
};

export const getCountdownLeft = (state) => {
	return state.countdownLeft;
};

export const getPerforming = (state) => {
	return state.performances[0] || null;
};

export const getPerformedAgo = (state, tipOption) => {
	const index = state.performances.indexOf(tipOption);
	return index === -1 ? null : index;
};

export const isShowEnding = (state) => {
	return state.showEnding;
};

export const getTipOptionByTipMessage = (state, message) => {
	if (!message) {
		return null;
	}

	const tipOptionPart = message.replace(/\s\(.*?\)$/, "");
	const foundTipOption = getTipOptions(state)
		.find(tipOption => tipOption.indexOf(tipOptionPart) !== -1);
	return foundTipOption || null;
};

// computed

export const getCollectedTokens = (state, tipOption) => {
	return getContributedTokens(state, tipOption) + getSubsidizedTokens(state, tipOption);
};

export const getCooldown = (state, tipOption) => {
	const limit = getLimit(state, tipOption);
	const limitLength = getLimitLength(state, tipOption);
	if (limit === null || limitLength === null) {
		return 0;
	}
	let latestCount = 0;
	const latest = state.performances.slice(0, limitLength);
	for (let i = 0; i < latest.length; i++) {
		if (latest[i] === tipOption) {
			latestCount++;
		}
		if (latestCount === limit) {
			return limitLength - i - 1;
		}
	}
	return 0;
};

export const getGoalLeft = (state, tipOption) => {
	const totalTokens = getTotalTokens(state);
	const goal = getGoal(state, tipOption);
	return Math.max(0, goal - totalTokens);
};

export const getJustUnlockedTipOptions = (state, tipAmount) => {
	const totalTokens = getTotalTokens(state);
	return getTipOptions(state)
		.filter(tipOption => getGoalLeft(state, tipOption) === 0)
		.filter(tipOption => getGoal(state, tipOption) !== null)
		.filter(tipOption => getGoal(state, tipOption) > totalTokens - tipAmount);
};

export const getWithoutContributionsTipOptions = (state) => {
	return getTipOptions(state).filter(tipOption => getContributedTokens(state, tipOption) === 0);
};

export const getLockedTipOptions = (state) => {
	return getTipOptions(state).filter(tipOption => getGoalLeft(state, tipOption) !== 0);
};

export const getAvailableTipOptions = (state) => {
	return getTipOptions(state).filter(tipOption => getGoalLeft(state, tipOption) === 0);
};

export const getOnCooldownTipOptions = (state) => {
	return getTipOptions(state).filter(tipOption => getCooldown(state, tipOption) !== 0);
};

export const getScheduledTipOptions = (state) => {
	return getTipOptions(state)
		.filter(tipOption => getGoalLeft(state, tipOption) === 0)
		.filter(tipOption => getCooldown(state, tipOption) === 0)
		.sort((a, b) => {
			const collectedTokensA = getCollectedTokens(state, a);
			const collectedTokensB = getCollectedTokens(state, b);
			if (collectedTokensB !== collectedTokensA) {
				return collectedTokensB - collectedTokensA;
			}

			const performedAgoA = getPerformedAgo(state, a);
			const performedAgoB = getPerformedAgo(state, b);
			if (performedAgoA !== null && performedAgoB !== null) {
				return performedAgoB - performedAgoA;
			}
			if (performedAgoA === null) {
				return -1;
			}
			if (performedAgoB === null) {
				return 1;
			}
			return 0;
		});
};

export const getNext = (state) => {
	return getScheduledTipOptions(state)[0] || null;
};

export const getChasing = (state) => {
	return getScheduledTipOptions(state)[1] || null;
};

export const getTokensToBeNext = (state, tipOption) => {
	const next = getNext(state);
	if (next === tipOption) {
		return 0;
	}
	const thisCollectedTokens = getCollectedTokens(state, tipOption);
	const nextCollectedTokens = getCollectedTokens(state, next);
	return Math.floor(nextCollectedTokens - thisCollectedTokens) + 1;
};

export const getUserTokensToBeNext = (state, tipOption, username) => {
	const tokensToBeNext = getTokensToBeNext(state, tipOption);
	if (tokensToBeNext === 0) {
		return 0;
	}
	const danglingTokens = getDanglingTokens(state, username);
	return Math.max(1, tokensToBeNext - danglingTokens);
};
