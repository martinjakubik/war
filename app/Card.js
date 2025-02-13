class Card {
    constructor(oFaceView, oRearView) {
        this.faceView = oFaceView;
        this.rearView = oRearView;
    }

    getFaceView() {
        return this.faceView;
    }

    setFaceView(oFaceView) {
        this.faceView = oFaceView;
    }

    getReariew() {
        return this.rearView;
    }

    setRearView(oRearView) {
        this.rearView = oRearView;
    }
};

export { Card };