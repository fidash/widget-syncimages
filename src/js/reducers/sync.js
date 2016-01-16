"use strict";

import {CHANGE_SYNC_STATE} from "../constants/ActionTypes";

const initialState = {
    syncStates: {}
};

export default function syncStates  (state = initialState, action) {
    const {syncStates} = state;

    function addState(imageId, status) {
        let newState = {};
        newState[imageId] = status;
        return Object.assign({}, syncStates, newState);
    }

    switch (action.type) {
    case CHANGE_SYNC_STATE:
        return {
            syncStates: addState(action.imageId, action.status)
        };
    default:
        return state;
    }
}
