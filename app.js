import cb from "chaturbate";
import { dispatch, getState } from "./store";
import { getPanel, getTipOptions, sendMenuNotice } from "./components";
import {
	setAdvancedOptions,
	setSubjectTemplate,
	setTipOptionByConfig,
	removeTipOption,
	addContributedTokens,
	startPerformance,
	startNextPerformanceCountdown,
	cancelNextPerformanceCountdown,
	finishShow,
	continueShow,
	receiveTip,
} from "./actions";

(function () {
	cb["settings_choices"] = [];
	cb["settings_choices"].push({
		label: "Subject template",
		name: "subjectTemplate",
		type: "str",
		required: true,
		defaultValue: "{performance} | Seamless Show",
	});
	for (let i = 1; i <= 20; i++) {
		cb["settings_choices"].push({
			label: String(i),
			name: "tipOption" + ("00" + String(i)).slice(-2),
			type: "str",
			required: false,
		});
	}
	cb["settings_choices"].push({
		label: "Advanced options",
		name: "advancedOptions",
		type: "str",
		required: false,
		defaultValue: "",
	});
})();

cb.onMessage((evt) => {
	const username = evt["user"];
	const message = evt["m"];
	const mod = evt["is_mod"] || username === cb.room_slug;

	const cmd = (regexp, fn) => {
		const m = message.match(regexp);
		if (m) {
			fn(...m.slice(1));
			evt["X-Spam"] = true;
		}
	};

	if (mod) {
		cmd(/^\/config (.*)$/, (advancedOptionsConfig) => {
			dispatch(setAdvancedOptions(advancedOptionsConfig));
		});
		cmd(/^\/subject (.*)$/, (subjectTemplate) => {
			dispatch(setSubjectTemplate(subjectTemplate));
		});
		cmd(/^\/enable (.*)$/, (tipOptionConfig) => {
			dispatch(setTipOptionByConfig(tipOptionConfig));
		});
		cmd(/^\/disable (.*)$/, (tipOption) => {
			dispatch(removeTipOption(tipOption));
		});
		cmd(/^\/contribute (.*?) (\d+)$/, (tipOption, strAmount) => {
			dispatch(addContributedTokens(tipOption, parseInt(strAmount)));
		});
		cmd(/^\/start (.*?)$/, (tipOption) => {
			dispatch(startPerformance(tipOption));
		});
		cmd(/^\/next$/, () => {
			dispatch(startNextPerformanceCountdown());
		});
		cmd(/^\/$/, () => {
			dispatch(startNextPerformanceCountdown());
		});
		cmd(/^\/cancel$/, () => {
			dispatch(cancelNextPerformanceCountdown());
		});
		cmd(/^\/finish$/, () => {
			dispatch(finishShow());
		});
		cmd(/^\/continue$/, () => {
			dispatch(continueShow());
		});
	}

	cmd(/^\/menu$/, () => {
		sendMenuNotice(getState(), username);
	});
});

cb.onEnter((evt) => {
	const username = evt["user"];
	sendMenuNotice(getState(), username);
});

cb.onTip((evt) => {
	const username = evt["from_user"];
	const amount = parseInt(evt["amount"]);
	const message = evt["message"];

	dispatch(receiveTip(username, amount, message));
});

cb.tipOptions((username) => {
	return getTipOptions(getState(), username);
});

cb.onDrawPanel(() => {
	return getPanel(getState());
});
