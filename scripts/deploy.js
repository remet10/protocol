const Web3 = require('web3');
const Proxy = artifacts.require('./Proxy.sol');
const ZeedexExchange = artifacts.require('./ZeedexExchange.sol');
const TestToken = artifacts.require('./helper/TestToken.sol');
const BigNumber = require('bignumber.js');

BigNumber.config({ EXPONENTIAL_AT: 1000 });

const getWeb3 = () => {
    const myWeb3 = new Web3(web3.currentProvider);
    return myWeb3;
};

const newContract = async (contract, ...args) => {
    const c = await contract.new(...args);
    const w = getWeb3();
    const instance = new w.eth.Contract(contract.abi, c.address);
    return instance;
};

const newContractAt = (contract, address) => {
    const w = getWeb3();
    const instance = new w.eth.Contract(contract.abi, address);
    return instance;
};

let zdexTokenAddress = null;
let proxyAddress = null;
let exchangeAddress = null;

module.exports = async () => {
    let zdex, exchange, proxy;
    try {
        if (!zdexTokenAddress) {
            zdex = await newContract(TestToken, 'ZeedexToken', 'ZDEX', 18);
            zdexTokenAddress = zdex._address;
        } else {
            zdex = await newContractAt(TestToken, zdexTokenAddress);
        }
        console.log('Zeedex Token address', web3.toChecksumAddress(zdexTokenAddress));

        if (!proxyAddress) {
            proxy = await newContract(Proxy);
            proxyAddress = proxy._address;
        } else {
            proxy = await newContractAt(Proxy, proxyAddress);
        }
        console.log('Proxy address', web3.toChecksumAddress(proxyAddress));

        if (!exchangeAddress) {
            exchange = await newContract(ZeedexExchange, proxyAddress, zdexTokenAddress);
            exchangeAddress = exchange._address;
        } else {
            exchange = await newContractAt(ZeedexExchange, exchangeAddress);
        }
        console.log('ZeedexExchange address', web3.toChecksumAddress(exchangeAddress));

        await Proxy.at(proxyAddress).addAddress(exchangeAddress);
        console.log('Proxy add exchange into whitelist');

        process.exit(0);
    } catch (e) {
        console.log(e);
    }
};
