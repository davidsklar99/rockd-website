import "babel-polyfill";
import "@blueprintjs/core/lib/css/blueprint.css";
import { FocusStyleManager } from "@blueprintjs/core";
import h from "@macrostrat/hyper";

FocusStyleManager.onlyShowFocusOnTabs();

import { render } from "react-dom";
import { Provider } from "react-redux";
import { createStore, compose } from "redux";
import reducers from "./map-interface/reducers";
import { Action } from "./map-interface/reducers/actions";
import App from "./app";

const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;

type AppState = any;

// Create the data store
let store = createStore<AppState, Action, any, any>(
  reducers,
  composeEnhancers()
);

// Render the application
render(h(Provider, { store }, h(App)), document.getElementById("react"));
