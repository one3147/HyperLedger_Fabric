// 1. 모듈포함
const express = require("express");
const bodyParser = require("body-parser");
const fs = require("fs");
const path = require("path");

const FabricCAServices = require("fabric-ca-client");
const { Gateway, Wallets } = require("fabric-network");


const ccpPath = path.resolve(__dirname, "..", "..", "fabric-samples", "test-network", "organizations", "peerOrganizations", "org1.example.com", "connection-org1.json");
const ccp = JSON.parse(fs.readFileSync(ccpPath, "utf8"));


const app = express();
const PORT = 3000;
const HOST = "0.0.0.0";

app.use(express.static(path.join(__dirname, "views")));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));


app.get("/", async(res) => {
  const resultPath = path.join(process.cwd(), "./views/index.html");
  var resultHTML = fs.readFileSync(resultPath, "utf-8");
  res.status(200).send(resultHTML);
});



app.post("/initUser", async (req, res) => {
  try {
    var caInfo = ccp.certificateAuthorities['ca.org1.example.com'];
        var caTLSCACerts = caInfo.tlsCACerts.pem;
        var ca = new FabricCAServices(caInfo.url, { trustedRoots: caTLSCACerts, verify: false }, caInfo.caName);
        var walletPath = path.join(process.cwd(), 'wallet');
        var wallet = await Wallets.newFileSystemWallet(walletPath);
        console.log(`Wallet path: ${walletPath}`);
        var identity = await wallet.get('admin');
        if (identity) {
            console.log('An identity for the admin user "admin" already exists in the wallet');
            res.status(200).json(Json.parse(`{"result":"Wallet account is already exists."}`));
        }
        var enrollment = await ca.enroll({ enrollmentID: 'admin', enrollmentSecret: 'adminpw' });
        var x509Identity = {
            credentials: {
                certificate: enrollment.certificate,
                privateKey: enrollment.key.toBytes(),
            },
            mspId: 'Org1MSP',
            type: 'X.509',
        };
    await wallet.put('admin', x509Identity);
    const gateway = new Gateway();
    await gateway.connect(ccp, { wallet, identity: 'admin', discovery: { enabled: true, asLocalhost: true } });
    const network = await gateway.getNetwork('mychannel');
    const contract = network.getContract('basic');
    await contract.submitTransaction('InitUser');
    await gateway.disconnect();
    console.log('Request Success');
    const res_str = `{"result":"success"}`;
    res.status(200).json(JSON.parse(res_str));
  }catch (error) {
    console.error(`Failed to evaluate transaction: ${error}`);
    const res_str = `{"result":"Wallet account is already exists."}`;
    res.status(200).json(JSON.parse(res_str));
}
});



app.post("/createUser", async (req, res) => {
const id = req.body.id;
const pw = req.body.password;
console.log(id);
console.log(pw);
try {
  const walletPath = path.join(process.cwd(), 'wallet');
    const wallet = await Wallets.newFileSystemWallet(walletPath);
    console.log(`Wallet path: ${walletPath}`);

    const identity = await wallet.get('admin');
    if (!identity) {
        console.log('An identity for the user "admin" does not exist in the wallet');
        console.log('Run the registerUser.js application before retrying');
        return;
    }
    const gateway = new Gateway();
    await gateway.connect(ccp, { wallet, identity: 'admin', discovery: { enabled: true, asLocalhost: true } });
    const network = await gateway.getNetwork('mychannel');
    const contract = network.getContract('basic');
    await contract.submitTransaction('CreateUser',id,pw);
    await gateway.disconnect();
    console.log('Successfully registered.');
    const res_str = `{"result":"success"}`;
    res.status(200).json(JSON.parse(res_str));
  } catch (error) {
    const res_str = `{"result":"failed","msg":"failed to register user - ${error}"}`;
    res.json(JSON.parse(res_str));
  }
});


app.post("/findUser", async (req, res) => {
  const id = req.body.id;
  try {
    const walletPath = path.join(process.cwd(), 'wallet');
      const wallet = await Wallets.newFileSystemWallet(walletPath);
      console.log(`Wallet path: ${walletPath}`);
  
      const identity = await wallet.get('admin');
      if (!identity) {
          console.log('An identity for the user "admin" does not exist in the wallet');
          console.log('Run the registerUser.js application before retrying');
          return;
      }
      const gateway = new Gateway();
      await gateway.connect(ccp, { wallet, identity: 'admin', discovery: { enabled: true, asLocalhost: true } });
      const network = await gateway.getNetwork('mychannel');
      const contract = network.getContract('basic');
      const result = await contract.evaluateTransaction('findUser',id);
      console.log(`Transaction has been evaluated, result is: ${result.toString()}`);
      await gateway.disconnect();
      console.log('Successfully find.');
      const res_str = `{"result":"${result.toString()}"}`;
      res.status(200).send(res_str);
    } catch (error) {
      const res_str = `{"result":"failed","msg":"failed to register user - ${error}"}`;
      res.json(JSON.parse(res_str));
    }
});


app.post("/playGame", async (req, res) => {
  const id = req.body.id;
  const betMoney = Number(req.body.betMoney);
  const betNumber = Number(req.body.betNumber);
  console.log(betMoney,betNumber);
  try {
    const walletPath = path.join(process.cwd(), 'wallet');
      const wallet = await Wallets.newFileSystemWallet(walletPath);
      console.log(`Wallet path: ${walletPath}`);
  
      const identity = await wallet.get('admin');
      if (!identity) {
          console.log('An identity for the user "admin" does not exist in the wallet');
          console.log('Run the registerUser.js application before retrying');
          return;
      }
      const gateway = new Gateway();
      await gateway.connect(ccp, { wallet, identity: 'admin', discovery: { enabled: true, asLocalhost: true } });
      const network = await gateway.getNetwork('mychannel');
      const contract = network.getContract('basic');
      await contract.submitTransaction('PlayGame',id,betMoney,betNumber);
      await gateway.disconnect();
      console.log('Successfully Gamed..');
      res.status(200).send("유저 조회를 통해 결과를 확인하세요!");
    } catch (error) {
      const res_str = `{"result":"failed","msg":"failed game - ${error}"}`;
      res.json(JSON.parse(res_str));
    }
});


app.listen(PORT, HOST);
console.log(`Running on http://${HOST}:${PORT}`);
