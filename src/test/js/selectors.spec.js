"use strict";

import {imageSelectors} from "../../js/selectors/imageSelectors";
import {toggleVisibility, setImages, setLeft, setRight, setRegion, setRegions} from "../../js/actions/index";
import configureStore from "../../js/stores/configureStore";

describe("Selectors", () => {
    let store;
    const expecstate = (state, filter, publicimages, privateimages, left, right, equalleft, equalright, region, regions) => { // eslint-disable-line max-params
        expect(state).toEqual({
            equalleft,
            equalright,
            filter,
            privateimages,
            publicimages,
            region,
            regions,
            left,
            right
        });
    };

    beforeEach(() => {
        store = configureStore();
    });

    it("initial state is correct", () => {
        const state = imageSelectors(store.getState());

        expecstate(state, false, [], [], "", "", [], [], undefined, []);
    });

    it("filter public", () => {
        const publicimages = [{
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
        const privateimages = [{
            public: false,
            disk: 3,
            ram: 2,
            vcpus: 1,
            nodes: ["region"]
        }];

        store.dispatch(setRegions(["region"]));
        store.dispatch(toggleVisibility());
        store.dispatch(setImages(publicimages, privateimages));

        const state = imageSelectors(store.getState());

        expecstate(state, true, [{public: true, disk: 4, ram: 5, vcpus: 8, nodes: []}], privateimages, "", "", [], [], "region", ["region"]);
    });

    it("select with non exist id return empty", () => {
        const publicimages = [{
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
        const privateimages = [{
            public: false,
            id: "285",
            disk: 3,
            ram: 2,
            vcpus: 1,
            nodes: ["region"]
        }];

        store.dispatch(setRegions(["region"]));
        store.dispatch(setImages(publicimages, privateimages));
        store.dispatch(setLeft("9711"));
        store.dispatch(setRight("9711"));

        const state = imageSelectors(store.getState());

        expecstate(state, false, publicimages, privateimages, "", "", [], [], "region", ["region"]);
    });

    it("select with exist left id", () => {
        const publicimages = [{
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
        const privateimages = [{
            public: false,
            id: "285",
            disk: 3,
            ram: 2,
            vcpus: 1,
            nodes: ["region"]
        }];

        store.dispatch(setRegions(["region"]));
        store.dispatch(setImages(publicimages, privateimages));
        store.dispatch(setLeft("123"));
        store.dispatch(setRight("9711"));

        const state = imageSelectors(store.getState());

        expecstate(state, false, publicimages, privateimages, "123", "", [], ["285"], "region", ["region"]);
    });

    it("select with exist right id", () => {
        const publicimages = [{
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
        const privateimages = [{
            public: false,
            id: "285",
            disk: 3,
            ram: 2,
            vcpus: 1,
            nodes: ["region"]
        }];

        store.dispatch(setRegions(["region"]));
        store.dispatch(setImages(publicimages, privateimages));
        store.dispatch(setLeft("9711"));
        store.dispatch(setRight("285"));

        const state = imageSelectors(store.getState());

        expecstate(state, false, publicimages, privateimages, "", "285", ["123"], [], "region", ["region"]);
    });

    it("when both selected, no equal returns", () => {
        const publicimages = [{
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
        const privateimages = [{
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
        store.dispatch(setImages(publicimages, privateimages));
        store.dispatch(setLeft("345"));
        store.dispatch(setRight("285"));

        const state = imageSelectors(store.getState());

        expecstate(state, false, publicimages, privateimages, "345", "285", [], [], "region", ["region"]);
    });

    it("filter private images by region", () => {
        const publicimages = [{
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
        const privateimages = [{
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
        store.dispatch(setImages(publicimages, privateimages));
        store.dispatch(setRegion("alone"));

        let state = imageSelectors(store.getState());

        expecstate(state, false, publicimages, [privateimages[1]], "", "", [], [], "alone", ["region", "alone"]);

        store.dispatch(setRegion("region"));

        state = imageSelectors(store.getState());

        expecstate(state, false, publicimages, privateimages, "", "", [], [], "region", ["region", "alone"]);
    });

    it("filter and region", () => {
        const publicimages = [{
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
        const privateimages = [{
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
        store.dispatch(setImages(publicimages, privateimages));
        store.dispatch(toggleVisibility());

        let state = imageSelectors(store.getState());

        expecstate(state, true, [publicimages[1]], privateimages, "", "", [], [], "shared", ["shared", "region2", "region1"]);

        store.dispatch(setRegion("region1"));
        state = imageSelectors(store.getState());

        expecstate(state, true, publicimages, [privateimages[1]], "", "", [], [], "region1", ["shared", "region2", "region1"]);

    });

});
