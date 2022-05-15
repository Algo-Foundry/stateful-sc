const { convert, Tealdbg, signTransactions } = require("@algo-builder/algob");
const { types } = require("@algo-builder/web");
const algosdk = require("algosdk");
const fs = require("fs");

async function run(runtimeEnv, deployer) {
    const acc1 = deployer.accountsByName.get("acc1");
    const approvalFile = "game_approval.py";
    const clearStateFile = "game_clearstate.py";

    // get app info
    const gameApp = deployer.getApp(approvalFile, clearStateFile);

    const gameAppAddress = gameApp.applicationAccount;
    console.log("app account address:", gameAppAddress);

    const attackAppArgs = ["Attack"].map(convert.stringToBytes);
    
    /**
     * Debug in JSON
     */
    // const txParams = {
    //     type: types.TransactionType.CallApp,
    //     sign: types.SignType.SecretKey,
    //     fromAccount: acc1,
    //     appID: gameApp.appID,
    //     payFlags: { totalFee: 1000 },
    //     appArgs: attackAppArgs,
    // };

    // const debug = new Tealdbg(deployer, txParams);
    // await debug.dryRunResponse('attack_dryrun.json');

    /**
     * Debug using TEAL debugger
     * 1. ./sandbox copyTo ../af-assignments/stateful-sc/assets/dryrun.json
     * 2. ./sandbox tealdbg debug -d dryrun.json --remote-debugging-port 9392
     * 3. Chrome URL: chrome://inspect/#devices
     */
    const suggestedParams = await deployer.algodClient.getTransactionParams().do();
    const tx = algosdk.makeApplicationNoOpTxn(
        acc1.addr,
        suggestedParams,
        gameApp.appID,
        attackAppArgs
    );

    const signedCallTxn = tx.signTxn(acc1.sk);

    const drr = await algosdk.createDryrun({
        client: deployer.algodClient,
        txns: [algosdk.decodeSignedTransaction(signedCallTxn)],
    });

    // Create dump file
    const filename = "dryrun.msgp";
    fs.writeFileSync(filename, algosdk.encodeObj(drr.get_obj_for_encoding(true)));
}

module.exports = { default: run };
