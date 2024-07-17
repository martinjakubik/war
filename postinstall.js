import * as oFs from 'fs/promises';

const sLibPath = './js/lib';

const oMkDirOptions = {
    recursive: true
};

oFs.mkdir(`${sLibPath}/kierki`, oMkDirOptions).then((oResult) => {
    console.log(oResult);
    const sSrcPathToKierkiLib = './node_modules/kierki/js';
    const sDestPathToKierkiLib = `${sLibPath}/kierki`;

    const aLibFiles = ['GamePlay', 'GameSession', 'Player', 'Tools'];
    aLibFiles.forEach(sLibFile => {
        oFs.cp(
            `${sSrcPathToKierkiLib}/${sLibFile}.js`, `${sDestPathToKierkiLib}/${sLibFile}.js`
        ).then((oResult) => {
            console.log(oResult);
        }).catch((oError) => {
            console.log(oError);
        });
    });
}).catch((oError) => {
    console.log(oError);
});

