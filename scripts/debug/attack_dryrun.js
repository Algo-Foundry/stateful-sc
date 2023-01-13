const { convert, Tealdbg } = require("@algo-builder/algob");
const { types } = require("@algo-builder/web");
const algosdk = require("algosdk");
const fs = require("fs");

async function run(runtimeEnv, deployer) {
    const acc1 = deployer.accountsByName.get("acc1");
    const appName = "gameApp";

    // get app info
    const gameApp = deployer.getApp(appName);

    const gameAppAddress = gameApp.applicationAccount;
    console.log("app account address:", gameAppAddress);

    const attackAppArgs = ["Attack"].map(convert.stringToBytes);
    
    /**
     * Debug in JSON
     */
    const txParams = {
        type: types.TransactionType.CallApp,
        sign: types.SignType.SecretKey,
        fromAccount: acc1,
        appID: gameApp.appID,
        payFlags: { totalFee: 1000 },
        appArgs: attackAppArgs,
    };

    const debug = new Tealdbg(deployer, txParams);
    await debug.dryRunResponse('attack_dryrun.json', true);
}

module.exports = { default: run };
