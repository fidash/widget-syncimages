"use strict";

import * as Actions from "../../js/actions";
import * as Constants from "../../js/constants/ActionTypes";

describe("Actions", () => {
    it("visibility", () => {
        expect(Actions.toggleVisibility()).toEqual({
            type: Constants.TOGGLE_VISIBILITY
        });
    });

    xit("set images", () => {
        const publicimages = ["1", "2"], privateimages = ["3", "4"];

        expect(Actions.setImages(publicimages, privateimages)).toEqual({
            type: Constants.SET_IMAGES,
            publicimages,
            privateimages
        });
    });

    it("move public", () => {
        const from = 1, to = 2;

        expect(Actions.movePublic(from, to)).toEqual({
            type: Constants.MOVE_PUBLIC,
            from,
            to
        });
    });

    it("move private", () => {
        const from = 1, to = 2;

        expect(Actions.movePrivate(from, to)).toEqual({
            type: Constants.MOVE_PRIVATE,
            from,
            to
        });
    });

    it("set Left", () => {
        const left = 5;

        expect(Actions.setLeft(left)).toEqual({
            type: Constants.SET_CHOOSE_LEFT,
            left
        });
    });

    it("set Right", () => {
        const right = 5;

        expect(Actions.setRight(right)).toEqual({
            type: Constants.SET_CHOOSE_RIGHT,
            right
        });
    });

    it("clear", () => {
        expect(Actions.clearLR()).toEqual({
            type: Constants.CLEAR_LR
        });
    });
});
