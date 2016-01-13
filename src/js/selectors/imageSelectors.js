"use strict";

/*
  Let's use selectors to avoid recalculate everything if the data is not equal
*/

import {createSelector} from "reselect";

function imagesEqual(f1, f2) {
    return f1.checksum === f2.checksum;
}

const findOrEmpty = (def, list) =>
      (typeof list.find(x => x.id === def) !== "undefined") ? def : "";

function notInPriv(flav, priv) {
    const privsfilt = priv.filter(f => imagesEqual(flav, f));

    return privsfilt.length === 0;
}

function selectReferenceImages({ownerImages, referenceImages: allreferenceImages}, filter) {
    const referenceImages = allreferenceImages ? allreferenceImages.filter(
        img => img.region === "Spain2" && (!filter || notInPriv(img, ownerImages))
    ) : [];

    return {referenceImages, ownerImages};
}

function selectLeftRight(select, referenceImages, ownerImages) {
    const left = findOrEmpty(select.left, referenceImages);
    const right = findOrEmpty(select.right, ownerImages);

    return {left, right};
}

const imagesSelector = state => state.images;
const filterSelector = state => state.filter;
const selectSelector = state => state.select;
const regionsSelector = state => state.regions;

function otherEqual({left, right}, {referenceImages, ownerImages}) {
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
    const complist = (isleft) ? referenceImages : ownerImages;
    const component = complist.find(x => x.id === compid);

    const equalleft = (isleft) ? [] : filterEqualMap(referenceImages, component);
    const equalright = (isleft) ? filterEqualMap(ownerImages, component) : [];

    return {
        equalleft,
        equalright
    };
}

export const imageSelectors = createSelector(
    imagesSelector,
    filterSelector,
    selectSelector,
    regionsSelector,
    (images, filter, select, regions) => {
        const {referenceImages: originalRefImgs, ownerImages: originalOwnerImgs} = images;
        const {region} = select;
        const regionsList = regions.regions;
        const inRegion = (image, r) => image.region === r;
        const defaultregion = (regionsList.size === 0) ? "" : [...regionsList][0];
        const regionselected = (regionsList.indexOf(region) !== -1 ? region : defaultregion);
        const newownerimages = originalOwnerImgs ? originalOwnerImgs.filter(f => inRegion(f, regionselected)) : [];

        const {referenceImages, ownerImages} = selectReferenceImages({
            referenceImages: originalRefImgs,
            ownerImages: newownerimages
        }, filter);
        // const {filter, referenceImages} = publicprivate;
        // const oldownerImages = publicprivate.ownerImages;

        const {left, right} = selectLeftRight(select, referenceImages, ownerImages);
        const {equalleft, equalright} = otherEqual({left, right}, {referenceImages, ownerImages});

        return {
            equalleft,
            equalright,
            filter,
            left,
            ownerImages,
            referenceImages,
            region: regionselected,
            regions: [...regionsList],
            right
        };
    }
);
