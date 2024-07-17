import * as oFs from 'fs/promises';

const sLibPath = './js/lib';

const sSrcPathToKierkiLib = './node_modules/kierki';
const sDestPathToKierkiLib = `${sLibPath}/kierki`;
const sSrcPathToKierkiJsLib = `${sSrcPathToKierkiLib}/js`;
const sDestPathToKierkiJsLib = `${sDestPathToKierkiLib}/js`;
const sSrcPathToKierkiCssLib = `${sSrcPathToKierkiLib}/css`;
const sDestPathToKierkiCssLib = `${sDestPathToKierkiLib}/css`;
const sSrcPathToKierkiResourceLib = `${sSrcPathToKierkiLib}/resources`;
const sDestPathToKierkiResourceLib = `${sDestPathToKierkiLib}/resources`;

const aJsLibFiles = ['GamePlay', 'GameSession', 'Player', 'Tools'];
aJsLibFiles.forEach(sLibFile => {
    oFs.cp(
        `${sSrcPathToKierkiJsLib}/${sLibFile}.js`, `${sDestPathToKierkiJsLib}/${sLibFile}.js`
    ).then((oResult) => {
        console.log(oResult);
    }).catch((oError) => {
        console.log(oError);
    });
});
const aCssLibFiles = ['screen'];
aCssLibFiles.forEach(sLibFile => {
    oFs.cp(
        `${sSrcPathToKierkiCssLib}/${sLibFile}.css`, `${sDestPathToKierkiCssLib}/${sLibFile}.css`
    ).then((oResult) => {
        console.log(oResult);
    }).catch((oError) => {
        console.log(oError);
    });
});
const aResourceLibFiles = ['cardshwip'];
aResourceLibFiles.forEach(sLibFile => {
    oFs.cp(
        `${sSrcPathToKierkiResourceLib}/${sLibFile}.wav`, `${sDestPathToKierkiResourceLib}/${sLibFile}.wav`
    ).then((oResult) => {
        console.log(oResult);
    }).catch((oError) => {
        console.log(oError);
    });
});

