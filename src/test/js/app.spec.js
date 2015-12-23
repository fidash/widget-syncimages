"use strict";

import React from "react";
import TestUtils from "react-addons-test-utils";
import configureStore from "../../js/stores/configureStore";
import {setImages, setLeft, setRight} from "../../js/actions";
import App from "../../js/containers/App";

const MockMP = window.MockMP;

function setup(store) {
    const instance = TestUtils.renderIntoDocument(<App store={store} />);

    return {
        instance,
        app: instance.refs.wrappedInstance
    };
    // const renderer = TestUtils.createRenderer();

    // renderer.render(<App store={store} />);
    // const instance = renderer.getRenderOutput();

    // return {
    //     instance
    // };
}

describe("App container", () => {
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

    beforeAll(() => {
        store = configureStore();
        window.MashupPlatform = new MockMP.MockMP();
    });

    xit("MashupPlatform http is called", () => {
        const spy = jasmine.createSpy("makeRequest");

        window.MashupPlatform.http = {
            makeRequest: spy
        };

        setup(store);

        expect(spy).toHaveBeenCalled();
    });

    xit("On http error, lists are cleared", done => {
        const publicimages = [{
            public: true,
            id: "123",
            disk: 3,
            ram: 2,
            vcpus: 1,
            nodes: ["region"]
        }, {
            public: true,
            id: "345",
            disk: 4,
            ram: 5,
            vcpus: 8,
            nodes: ["region"]
        }];
        const privateimages = [{
            public: false,
            id: "285",
            disk: 3,
            ram: 2,
            vcpus: 1,
            nodes: ["region"]
        }];

        store.dispatch(setImages(publicimages, privateimages));
        window.MashupPlatform.http = {
            makeRequest: (url, options) => {
                setTimeout(() => options.onFailure("FAIL"), 0);
            }
        };

        setup(store);

        setTimeout(() => {
            initialvalue();
            done();
        }, 0);

    });

    xit("set state with data from http request", done => {
        const publicimages = [{
            // this map will be removed, this is to test things :)
            disk: 3,
            public: true,
            name: "Public Small",
            id: "random1",
            ram: 512,
            vcpus: 1,
            nodes: ["Spain2"]
        }, {
            // this map will be removed, this is to test things :)
            disk: 10,
            public: true,
            name: "Public Medium",
            id: "random2",
            ram: 1024,
            vcpus: 2,
            nodes: ["Spain2"]
        }, {
            // this map will be removed, this is to test things :)
            disk: 30,
            public: true,
            name: "Public Large",
            id: "random3",
            ram: 4096,
            vcpus: 4,
            nodes: ["Spain2"]
        }];
        const privateimages = [{
            disk: 3,
            public: false,
            name: "Private Small",
            id: "random4",
            ram: 512,
            vcpus: 1,
            nodes: ["Prague"]
        }, {
            // this map will be removed, this is to test things :)
            disk: 10,
            public: false,
            name: "Private Medium",
            id: "random5",
            ram: 1024,
            vcpus: 2,
            nodes: ["Prague"]
        }, {
            // this map will be removed, this is to test things :)
            disk: 30,
            public: false,
            name: "Private Large",
            id: "random6",
            ram: 4096,
            vcpus: 4,
            nodes: ["Prague"]
        }];
        const responsedata = {
            images: [...publicimages, ...privateimages]
        };

        // window.MashupPlatform.http = {
        //     makeRequest: (url, options) => {
        //         setTimeout(() => options.onSuccess({
        //             responseText: JSON.stringify(responsedata),
        //             getHeader: jasmine.createSpy('getHeader')
        //         }), 0);
        //     }
        // };

        const {app} = setup(store);

        setTimeout(() => {
            const lis = TestUtils.scryRenderedDOMComponentsWithTag(app, "li");

            expect(lis.length).toEqual(2);
            expectstate(false, publicimages, privateimages, "", "", "", {regions: []});
            done();
        }, 0);
    });

    xit("test", done => {
        const publicimages = [{
            // this map will be removed, this is to test things :)
            disk: 3,
            public: true,
            name: "Public Small",
            id: "random1",
            ram: 512,
            vcpus: 1,
            nodes: ["Spain2"]
        }, {
            // this map will be removed, this is to test things :)
            disk: 10,
            public: true,
            name: "Public Medium",
            id: "random2",
            ram: 1024,
            vcpus: 2,
            nodes: ["Spain2"]
        }, {
            // this map will be removed, this is to test things :)
            disk: 30,
            public: true,
            name: "Public Large",
            id: "random3",
            ram: 4096,
            vcpus: 4,
            nodes: ["Spain2"]
        }];
        const privateimages = [{
            disk: 3,
            public: false,
            name: "Private Small",
            id: "random4",
            ram: 512,
            vcpus: 1,
            nodes: ["Prague"]
        }, {
            // this map will be removed, this is to test things :)
            disk: 10,
            public: false,
            name: "Private Medium",
            id: "random5",
            ram: 1024,
            vcpus: 2,
            nodes: ["Prague"]
        }, {
            // this map will be removed, this is to test things :)
            disk: 30,
            public: false,
            name: "Private Large",
            id: "random6",
            ram: 4096,
            vcpus: 4,
            nodes: ["Prague"]
        }];
        const responsedata = {
            images: [...publicimages, ...privateimages]
        };

        window.MashupPlatform.http = {
            makeRequest: (url, options) => {
                setTimeout(() => options.onSuccess({
                    responseText: JSON.stringify(responsedata),
                    getHeader: jasmine.createSpy('getHeader')
                }), 0);
            }
        };

        const {app, instance} = setup(store);

        setTimeout(() => {
            expectstate(false, publicimages, privateimages, "", "", "", {regions: []});

            const leftc = app.handleImageClick(setLeft, {
                old: "",
                myname: "left",
                othername: "right",
                mylist: publicimages,
                otherlist: privateimages
            }).bind(instance);
            const rightc = app.handleImageClick(setRight, {
                old: "",
                myname: "right",
                othername: "left",
                mylist: privateimages,
                otherlist: publicimages
            }).bind(instance);

            leftc("random1");
            rightc("random4");

            expectstate(false, publicimages, privateimages, "random1", "random4", "", {regions: []});

            expect(window.MashupPlatform.wiring.pushEvent).toHaveBeenCalledWith("compare", JSON.stringify({
                to: {
                    vcpus: 1,
                    ram: 512,
                    disk: 3,
                    name: "Public Small"
                },
                from: {
                    vcpus: 1,
                    ram: 512,
                    disk: 3,
                    name: "Private Small"
                }
            }));

            done();
        }, 0);
    });
});
