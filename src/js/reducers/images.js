"use strict";

import {SET_IMAGES, MOVE_PUBLIC, MOVE_PRIVATE, SYNC_IMAGE} from "../constants/ActionTypes";

const initialState = {
    privateimages: [],
    publicimages: []
};

function move(from, to, list) {
    if (from < 0 || from >= list.length || to < 0 || to >= list.length) {
        return list;
    }
    const elem = list[from];
    const newlist = [...list.slice(0, from), ...list.slice(from + 1)];

    return [...newlist.slice(0, to), elem, ...newlist.slice(to)];
}

function getIndexById(id, list) {
    let index = -1;
    for (let i = 0, found = false; i<list.length && !found; i++) {
        if (list[i].id === id) {
            found = true;
            index = i;
        }
    }

    return index;
}

export default function images(state = initialState, action) {
    const {privateimages, publicimages} = state;

    switch (action.type) {
    case SET_IMAGES:
        return {
            privateimages: action.privateimages,
            publicimages: action.publicimages
        };
    case MOVE_PRIVATE:
        return {
            publicimages,
            privateimages: move(action.from, action.to, privateimages)
        };
    case MOVE_PUBLIC:
        return {
            privateimages,
            publicimages: move(action.from, action.to, publicimages)
        };
    case SYNC_IMAGE:
        return {
            publicimages,
            privateimages: action.privateList
        };
    default:
        return state;
    }
}
