class Tools {

    static generateID() {
        var sUuid;

        var fnS4 = function () {
            var n = Math.floor(Math.random() * 9999);
            return n;
        }

        var sUuid = fnS4() + '-' + fnS4();

        return sUuid;
    };

    static addClass(oView, sClass) {
        var sClasses = oView.getAttribute('class');

        if (sClasses.indexOf(sClass) < 0) {
            oView.setAttribute('class', oView.getAttribute('class') + ' ' + sClass);
        }
    };

    static setClass(oView, sClass) {
        oView.setAttribute('class', sClass);
    };

    static removeClass(oView, sClass) {
        var sCurrentClasses = oView.getAttribute('class');
        var nStartIndex = sCurrentClasses.indexOf(sClass);
        var nEndIndex = nStartIndex + sClass.length;
        var sUpdatedClasses;

        if (nStartIndex > 0 && nEndIndex <= sCurrentClasses.length) {
            sUpdatedClasses = (sCurrentClasses.substr(0, nStartIndex) + ' ' +
                sCurrentClasses.substr(nEndIndex)).trim();
            oView.setAttribute('class', sUpdatedClasses);
        }
    };

    static toggleClass(oView, sClass) {
        var sClasses = oView.getAttribute('class');

        if (sClasses.indexOf(sClass) < 0) {
            Tools.addClass(oView, sClass);
        } else {
            Tools.removeClass(oView, sClass);
        }
    };

    static addStyle(oView, sStyleName, sStyleValue) {
        var sStyles = oView.style ? oView.style.cssText : null;

        oView.style[sStyleName] = sStyleValue;
    };

    static setStyle(oView, sStyleName, sStyleValue) {
        oView.style[sStyleName] = sStyleValue;
    };

    static removeStyle(oView, sStyleName) {
        oView.style[sStyleName] = '';
    };

    static toggleStyle(oView, sStyleName, sStyleValue) {
        var sStyles = oView.style ? oView.style.cssText : null;

        if (sStyles && sStyles.indexOf(sStyleName) < 0) {
            Tools.addStyle(oView, sStyleName, sStyleValue);
        } else {
            Tools.removeStyle(oView, sStyleName);
        }
    };

    /**
    * shuffles a set of things
    */
    static shuffle(aThings) {
        var n, aShuffledThings = [];

        while (aThings.length > 0) {
            n = Math.floor(Math.random() * aThings.length);
            aShuffledThings.push(aThings.splice(n, 1)[0]);
        }

        return aShuffledThings;
    };

    /**
    * gets the last sub-object from an object
    */
    static getLastItemInObject(oThings) {

        var aThingKeys = Object.keys(oThings);
        var aLastThingKey = aThingKeys[aThingKeys.length - 1];

        return oThings[aLastThingKey];

    };

    /**
    * gets the number of last sub-object from an object
    */
    static getKeyOfLastItemInObject(oThings) {

        var aThingKeys = Object.keys(oThings);
        var aLastThingKey = aThingKeys[aThingKeys.length - 1];

        return aLastThingKey;

    };
};

export { Tools };