import memoize from "memoize-weak";

const p = (n, str) => {
	return n === 1 ? str : `${str}s`;
};

export const getTaxMultiplier = memoize((state) => {
	return state.taxPercentage / 100;
});

export const getSubsidyMultiplier = memoize((state) => {
	return state.subsidyPercentage / 100;
});

export const getCountdownFrom = memoize((state) => {
	return state.countdownFrom;
});

export const getSubjectTemplate = memoize((state) => {
	return state.subjectTemplate;
});

export const getTipLabel = memoize((state) => {
	return state.tipLabel;
});

export const getTipOptions = memoize((state) => {
	return Object.keys(state.tipOptions).filter(key => state.tipOptions[key]);
});

export const getGoal = memoize((state, tipOption) => {
	return state.goals[tipOption] || 0;
});

export const getLimitCount = memoize((state, tipOption) => {
	return state.limits[tipOption]
		? state.limits[tipOption].count
		: null;
});

export const getLimitLength = memoize((state, tipOption) => {
	return state.limits[tipOption]
		? state.limits[tipOption].length
		: null;
});

export const getTotalTokens = memoize((state) => {
	return state.totalTokens;
});

export const getBudgetTokens = memoize((state) => {
	return state.budgetTokens;
});

export const getCollectedTokens = memoize((state, tipOption) => {
	return state.collectedTokens[tipOption] || 0;
});

export const getCountdownLeft = memoize((state) => {
	return state.countdownLeft;
});

export const getPerformedAgo = memoize((state, scene) => {
	const index = state.performances.indexOf(scene);
	return index === -1 ? null : index;
});

export const isShowEnding = memoize((state) => {
	return state.showEnding;
});

export const getGoalLeft = memoize((state, tipOption) => {
	const totalTokens = getTotalTokens(state);
	const goal = getGoal(state, tipOption);
	return Math.max(0, (goal || 0) - totalTokens);
});

export const getCooldown = memoize((state, scene) => {
	const limitCount = getLimitCount(state, scene);
	const limitLength = getLimitLength(state, scene);
	if (limitCount === null || limitLength === null) {
		return 0;
	}

	let latestCount = 0;
	const latest = state.performances.slice(0, limitLength);
	for (let i = 0; i < latest.length; i++) {
		if (latest[i] === scene) {
			latestCount++;
		}
		if (latestCount === limitCount) {
			return limitLength - i - 1;
		}
	}
	return 0;
});

export const getLockedTipOptions = memoize((state) => {
	return getTipOptions(state)
		.filter(tipOption => getGoal(state, tipOption) !== null)
		.filter(tipOption => getGoalLeft(state, tipOption) > 0)
		.sort((a, b) => getGoalLeft(state, a) - getGoalLeft(state, b));
});

export const getUnlockedTipOptions = memoize((state) => {
	return getTipOptions(state)
		.filter(tipOption => getGoal(state, tipOption) !== null)
		.filter(tipOption => getGoalLeft(state, tipOption) === 0);
});

export const getAvailableTipOptions = memoize((state) => {
	return getTipOptions(state)
		.filter(tipOption => getGoalLeft(state, tipOption) === 0);
});

export const getOnCooldownTipOptions = memoize((state) => {
	return getTipOptions(state)
		.filter(tipOption => getCooldown(state, tipOption) !== 0)
		.sort((a, b) => getCooldown(state, a) - getCooldown(state, b));
});

export const getScheduledTipOptions = memoize((state) => {
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
});

export const getPerforming = memoize((state) => {
	return state.performances[0] || null;
});

export const getNext = memoize((state) => {
	return getScheduledTipOptions(state)[0];
});

export const getChasing = memoize((state) => {
	return getScheduledTipOptions(state)[1];
});

export const getTokensBehind = memoize((state, tipOption) => {
	const next = getNext(state);
	if (next === tipOption) {
		return 0;
	}
	const thisCollectedTokens = getCollectedTokens(state, tipOption);
	const nextCollectedTokens = getCollectedTokens(state, next);
	return Math.floor(nextCollectedTokens - thisCollectedTokens) + 1;
});

export const getByTipMessage = memoize((state, message) => {
	const part = message.replace(/\s\(.*?\)$/, "");
	const tipOption = getAvailableTipOptions(state)
		.find(item => item.indexOf(part) !== -1);
	return tipOption || null;
});


export const getTipOptionDescription = memoize((state, tipOption, ascii = false) => {
	const goalLeft = getGoalLeft(state, tipOption);
	const cooldown = getCooldown(state, tipOption);
	const tokensBehind = getTokensBehind(state, tipOption);
	const title = ascii ? tipOption.match(/[ -~]+/)[0] : tipOption;

	if (goalLeft > 0) {
		return `${title} (${goalLeft} ${p(goalLeft, "token")} left to unlock)`;
	}
	if (cooldown > 0) {
		return `${title} (on cooldown for ${cooldown} ${p(cooldown, "round")})`;
	}
	if (tokensBehind === 0) {
		return `${title} (next)`;
	}
	return `${title} (${tokensBehind} ${p(tokensBehind, "token")} to be next)`;
});

export const getTipOptionLabels = memoize((state) => {
	return getAvailableTipOptions(state)
		.map(tipOption => getTipOptionDescription(state, tipOption, true));
});

export const getGoalReachedNotice = memoize((state, tipOption) => {
	const goal = getGoal(state, tipOption);
	return `Goal of ${goal} ${p(goal, "token")} reached. ${tipOption} is now unlocked.`;
});

export const getMenuNotice = memoize((state) => {
	const scheduled = getScheduledTipOptions(state);
	const onCooldown = getOnCooldownTipOptions(state);
	const locked = getLockedTipOptions(state);
	const lines = ["Whatever collects most tokens is performed next. Current schedule:"];
	for (const tipOption of scheduled) {
		lines.push(getTipOptionDescription(state, tipOption));
	}
	if (onCooldown.length !== 0 || locked.length !== 0) {
		lines.push("-----");
	}
	for (const tipOption of onCooldown) {
		lines.push(getTipOptionDescription(state, tipOption));
	}
	for (const tipOption of locked) {
		lines.push(getTipOptionDescription(state, tipOption));
	}
	return lines.join("\n");
});

export const getCountdownStartNotice = memoize((state) => {
	const countdownFrom = getCountdownFrom(state);
	const scheduled = getScheduledTipOptions(state);
	const lines = [`Choosing next performance in ${countdownFrom} ${p(countdownFrom, "second")}`];
	for (const tipOption of scheduled) {
		lines.push(getTipOptionDescription(state, tipOption));
	}
	return lines.join("\n");
});

export const getSubject = memoize((state) => {
	const subjectTemplate = getSubjectTemplate(state);
	const performing = getPerforming(state);
	if (performing !== null) {
		return subjectTemplate.split("{performance}").join(performing);
	}
	else {
		return "";
	}
});


export const getPanel = memoize((state) => {
	const countdownLeft = getCountdownLeft(state);
	const performing = getPerforming(state);
	const next = getNext(state);
	const chasing = getChasing(state);

	const first = countdownLeft !== 0
		? `${countdownLeft} ${p(countdownLeft, "second")} left`
		: performing || "";
	const second = next ? getTipOptionDescription(state, next) : "";
	const third = chasing ? getTipOptionDescription(state, chasing) : "";

	return {
		"template": "3_rows_11_21_31",
		"row1_value": first,
		"row2_value": second,
		"row3_value": third,
	};
});
