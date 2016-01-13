import setImages from "../actions/index";

export default class ImageJoiner {

    constructor(nRegions, dispatchf, action) {
        this.counter = nRegions;
        this.dispatchf = dispatchf;
        this.action = action;
        this.ownerImages = [];
        this.referenceImages = [];
    }

    deductCounter() {
        this.counter -= 1;
        if (this.counter === 0) {
            this.dispatchf(this.action(this.referenceImages, this.ownerImages));
        }
    }

    addImages(images, region) {
        if (region === "Spain2") {
            images.forEach(image => {
                image.region = region;
                this.referenceImages.push(image)
            });
        }
        else {
            images.forEach(image => {
                image.region = region;
                this.ownerImages.push(image)
            });
        }

        this.deductCounter();
    }
}
