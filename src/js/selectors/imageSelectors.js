"use strict";

/*
  Let's use selectors to avoid recalculate everything if the data is not equal
*/

import {createSelector} from "reselect";

function imagesEqual(f1, f2) {
    return (f1.disk === f2.disk &&
            f1.ram === f2.ram &&
            f1.vcpus === f2.vcpus);
}

const findOrEmpty = (def, list) =>
      (typeof list.find(x => x.id === def) !== "undefined") ? def : "";

function notInPriv(flav, priv) {
    const privsfilt = priv.filter(f => imagesEqual(flav, f));

    return privsfilt.length === 0;
}

function selectPublicPrivate({privateimages, publicimages: allpublicimages}, filter) {
    const publicimages = allpublicimages.filter(
        f => f.public && (!filter || notInPriv(f, privateimages))
    );

    return {publicimages, privateimages};
}

function selectLeftRight(select, publicimages, privateimages) {
    const left = findOrEmpty(select.left, publicimages);
    const right = findOrEmpty(select.right, privateimages);

    return {left, right};
}

const imagesSelector = state => state.images;
const filterSelector = state => state.filter;
const selectSelector = state => state.select;
const regionsSelector = state => state.regions;

function otherEqual({left, right}, {publicimages, privateimages}) {
    if ((left === "" && right === "") || (left !== "" && right !== "")) {
        return {
            equalleft: [],
            equalright: []
        };
    }
    const filterEqualMap = (list, elem) => list.
              filter(x => imagesEqual(x, elem)).
              map(x => x.id);

    const isleft = left !== "";
    const compid = (isleft) ? left : right;
    const complist = (isleft) ? publicimages : privateimages;
    const component = complist.find(x => x.id === compid);

    const equalleft = (isleft) ? [] : filterEqualMap(publicimages, component);
    const equalright = (isleft) ? filterEqualMap(privateimages, component) : [];

    return {
        equalleft,
        equalright
    };
}

function checkRegions(imageList) {
    let isCorrect = true;
    for (let i = 0; i<imageList.length && isCorrect === true; i++) {
        if (!imageList[i].nodes || imageList[i].nodes.length === 0) {
            isCorrect = false;
        }
    }

    return isCorrect;
}

export const imageSelectors = createSelector(
    imagesSelector,
    filterSelector,
    selectSelector,
    regionsSelector,
    (images, filter, select, regions) => {
        const {publicimages: originalpublic, privateimages: originalprivate} = images;
        const {region} = select;
        const regionsList = regions.regions;
        const inRegion = (image, r) => new Set(image.nodes).has(r);
        const defaultregion = (regionsList.size === 0) ? "" : [...regionsList][0];
        const regionselected = (regionsList.indexOf(region) !== -1 ? region : defaultregion);
        const newprivateimages = originalprivate.filter(f => inRegion(f, regionselected));

        const {publicimages, privateimages} = selectPublicPrivate({
            publicimages: originalpublic,
            privateimages: newprivateimages
        }, filter);
        // const {filter, publicimages} = publicprivate;
        // const oldprivateimages = publicprivate.privateimages;

        const {left, right} = selectLeftRight(select, publicimages, privateimages);
        const {equalleft, equalright} = otherEqual({left, right}, {publicimages, privateimages});

        return {
            equalleft,
            equalright,
            filter,
            left,
            privateimages,
            publicimages,
            region: regionselected,
            regions: [...regionsList],
            right
        };
    }
);
