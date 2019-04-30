import cb from "chaturbate";
import memoize from "memoize-weak";
import { createStore, applyMiddleware } from "redux";
import thunk from "redux-thunk";
import reducer from "./reducer";
import { getTipLabel, getTipOptionLabels, getPanel } from "./selectors";
import {
	loadSettings,
	receiveTip,
	showMenu,
	setupAdvancedOptions,
	setupTipOption,
	updateSubjectTemplate,
	updateTipLabel,
	disableTipOption,
	finishShow,
	continueShow,
	startPerformance,
	startNextPerformanceCountdown,
} from "./thunks";

const count = 20;

(function () {
	cb["settings_choices"] = [];
	cb["settings_choices"].push({
		label: "Subject template",
		name: "subjectTemplate",
		type: "str",
		required: true,
		defaultValue: "{performance} | Seamless Show",
	});
	cb["settings_choices"].push({
		label: "Tip label",
		name: "tipLabel",
		type: "str",
		required: true,
		defaultValue: "Vote for next performance",
	});
	for (let i = 1; i <= count; i++) {
		cb["settings_choices"].push({
			label: String(i),
			name: "tipOption" + String(i),
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

const getStore = memoize(() => {
	const store = createStore(reducer, applyMiddleware(thunk));
	store.dispatch(loadSettings());
	return store;
});

cb.tipOptions(() => {
	const store = getStore();
	const label = getTipLabel(store.getState());
	const options = getTipOptionLabels(store.getState()).map(l => ({ label: l }));
	return { label, options };
});

cb.onTip((evt) => {
	const store = getStore();
	const username = evt["from_user"];
	const amount = parseInt(evt["amount"]);
	const message = evt["message"];

	store.dispatch(receiveTip(username, amount, message));
});

cb.onEnter((evt) => {
	const store = getStore();
	const username = evt["user"];

	store.dispatch(showMenu(username));
});


cb.onMessage((evt) => {
	const store = getStore();
	const username = evt["user"];
	const message = evt["m"];
	const mod = evt["is_mod"] || username === cb.room_slug;
	const cmdMatch = message.match(/(^\/[a-zA-Z0-9]*)(\s.*$|$)/);
	const cmd = cmdMatch ? cmdMatch[1].trim() : null;
	const arg = cmdMatch ? cmdMatch[2].slice(1) : null;

	if (mod && cmd) {
		evt["X-Spam"] = true;

		switch (cmd) {
			case "/config":
				store.dispatch(setupAdvancedOptions(arg));
				break;
			case "/subject":
				store.dispatch(updateSubjectTemplate(arg));
				break;
			case "/tiplabel":
				store.dispatch(updateTipLabel(arg));
				break;
			case "/enable":
				store.dispatch(setupTipOption(arg));
				break;
			case "/disable":
				store.dispatch(disableTipOption(arg));
				break;
			case "/finish":
				store.dispatch(finishShow());
				break;
			case "/continue":
				store.dispatch(continueShow());
				break;
			case "/start":
				store.dispatch(startPerformance(arg));
				break;
			case "/next":
			case "/":
				store.dispatch(startNextPerformanceCountdown(arg));
				break;
			default:
				evt["X-Spam"] = false;
		}
	}

	if (cmd === "/menu" || cmd === "/tipmenu") {
		store.dispatch(showMenu(username));
		evt["X-Spam"] = true;
	}
});

cb.onDrawPanel(() => {
	const store = getStore();
	const panel = getPanel(store.getState());
	return panel;
});
