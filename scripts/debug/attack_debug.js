const { convert, Tealdbg } = require("@algo-builder/algob");
const { types } = require("@algo-builder/web");

async function run(runtimeEnv, deployer) {
    const acc1 = deployer.accountsByName.get("acc1");
    const approvalFile = "game_approval.py";
    const clearStateFile = "game_clearstate.py";

    // get app info
    const gameApp = deployer.getApp(approvalFile, clearStateFile);
    
    const gameAppAddress = gameApp.applicationAccount;
    console.log("app account address:", gameAppAddress);

    const attackAppArgs = ["Attack"].map(convert.stringToBytes);
    const txParams = {
        type: types.TransactionType.CallApp,
        sign: types.SignType.SecretKey,
        fromAccount: acc1,
        appID: gameApp.appID,
        payFlags: { totalFee: 1000 },
        appArgs: attackAppArgs,
    };

    const debug = new Tealdbg(deployer, txParams);
    await debug.dryRunResponse('attack_dryrun.json');
}

module.exports = { default: run };
