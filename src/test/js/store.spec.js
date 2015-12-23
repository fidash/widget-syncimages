"use strict";

import configureStore from "../../js/stores/configureStore";
import {toggleVisibility} from "../../js/actions/index";

describe("Store", () => {
    let store;
    const expectstate = (filter, publicimages, privateimages, left, right, region, regions) => { // eslint-disable-line max-params
        expect(store.getState()).toEqual({
            filter,
            images: {
                publicimages,
                privateimages
            },
            select: {
                left,
                right,
                region
            },
            regions
        });
    };
    const initialvalue = () => {
        expectstate(false, [], [], "", "", "", {regions: []});
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

        expectstate(true, [], [], "", "", "", {regions: []});
    });
});
