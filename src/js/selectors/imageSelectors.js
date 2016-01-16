"use strict";

/*
  Let's use selectors to avoid recalculate everything if the data is not equal
*/

import {createSelector} from "reselect";

function imagesEqual(i1, i2) {
    return i1.checksum === i2.checksum;
}

const findOrEmpty = (def, list) =>
      (typeof list.find(x => x.id === def) !== "undefined") ? def : "";

function notInPriv(flav, priv) {
    const privsfilt = priv.filter(f => imagesEqual(flav, f));

    return privsfilt.length === 0;
}

function getEqualsList(ownerImages, referenceImages) {
    let equalsList = [];
    if (ownerImages && referenceImages) {
        referenceImages.forEach(image => {
            if (ownerImages.filter(p => imagesEqual(image, p)).length !== 0) {
                equalsList.push(image);
            }
        });
    }

    return equalsList;
}

function inEqualsList(image, equalsList) {
    return equalsList.filter(i => imagesEqual(i, image)).length !== 0;
}

function selectImages({ownerImages: allOwnerImages, referenceImages: allreferenceImages}, filter, equalsList) {
    const referenceImages = allreferenceImages ? allreferenceImages.filter(
        img => !filter || !inEqualsList(img, equalsList)
    ) : [];

    const ownerImages = allOwnerImages ? allOwnerImages.filter(
        img => !filter || !inEqualsList(img, equalsList)
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
        const equalsList = getEqualsList(newownerimages, originalRefImgs);

        const {referenceImages, ownerImages} = selectImages({
            referenceImages: originalRefImgs,
            ownerImages: newownerimages
        }, filter, equalsList);
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
