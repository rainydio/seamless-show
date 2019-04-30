import cb from "chaturbate";
import deepEqual from "deep-equal";
import {
	setTaxPercentage,
	setSubsidyPercentage,
	setCountdownFrom,
	setSubjectTemplate,
	setTipLabel,
	setEnabled,
	setGoal,
	removeGoal,
	setLimit,
	removeLimit,
	addTotalTokens,
	addBudgetTokens,
	removeBudgetTokens,
	addCollectedTokens,
	resetCollectedTokens,
	setShowEnding,
	setCountdownLeft,
	addPerformance,
} from "./actions";
import {
	getTaxMultiplier,
	getSubsidyMultiplier,
	getCountdownFrom,
	getBudgetTokens,
	getUnlockedTipOptions,
	getScheduledTipOptions,
	getNext,
	getByTipMessage,
	getGoalReachedNotice,
	getMenuNotice,
	getCountdownStartNotice,
	getSubject,
	getPanel,
} from "./selectors";


let prevPanel = null;
let countdownTimerId = null;

export const updateSubject = () => {
	return (dispatch, getState) => {
		const subject = getSubject(getState());
		cb.changeRoomSubject(subject);
	};
};

export const updatePanel = () => {
	return (dispatch, getState) => {
		const panel = getPanel(getState());
		if (deepEqual(panel, prevPanel) === false) {
			prevPanel = panel;
			cb.drawPanel();
		}
	};
};

export const setupTipOption = (tipOptionConfig) => {
	return (dispatch) => {
		const parts = tipOptionConfig.split(" ");
		let goal = null;
		let limitCount = null;
		let limitLength = null;
		for (let i = parts.length - 1; i >= 0; i--) {
			const part = parts[i];
			const goalMatch = part.match(/>=(\d+)/);
			const limitMatch = part.match(/(\d+)\/(\d+)/);

			if (goalMatch) {
				goal = parseInt(goalMatch[1]);
				parts.splice(i, 1);
				continue;
			}
			if (limitMatch) {
				limitCount = parseInt(limitMatch[1]);
				limitLength = parseInt(limitMatch[2]);
				parts.splice(i, 1);
				continue;
			}
		}
		const tipOption = parts.join(" ");

		dispatch(goal !== null
			? setGoal(tipOption, goal)
			: removeGoal(tipOption)
		);
		dispatch(limitCount !== null && limitLength !== null
			? setLimit(tipOption, limitCount, limitLength)
			: removeLimit(tipOption)
		);
		dispatch(setEnabled(tipOption, true));
		dispatch(updatePanel());
	};
};

export const setupAdvancedOptions = (advancedOptionsConfig) => {
	return (dispatch) => {
		const advancedOptions = advancedOptionsConfig
			.split(";")
			.map(pair => pair.split("="))
			.map(([key, value]) => ({ key, value }));

		for (const { key, value } of advancedOptions) {
			switch (key) {
				case "taxPercentage":
					dispatch(setTaxPercentage(parseFloat(value)));
					break;
				case "subsidyPercentage":
					dispatch(setSubsidyPercentage(parseFloat(value)));
					break;
				case "countdownFrom":
					dispatch(setCountdownFrom(parseInt(value)));
					break;
			}
		}
	};
};

export const loadSettings = () => {
	return (dispatch) => {
		dispatch(setupAdvancedOptions(cb.settings.advancedOptions));
		dispatch(setSubjectTemplate(cb.settings.subjectTemplate));
		dispatch(setTipLabel(cb.settings.tipLabel));

		const tipOptionConfigs = Object.keys(cb.settings)
			.filter(key => /^tipOption\d+$/.test(key))
			.filter(key => cb.settings[key])
			.map(key => cb.settings[key]);

		for (const tipOptionConfig of tipOptionConfigs) {
			dispatch(setupTipOption(tipOptionConfig));
		}
	};
};

export const receiveTip = (username, amount, message) => {
	return (dispatch, getState) => {
		const prevUnlocked = getUnlockedTipOptions(getState());
		dispatch(addTotalTokens(amount));
		const unlocked = getUnlockedTipOptions(getState());
		for (const unlockedTipOption of unlocked) {
			if (prevUnlocked.includes(unlockedTipOption) === false) {
				const notice = getGoalReachedNotice(getState(), unlockedTipOption);
				cb.sendNotice(notice);
			}
		}

		if (message !== "") {
			const tipOption = getByTipMessage(getState(), message);
			if (tipOption !== null) {
				const taxMultiplier = getTaxMultiplier(getState());
				dispatch(addCollectedTokens(tipOption, amount));
				dispatch(addBudgetTokens(amount * taxMultiplier));
			}

			dispatch(updatePanel());
		}
	};
};

export const showMenu = (username) => {
	return (dispatch, getState) => {
		const notice = getMenuNotice(getState());
		cb.sendNotice(notice, username);
	};
};

export const updateSubjectTemplate = (subjectTemplate) => {
	return (dispatch) => {
		dispatch(setSubjectTemplate(subjectTemplate));
		dispatch(updateSubject());
	};
};

export const updateTipLabel = (tipLabel) => {
	return (dispatch) => {
		dispatch(setTipLabel(tipLabel));
	};
};

export const disableTipOption = (tipOption) => {
	return (dispatch) => {
		dispatch(setEnabled(tipOption, false));
		dispatch(updatePanel());
	};
};

export const finishShow = () => {
	return (dispatch) => {
		dispatch(setShowEnding(true));
	};
};

export const continueShow = () => {
	return (dispatch) => {
		dispatch(setShowEnding(false));
	};
};

export const startPerformance = (tipOption) => {
	return (dispatch, getState) => {
		dispatch(resetCollectedTokens(tipOption));
		dispatch(addPerformance(tipOption));

		const scheduled = getScheduledTipOptions(getState());
		if (scheduled.length !== 0) {
			const budget = getBudgetTokens(getState());
			const subsidyMultiplier = getSubsidyMultiplier(getState());
			const subsidyTotal = budget * subsidyMultiplier;
			const subsidyAmount = subsidyTotal / scheduled.length;

			dispatch(removeBudgetTokens(subsidyTotal));
			for (const scheduledTipOption of scheduled) {
				dispatch(addCollectedTokens(scheduledTipOption, subsidyAmount));
			}
		}

		dispatch(updatePanel());
		dispatch(updateSubject());
	};
};

export const startNextPerformanceCountdown = () => {
	return (dispatch, getState) => {
		clearTimeout(countdownTimerId);

		const notice = getCountdownStartNotice(getState());
		cb.sendNotice(notice);

		const countdownFrom = getCountdownFrom(getState());
		const startedAt = Date.now();
		const tick = () => {
			const secondsPassed = Math.floor((Date.now() - startedAt) / 1000);
			const countdownLeft = Math.max(0, countdownFrom - secondsPassed);
			dispatch(setCountdownLeft(countdownLeft));
			if (countdownLeft === 0) {
				const next = getNext(getState());
				dispatch(startPerformance(next));
			}
			else {
				dispatch(updatePanel());
				countdownTimerId = setTimeout(tick, 250);
			}
		};

		tick();
	};
};
