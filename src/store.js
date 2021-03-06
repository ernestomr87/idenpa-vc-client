import { createStore, applyMiddleware, compose } from 'redux';
import { routerMiddleware } from 'react-router-redux';
import createSagaMiddleware from 'redux-saga';
import createReducer from './reducers';

const sagaMiddleware = createSagaMiddleware();

export default function configureStore(initialState = {}, history) {
	const middlewares = [ sagaMiddleware, routerMiddleware(history) ];
	const enhancers = [ applyMiddleware(...middlewares) ];

	const composeEnhancers =
		process.env.NODE_ENV !== 'production' &&
		typeof window === 'object' &&
		window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__
			? window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__({
					shouldHotReload: false
				})
			: compose;

	const store = createStore(createReducer(), initialState, composeEnhancers(...enhancers));

	store.runSaga = sagaMiddleware.run;
	store.injectedReducers = {};
	store.injectedSagas = {};

	if (module.hot) {
		module.hot.accept('./reducers', () => store.replaceReducer(store.injectedReducers));
	}

	return store;
}
