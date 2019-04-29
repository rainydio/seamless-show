import cb from "chaturbate";
import memoize from "memoize-weak";
import { createStore, applyMiddleware } from "redux";
import createSagaMiddleware from "redux-saga";
import reducer from "./reducer";
import saga from "./saga";
import {
	setInflation,
	setCountdownFrom,
	setTipLabel,
	setSubjectTemplate,
	setupScene,
	removeScene,
	enableScene,
	disableScene,
	setWrappingUp,
	startScene,
	startNextSceneCountdown,
	showMenu,
	receiveTip,
} from "./actions";
import {
	getTipLabel,
} from "./selectors";
import {
	getTipOptions,
	getPanel,
} from "./messages";

const count = 20;

(function () {
	cb["settings_choices"] = [];
	cb["settings_choices"].push({
		label: "Subject template",
		name: "subjectTemplate",
		type: "str",
		required: false,
		defaultValue: "{scene} | Seamless Show",
	});
	for (let i = 1; i <= count; i++) {
		cb["settings_choices"].push({
			label: String(i),
			name: "scene" + String(i),
			type: "str",
			required: false,
		});
	}
	cb["settings_choices"].push({
		label: "Tip label",
		name: "tipLabel",
		type: "str",
		required: true,
		defaultValue: "Vote for next performance",
	});
	cb["settings_choices"].push({
		label: "Countdown",
		name: "countdownFrom",
		type: "int",
		required: true,
		minValue: 15,
		defaultValue: 30,
	});
	cb["settings_choices"].push({
		label: "Inflation",
		name: "inflation",
		type: "int",
		required: true,
		defaultValue: 0,
	});
})();

const getStore = memoize(() => {
	const onError = (error, { sagaStack }) => {
		cb.sendNotice([error.message, error.stack, sagaStack].join("\n\n"), cb.room_slug);
	};
	const sagaMiddleware = createSagaMiddleware({ onError });
	const store = createStore(reducer, applyMiddleware(sagaMiddleware));
	sagaMiddleware.run(saga);
	return store;
});

cb.tipOptions(() => {
	const store = getStore();
	const label = getTipLabel(store.getState());
	const options = getTipOptions(store.getState());
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
			case "/inflation":
				store.dispatch(setInflation(parseFloat(arg)));
				break;
			case "/countdown":
				store.dispatch(setCountdownFrom(parseInt(arg)));
				break;
			case "/subject":
				store.dispatch(setSubjectTemplate(arg));
				break;
			case "/tiplabel":
				store.dispatch(setTipLabel(arg));
				break;
			case "/setup":
				store.dispatch(setupScene(arg));
				break;
			case "/remove":
				store.dispatch(removeScene(arg));
				break;
			case "/enable":
				store.dispatch(enableScene(arg));
				break;
			case "/disable":
				store.dispatch(disableScene(arg));
				break;
			case "/wrapup":
				store.dispatch(setWrappingUp(true));
				break;
			case "/continue":
				store.dispatch(setWrappingUp(false));
				break;
			case "/start":
				store.dispatch(startScene(arg));
				break;
			case "/next":
			case "/":
				store.dispatch(startNextSceneCountdown(arg));
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
