import cb from "chaturbate";
import compare from "just-compare";
import {
	getSubjectTemplate,
	getUserDanglingTokens,
	getGoal,
	getCountdownFrom,
	getCountdownLeft,
	getPerforming,
	getGoalLeft,
	getCooldown,
	getNext,
	getChasing,
	getTokensToBeNext,
	getUserTokensToBeNext,
	getLockedTipOptions,
	getAvailableTipOptions,
	getScheduledTipOptions,
	getOnCooldownTipOptions,
	getPreviousPerformance,
} from "./selectors";

const p = (n, str) => {
	return n === 1 ? str : `${str}s`;
};

let currentSubject = null;
let currentPanel = null;

export const getPanel = () => {
	return currentPanel;
};

const getMenuTipOptionLine = (state, tipOption) => {
	const goalLeft = getGoalLeft(state, tipOption);
	const cooldown = getCooldown(state, tipOption);
	const tokensToBeNext = getTokensToBeNext(state, tipOption);

	if (goalLeft > 0) {
		return `${tipOption} (${goalLeft} ${p(goalLeft, "token")} left to unlock)`;
	}
	if (cooldown > 0) {
		return `${tipOption} (on cooldown for ${cooldown} ${p(cooldown, "round")})`;
	}
	if (tokensToBeNext === 0) {
		return `${tipOption} (next)`;
	}
	return `${tipOption} (${tokensToBeNext} ${p(tokensToBeNext, "token")} to be next)`;
};

export const sendMenuNotice = (state, username) => {
	const scheduled = getScheduledTipOptions(state);
	const onCooldown = getOnCooldownTipOptions(state);
	const locked = getLockedTipOptions(state);
	const lines = ["Menu with auction element. Whatever collects most tokens is performed next."];
	for (const tipOption of scheduled) {
		lines.push(getMenuTipOptionLine(state, tipOption));
	}
	if (onCooldown.length !== 0 || locked.length !== 0) {
		lines.push("-----");
	}
	for (const tipOption of onCooldown) {
		lines.push(getMenuTipOptionLine(state, tipOption));
	}
	for (const tipOption of locked) {
		lines.push(getMenuTipOptionLine(state, tipOption));
	}
	cb.sendNotice(lines.join("\n"), username);
};

export const sendCountdownNotice = (state) => {
	const countdownFrom = getCountdownFrom(state);
	const scheduled = getScheduledTipOptions(state);
	const lines = [`Choosing next performance in ${countdownFrom} ${p(countdownFrom, "second")}`];
	for (const tipOption of scheduled) {
		lines.push(getMenuTipOptionLine(state, tipOption));
	}
	cb.sendNotice(lines.join("\n"));
};

const getTipOptionsTipOptionLabel = (state, tipOption, username) => {
	const cooldown = getCooldown(state, tipOption);
	const tokensToBeNext = getUserTokensToBeNext(state, tipOption, username);
	const title = tipOption.match(/[ -~]+/)[0];

	if (cooldown > 0) {
		return `${title} (on cooldown for ${cooldown} ${p(cooldown, "round")})`;
	}
	if (tokensToBeNext === 0) {
		return `${title} (next)`;
	}
	return `${title} (${tokensToBeNext} ${p(tokensToBeNext, "token")} to be next)`;
};

export const getTipOptions = (state, username) => {
	const dangling = getUserDanglingTokens(state, username);
	const label = dangling === 0
		? "Vote for next performance"
		: `Priced in ${dangling} ${p(dangling, "token")} that will be added to your vote`;
	const options = getAvailableTipOptions(state)
		.map(tipOption => getTipOptionsTipOptionLabel(state, tipOption, username))
		.map(l => ({ label: l }));
	return { label, options };
};

export const updateSubject = (state) => {
	const performing = getPerforming(state);
	const subjectTemplate = getSubjectTemplate(state);

	if (performing && subjectTemplate) {
		const subject = subjectTemplate.split("{performance}").join(performing);
		if (subject !== currentSubject) {
			cb.changeRoomSubject(subject);
			currentSubject = subject;
		}
	}
};

export const drawPanel = (state) => {
	const countdownLeft = getCountdownLeft(state);
	const performing = getPerforming(state);
	const next = getNext(state);
	const chasing = getChasing(state);

	const first = countdownLeft
		? `${countdownLeft} ${p(countdownLeft, "second")} left`
		: performing || "";
	const second = next ? getMenuTipOptionLine(state, next) : "";
	const third = chasing ? getMenuTipOptionLine(state, chasing) : "";

	const panel = {
		"template": "3_rows_11_21_31",
		"row1_value": first,
		"row2_value": second,
		"row3_value": third,
	};

	if (compare(panel, currentPanel) === false) {
		currentPanel = panel;
		cb.drawPanel();
	}
};

export const sendGoalReachedNotice = (state, tipOption) => {
	const goal = getGoal(state, tipOption);
	const notice = `Goal of ${goal} ${p(goal, "token")} reached. ${tipOption} is now unlocked.`;
	cb.sendNotice(notice);
};

export const sendUserDanglingTokensNotice = (state, username) => {
	const danglingTokens = getUserDanglingTokens(state, username);
	const notice = `${danglingTokens} ${p(danglingTokens, "token")} will be added to your next vote`;
	cb.sendNotice(notice, username);
};

export const sendRateNotice = (state, username) => {
	cb.sendNotice("Please rate performance using buttons below", username);
};
