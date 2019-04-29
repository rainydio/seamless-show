import memoize from "memoize-weak";

export const getInfaltionMultiplier = memoize((state) => {
	const multiplier = Math.sign(state.inflation)
		? 1 + (state.inflation / 100)
		: 1 / (1 + (state.inflation / 100));
	return multiplier;
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

export const getScenes = memoize((state) => {
	return Object.keys(state.scenes);
});

export const getGoal = memoize((state, scene) => {
	return state.scenes[scene].goal;
});

export const getMaxCount = memoize((state, scene) => {
	return state.scenes[scene].maxCount;
});

export const getMaxCountLength = memoize((state, scene) => {
	return state.scenes[scene].maxCountLength;
});

export const getTotalTokens = memoize((state) => {
	return state.totalTokens;
});

export const getCollectedTokens = memoize((state, scene) => {
	return state.collectedTokens[scene] || 0;
});

export const getPerformedAgo = memoize((state, scene) => {
	const index = state.performances.indexOf(scene);
	return index === -1 ? null : index;
});

export const getCountdownLeft = memoize((state) => {
	return state.countdownLeft;
});

export const isWrappingUp = memoize((state) => {
	return state.wrappingUp;
});

export const isSceneDisabled = memoize((state, scene) => {
	return state.disabledScenes[scene] || false;
});


export const getGoalLeft = memoize((state, scene) => {
	const totalTokens = getTotalTokens(state);
	const goal = getGoal(state, scene);
	return Math.max(0, (goal || 0) - totalTokens);
});


export const getCooldown = memoize((state, scene) => {
	const maxCount = getMaxCount(state, scene);
	const maxCountLength = getMaxCountLength(state, scene);
	if (maxCount === null || maxCountLength === null) {
		return 0;
	}

	let latestCount = 0;
	const latest = state.performances.slice(0, maxCountLength);
	for (let i = 0; i < latest.length; i++) {
		if (latest[i] === scene) {
			latestCount++;
		}
		if (latestCount === maxCount) {
			return maxCountLength - i - 1;
		}
	}
	return 0;
});

export const getLockedScenes = memoize((state) => {
	return getScenes(state)
		.filter(scene => isSceneDisabled(state, scene) === false)
		.filter(scene => getGoal(state, scene) !== null)
		.filter(scene => getGoalLeft(state, scene) > 0)
		.sort((a, b) => getGoalLeft(state, a) - getGoalLeft(state, b));
});

export const getUnlockedScenes = memoize((state) => {
	return getScenes(state)
		.filter(scene => isSceneDisabled(state, scene) === false)
		.filter(scene => getGoal(state, scene) !== null)
		.filter(scene => getGoalLeft(state, scene) === 0);
});

export const getAvailableScenes = memoize((state) => {
	return getScenes(state)
		.filter(scene => isSceneDisabled(state, scene) === false)
		.filter(scene => getGoalLeft(state, scene) === 0);
});

export const getScheduledScenes = memoize((state) => {
	return getAvailableScenes(state)
		.filter(scene => getCooldown(state, scene) === 0)
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

export const getOnCooldownScenes = memoize((state) => {
	return getAvailableScenes(state)
		.filter(scene => getCooldown(state, scene) !== 0)
		.sort((a, b) => getCooldown(state, a) - getCooldown(state, b));
});

export const getPerforming = memoize((state) => {
	return state.performances[0] || null;
});

export const getNext = memoize((state) => {
	return getScheduledScenes(state)[0];
});

export const getChasing = memoize((state) => {
	return getScheduledScenes(state)[1];
});

export const getTokensBehind = memoize((state, scene) => {
	const next = getNext(state);
	if (next === scene) {
		return 0;
	}
	const sceneCollectedTokens = getCollectedTokens(state, scene);
	const nextCollectedTokens = getCollectedTokens(state, next);
	return Math.floor(nextCollectedTokens - sceneCollectedTokens) + 1;
});

export const getByOption = memoize((state, option) => {
	option = option.replace(/\s\(.*?\)$/, "");
	const scene = getAvailableScenes(state)
		.find(item => item.indexOf(option) !== -1);
	return scene || null;
});
