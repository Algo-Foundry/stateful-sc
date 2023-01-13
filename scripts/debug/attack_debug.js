const { convert } = require("@algo-builder/algob");
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
     * Debug using TEAL debugger
     * 1. ./sandbox copyTo ../af-assignments/stateful-sc/dryrun.msgp
     * 2. ./sandbox tealdbg debug -d dryrun.msgp --remote-debugging-port 9392
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
