import cb from "chaturbate";
import once from "just-once";
import { createStore, applyMiddleware } from "redux";
import createSagaMiddleware from "redux-saga";
import reducer from "./reducer";
import saga from "./saga";

const onError = (error, { sagaStack }) => {
	cb.sendNotice([error.message, error.stack, sagaStack].join("\n\n"), cb.room_slug);
};

const configureStore = once(() => {
	const sagaMiddleware = createSagaMiddleware({ onError });
	const store = createStore(reducer, applyMiddleware(sagaMiddleware));
	sagaMiddleware.run(saga);
	return store;
});

export const getState = () => {
	const store = configureStore();
	return store.getState();
};

export const dispatch = (action) => {
	const store = configureStore();
	store.dispatch(action);
};
