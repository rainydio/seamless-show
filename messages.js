import memoize from "memoize-weak";
import {
	getCountdownFrom,
	getSubjectTemplate,
	getAvailableScenes,
	getScheduledScenes,
	getOnCooldownScenes,
	getLockedScenes,
	getGoal,
	getGoalLeft,
	getCooldown,
	getTokensBehind,
	getPerforming,
	getNext,
	getChasing,
	getCountdownLeft,
} from "./selectors";

const p = (n, str) => {
	return n === 1 ? str : `${str}s`;
};

export const getSceneMsg = memoize((state, scene) => {
	const goalLeft = getGoalLeft(state, scene);
	const cooldown = getCooldown(state, scene);
	const tokensBehind = getTokensBehind(state, scene);

	if (goalLeft > 0) {
		return `${scene} (${goalLeft} ${p(goalLeft, "token")} left to unlock)`;
	}
	if (cooldown > 0) {
		return `${scene} (on cooldown for ${cooldown} ${p(cooldown, "round")})`;
	}
	if (tokensBehind === 0) {
		return `${scene} (next)`;
	}
	return `${scene} (${tokensBehind} ${p(tokensBehind, "token")} to be next)`;
});

export const getTipOptionMsg = memoize((state, scene) => {
	const cooldown = getCooldown(state, scene);
	const tokensBehind = getTokensBehind(state, scene);
	const asciiTitle = scene.match(/[ -~]+/)[0];

	if (cooldown > 0) {
		return `${asciiTitle} (on cooldown for ${cooldown} ${p(cooldown, "round")})`;
	}
	if (tokensBehind === 0) {
		return `${asciiTitle} (next)`;
	}
	return `${asciiTitle} (${tokensBehind} ${p(tokensBehind, "token")} to be next)`;
});

export const getTipOptions = memoize((state) => {
	return getAvailableScenes(state)
		.map(scene => getTipOptionMsg(state, scene))
		.map(scene => scene.replace(/[^\w\s\d()]/).trim())
		.map(option => ({ label: option }));
});

export const getGoalReachedMsg = memoize((state, scene) => {
	const goal = getGoal(state, scene);
	return `Goal of ${goal} ${p(goal, "token")} reached. ${scene} is now unlocked.`;
});

export const getCountdownStartMsg = memoize((state) => {
	const countdownFrom = getCountdownFrom(state);
	const scheduled = getScheduledScenes(state);
	const lines = [`Choosing next performance in ${countdownFrom} ${p(countdownFrom, "second")}`];
	for (const scene of scheduled) {
		lines.push(getSceneMsg(state, scene));
	}
	const msg = lines.join("\n");
	return msg;
});

export const getMenuMsg = memoize((state) => {
	const scheduled = getScheduledScenes(state);
	const onCooldown = getOnCooldownScenes(state);
	const locked = getLockedScenes(state);
	const lines = ["Whatever collects most tokens is performed next. Current schedule:"];
	for (const scene of scheduled) {
		lines.push(getSceneMsg(state, scene));
	}
	if (onCooldown.length !== 0 || locked.length !== 0) {
		lines.push("-----");
	}
	for (const scene of onCooldown) {
		lines.push(getSceneMsg(state, scene));
	}
	for (const scene of locked) {
		lines.push(getSceneMsg(state, scene));
	}
	const msg = lines.join("\n");
	return msg;
});

export const getPanel = memoize((state) => {
	const countdownLeft = getCountdownLeft(state);
	const performing = getPerforming(state);
	const next = getNext(state);
	const chasing = getChasing(state);

	const first = countdownLeft !== 0
		? `${countdownLeft} ${p(countdownLeft, "second")} left`
		: performing || "";
	const second = next ? getSceneMsg(state, next) : "";
	const third = chasing ? getSceneMsg(state, chasing) : "";

	return {
		"template": "3_rows_11_21_31",
		"row1_value": first,
		"row2_value": second,
		"row3_value": third,
	};
});

export const getSubjectMsg = memoize((state) => {
	const subjectTemplate = getSubjectTemplate(state);
	const performing = getPerforming(state);
	if (performing !== null) {
		return subjectTemplate.split("{scene}").join(performing);
	}
	else {
		return "";
	}
});
