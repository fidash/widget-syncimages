"use strict";

import {SET_IMAGES, MOVE_PUBLIC, MOVE_PRIVATE} from "../constants/ActionTypes";

const initialState = {
    ownerImages: [],
    referenceImages: []
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
    const {ownerImages, referenceImages} = state;

    switch (action.type) {
    case SET_IMAGES:
        return {
            referenceImages: action.referenceImages,
            ownerImages: action.ownerImages
        };
    case MOVE_PRIVATE:
        return {
            referenceImages,
            ownerImages: move(action.from, action.to, ownerImages)
        };
    case MOVE_PUBLIC:
        return {
            ownerImages,
            referenceImages: move(action.from, action.to, referenceImages)
        };
    default:
        return state;
    }
}
