"use strict";

import hider from "../../js/reducers/hider";
import select from "../../js/reducers/select";
import images from "../../js/reducers/images";
import rootReducer from "../../js/reducers/index";
import {toggleVisibility, setLeft, setRight, setRegion, clearLR, setImages, movePublic, movePrivate} from "../../js/actions";
import nactions from "./nactions";

describe("hider reducer", () => {
    xit("initial state is false", () => {
        expect(nactions(hider)).toBeFalsy();
    });

    xit("no change in unknown action", () => {
        expect(nactions(hider, ["NOEXIST"])).toEqual(nactions(hider));
    });

    xit("one toggle to true", () => {
        expect(nactions(hider, [toggleVisibility()])).toBeTruthy();
    });

    xit("n toggles works", () => {
        expect(nactions(hider, [toggleVisibility(), toggleVisibility()])).toBeFalsy();
        expect(nactions(hider, [toggleVisibility(), toggleVisibility(), toggleVisibility()])).toBeTruthy();
    });
});

describe("select reducer", () => {
    xit("initial state is correct", () => {
        expect(nactions(select)).toEqual({
            left: "",
            right: "",
            region: ""
        });
    });

    xit("no change in unknown action", () => {
        expect(nactions(select, ["NOEXIST"])).toEqual(nactions(select));
    });

    xit("choose_left", () => {
        const left = "choosen";

        expect(nactions(select, [setLeft(left)])).toEqual({
            left,
            right: "",
            region: ""
        });
    });

    xit("choose_right", () => {
        const right = "choosen";

        expect(nactions(select, [setRight(right)])).toEqual({
            right,
            left: "",
            region: ""
        });
    });

    xit("choose both", () => {
        const left = "left value", right = "right value!";

        expect(nactions(select, [setRight(right), setLeft(left)])).toEqual({
            left,
            right,
            region: ""
        });

        expect(nactions(select, [setLeft(left), setRight(right)])).toEqual({
            left,
            right,
            region: ""
        });
    });

    xit("clearLR", () => {
        const left = "LV", right = "RV", empty = {left: "", right: "", region: ""};

        expect(nactions(select, [setLeft(left), clearLR()])).toEqual(empty);
        expect(nactions(select, [setRight(right), clearLR()])).toEqual(empty);
        expect(nactions(select, [setLeft(left), setRight(right), clearLR()])).toEqual(empty);
    });
});

describe("images reducer", () => {
    xit("Initial state is correct", () => {
        expect(nactions(images)).toEqual({
            privateimages: [],
            publicimages: []
        });
    });

    xit("No change in unknown action", () => {
        expect(nactions(images, ["NOEXIST"])).toEqual(nactions(images));
    });

    xit("Set images", () => {
        const publicimages = [1, 2], privateimages = [3, 4];

        expect(nactions(images, [setImages(publicimages, privateimages)])).toEqual({
            publicimages,
            privateimages
        });
    });

    xit("movePrivate", () => {
        const publicimages = [9, 7, 1, 1], privateimages = [1, 2, 3, 4];

        expect(nactions(images, [
            setImages(publicimages, privateimages),
            movePrivate(2, 1)
        ])).toEqual({
            publicimages,
            privateimages: [1, 3, 2, 4]
        });

        expect(nactions(images, [
            setImages(publicimages, privateimages),
            movePrivate(0, 3)
        ])).toEqual({
            publicimages,
            privateimages: [2, 3, 4, 1]
        });
    });

    xit("movePublic", () => {
        const privateimages = [9, 7, 1, 1], publicimages = [1, 2, 3, 4];

        expect(nactions(images, [
            setImages(publicimages, privateimages),
            movePublic(1, 2)
        ])).toEqual({
            publicimages: [1, 3, 2, 4],
            privateimages
        });

        expect(nactions(images, [
            setImages(publicimages, privateimages),
            movePublic(3, 0)
        ])).toEqual({
            publicimages: [4, 1, 2, 3],
            privateimages
        });
    });

    xit("move private out of range", () => {
        const publicimages = [9, 7, 1, 1], privateimages = [1, 2, 3, 4];

        expect(nactions(images, [
            setImages(publicimages, privateimages),
            movePrivate(-1, 2)
        ])).toEqual({
            publicimages,
            privateimages
        });

        expect(nactions(images, [
            setImages(publicimages, privateimages),
            movePrivate(0, 4)
        ])).toEqual({
            publicimages,
            privateimages
        });

        expect(nactions(images, [
            setImages(publicimages, privateimages),
            movePrivate(-10000, 10000)
        ])).toEqual({
            publicimages,
            privateimages
        });
    });

    xit("move public out of range", () => {
        const publicimages = [9, 7, 1, 1], privateimages = [1, 2, 3, 4];

        expect(nactions(images, [
            setImages(publicimages, privateimages),
            movePublic(-1, 2)
        ])).toEqual({
            publicimages,
            privateimages
        });

        expect(nactions(images, [
            setImages(publicimages, privateimages),
            movePublic(0, 4)
        ])).toEqual({
            publicimages,
            privateimages
        });

        expect(nactions(images, [
            setImages(publicimages, privateimages),
            movePublic(-10000, 10000)
        ])).toEqual({
            publicimages,
            privateimages
        });
    });
});


describe("root reducer", () => {
    const filter = false, imagesdef = {publicimages: [], privateimages: []}, selectdef = {left: "", right: "", region: ""};
    const regions = {regions: []};

    xit("default value is correct", () => {
        expect(nactions(rootReducer)).toEqual({
            filter,
            images: imagesdef,
            select: selectdef,
            regions: regions
        });
    });

    xit("No change in unknown action", () => {
        expect(nactions(rootReducer, ["NOEXIST"])).toEqual(nactions(rootReducer));
    });

    xit("filter", () => {
        expect(nactions(rootReducer, [toggleVisibility(), toggleVisibility(), toggleVisibility()])).toEqual({
            images: imagesdef,
            select: selectdef,
            filter: true,
            regions: {regions: []}
        });
    });

    xit("select", () => {
        const left = "LEFTV", right = "RIGHTV";

        expect(nactions(rootReducer, [setLeft(left), setRight(right)])).toEqual({
            filter,
            images: imagesdef,
            select: {
                left,
                right,
                region: ""
            },
            regions: {regions: []}
        });
    });

    xit("images", () => {
        const publicimages = [1, 2], privateimages = [3, 4];

        expect(nactions(rootReducer, [setImages(publicimages, privateimages)])).toEqual({
            filter,
            select: selectdef,
            images: {
                publicimages,
                privateimages
            },
            regions: {regions: []}
        });
    });

    xit("set region", () => {
        const left = "", right = "", region = "myregion";

        expect(nactions(rootReducer, [setRegion(region)])).toEqual({
            filter,
            images: imagesdef,
            select: {
                left,
                right,
                region: region
            },
            regions: {regions: []}
        });
    });


    xit("All", () => {
        const left = "LEFTV", right = "RIGHTV";
        const publicimages = [1, 2], privateimages = [3, 4];

        expect(nactions(rootReducer, [
            toggleVisibility(),
            setRight(right),
            setImages(publicimages, privateimages),
            toggleVisibility(),
            setLeft(left),
            toggleVisibility()
        ])).toEqual({
            filter: true,
            select: {
                left,
                right,
                region: ""
            },
            images: {
                publicimages,
                privateimages
            },
            regions: {regions: []}
        });
    });

});
