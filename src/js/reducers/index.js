"use strict";

import {combineReducers} from "redux";
import hider from "./hider";
import images from "./images";
import select from "./select";
import regions from "./regions";
import syncStates from "./sync";

const rootReducer = combineReducers({
    filter: hider,
    images,
    select,
    regions,
    syncStates
});

export default rootReducer;
