"use strict";

import {imageSelectors} from "../../js/selectors/imageSelectors";
import {toggleVisibility, setImages, setLeft, setRight, setRegion, setRegions} from "../../js/actions/index";
import configureStore from "../../js/stores/configureStore";

describe("Selectors", () => {
    let store;
    const expecstate = (state, filter, referenceImages, ownerImages, left, right, equalleft, equalright, region, regions) => { // eslint-disable-line max-params
        expect(state).toEqual({
            equalleft,
            equalright,
            filter,
            ownerImages,
            referenceImages,
            region,
            regions,
            left,
            right
        });
    };

    beforeEach(() => {
        store = configureStore();
    });

    xit("initial state is correct", () => {
        const state = imageSelectors(store.getState());

        expecstate(state, false, [], [], "", "", [], [], undefined, []);
    });

    xit("filter public", () => {
        const referenceImages = [{
            public: true,
            disk: 3,
            ram: 2,
            vcpus: 1,
            nodes: []
        }, {
            public: true,
            disk: 4,
            ram: 5,
            vcpus: 8,
            nodes: []
        }];
        const ownerImages = [{
            public: false,
            disk: 3,
            ram: 2,
            vcpus: 1,
            nodes: ["region"]
        }];

        store.dispatch(setRegions(["region"]));
        store.dispatch(toggleVisibility());
        store.dispatch(setImages(referenceImages, ownerImages));

        const state = imageSelectors(store.getState());

        expecstate(state, true, [{public: true, disk: 4, ram: 5, vcpus: 8, nodes: []}], ownerImages, "", "", [], [], "region", ["region"]);
    });

    xit("select with non exist id return empty", () => {
        const referenceImages = [{
            public: true,
            id: "123",
            disk: 3,
            ram: 2,
            vcpus: 1,
            nodes: []
        }, {
            public: true,
            id: "345",
            disk: 4,
            ram: 5,
            vcpus: 8,
            nodes: []
        }];
        const ownerImages = [{
            public: false,
            id: "285",
            disk: 3,
            ram: 2,
            vcpus: 1,
            nodes: ["region"]
        }];

        store.dispatch(setRegions(["region"]));
        store.dispatch(setImages(referenceImages, ownerImages));
        store.dispatch(setLeft("9711"));
        store.dispatch(setRight("9711"));

        const state = imageSelectors(store.getState());

        expecstate(state, false, referenceImages, ownerImages, "", "", [], [], "region", ["region"]);
    });

    xit("select with exist left id", () => {
        const referenceImages = [{
            public: true,
            id: "123",
            disk: 3,
            ram: 2,
            vcpus: 1,
            nodes: []
        }, {
            public: true,
            id: "345",
            disk: 4,
            ram: 5,
            vcpus: 8,
            nodes: []
        }];
        const ownerImages = [{
            public: false,
            id: "285",
            disk: 3,
            ram: 2,
            vcpus: 1,
            nodes: ["region"]
        }];

        store.dispatch(setRegions(["region"]));
        store.dispatch(setImages(referenceImages, ownerImages));
        store.dispatch(setLeft("123"));
        store.dispatch(setRight("9711"));

        const state = imageSelectors(store.getState());

        expecstate(state, false, referenceImages, ownerImages, "123", "", [], ["285"], "region", ["region"]);
    });

    xit("select with exist right id", () => {
        const referenceImages = [{
            public: true,
            id: "123",
            disk: 3,
            ram: 2,
            vcpus: 1,
            nodes: []
        }, {
            public: true,
            id: "345",
            disk: 4,
            ram: 5,
            vcpus: 8,
            nodes: []
        }];
        const ownerImages = [{
            public: false,
            id: "285",
            disk: 3,
            ram: 2,
            vcpus: 1,
            nodes: ["region"]
        }];

        store.dispatch(setRegions(["region"]));
        store.dispatch(setImages(referenceImages, ownerImages));
        store.dispatch(setLeft("9711"));
        store.dispatch(setRight("285"));

        const state = imageSelectors(store.getState());

        expecstate(state, false, referenceImages, ownerImages, "", "285", ["123"], [], "region", ["region"]);
    });

    xit("when both selected, no equal returns", () => {
        const referenceImages = [{
            public: true,
            id: "123",
            disk: 3,
            ram: 2,
            vcpus: 1,
            nodes: []
        }, {
            public: true,
            id: "345",
            disk: 4,
            ram: 5,
            vcpus: 8,
            nodes: []
        }];
        const ownerImages = [{
            public: false,
            id: "285",
            disk: 3,
            ram: 2,
            vcpus: 1,
            nodes: ["region"]
        }, {
            public: false,
            id: "543",
            disk: 4,
            ram: 5,
            vcpus: 8,
            nodes: ["region"]
        }];

        store.dispatch(setRegions(["region"]));
        store.dispatch(setImages(referenceImages, ownerImages));
        store.dispatch(setLeft("345"));
        store.dispatch(setRight("285"));

        const state = imageSelectors(store.getState());

        expecstate(state, false, referenceImages, ownerImages, "345", "285", [], [], "region", ["region"]);
    });

    xit("filter private images by region", () => {
        const referenceImages = [{
            public: true,
            id: "123",
            disk: 3,
            ram: 2,
            vcpus: 1,
            nodes: []
        }, {
            public: true,
            id: "345",
            disk: 4,
            ram: 5,
            vcpus: 8,
            nodes: []
        }];
        const ownerImages = [{
            public: false,
            id: "285",
            disk: 3,
            ram: 2,
            vcpus: 1,
            nodes: ["region"]
        }, {
            public: false,
            id: "543",
            disk: 4,
            ram: 5,
            vcpus: 8,
            nodes: ["region", "alone"]
        }];

        store.dispatch(setRegions(["region", "alone"]));
        store.dispatch(setImages(referenceImages, ownerImages));
        store.dispatch(setRegion("alone"));

        let state = imageSelectors(store.getState());

        expecstate(state, false, referenceImages, [ownerImages[1]], "", "", [], [], "alone", ["region", "alone"]);

        store.dispatch(setRegion("region"));

        state = imageSelectors(store.getState());

        expecstate(state, false, referenceImages, ownerImages, "", "", [], [], "region", ["region", "alone"]);
    });

    xit("filter and region", () => {
        const referenceImages = [{
            public: true,
            id: "123",
            disk: 3,
            ram: 2,
            vcpus: 1,
            nodes: ["region1"]
        }, {
            public: true,
            id: "345",
            disk: 4,
            ram: 5,
            vcpus: 8,
            nodes: ["region2"]
        }];
        const ownerImages = [{
            public: false,
            id: "1234",
            disk: 3,
            ram: 2,
            vcpus: 1,
            nodes: ["shared", "region2"]
        }, {
            public: false,
            id: "285",
            disk: 3,
            ram: 123,
            vcpus: 1,
            nodes: ["shared", "region1"]
        }];

        store.dispatch(setRegions(["shared", "region2", "region1"]));
        store.dispatch(setImages(referenceImages, ownerImages));
        store.dispatch(toggleVisibility());

        let state = imageSelectors(store.getState());

        expecstate(state, true, [referenceImages[1]], ownerImages, "", "", [], [], "shared", ["shared", "region2", "region1"]);

        store.dispatch(setRegion("region1"));
        state = imageSelectors(store.getState());

        expecstate(state, true, referenceImages, [ownerImages[1]], "", "", [], [], "region1", ["shared", "region2", "region1"]);

    });

});
