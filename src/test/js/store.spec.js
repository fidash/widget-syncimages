"use strict";

import configureStore from "../../js/stores/configureStore";
import {toggleVisibility} from "../../js/actions/index";

describe("Store", () => {
    let store;
    const expectstate = (filter, referenceImages, ownerImages, left, right, region, regions, syncStates) => { // eslint-disable-line max-params
        expect(store.getState()).toEqual({
            filter,
            images: {
                referenceImages,
                ownerImages
            },
            select: {
                left,
                right,
                region
            },
            regions,
            syncStates
        });
    };
    const initialvalue = () => {
        expectstate(false, [], [], "", "", "", {regions: []}, {syncStates: {}});
    };

    beforeEach(() => {
        store = configureStore();
    });

    it("initial state", () => {
        initialvalue();
    });

    it("State changed", () => {
        initialvalue();
        store.dispatch(toggleVisibility());

        expectstate(true, [], [], "", "", "", {regions: []}, {syncStates: {}});
    });
});
