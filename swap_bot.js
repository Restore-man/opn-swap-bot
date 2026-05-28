const { Web3 } = require('web3');

const PRIVATE_KEY = 'YOUR_PRIVATE_KEY_HERE';
const RPC_URL = 'https://testnet-rpc.iopn.tech';

const TOKENS = {
    tUSDT: { addr: '0x3e01b4d892E0D0A219eF8BBe7e260a6bc8d9B31b', decimals: 18 },
    WOPN:  { addr: '0xBc022C9dEb5AF250A526321d16Ef52E39b4DBD84', decimals: 18 },
    OPNT:  { addr: '0x2aEc1Db9197Ff284011A6A1d0752AD03F5782B0d', decimals: 18 },
};

const ROUTER = '0xB489bce5c9c9364da2D1D1Bc5CE4274F63141885';

const ERC20_ABI = [
    { name: 'approve', type: 'function', inputs: [{name: 'spender', type: 'address'}, {name: 'amount', type: 'uint256'}], outputs: [{type: 'bool'}], stateMutability: 'nonpayable' },
    { name: 'balanceOf', type: 'function', inputs: [{name: 'account', type: 'address'}], outputs: [{type: 'uint256'}], stateMutability: 'view' }
];

const ROUTER_ABI = [
    { name: 'swapExactTokensForTokens', type: 'function', inputs: [{name: 'amountIn', type: 'uint256'}, {name: 'amountOutMin', type: 'uint256'}, {name: 'path', type: 'address[]'}, {name: 'to', type: 'address'}, {name: 'deadline', type: 'uint256'}], outputs: [{type: 'uint256[]'}], stateMutability: 'nonpayable' }
];

const web3 = new Web3(RPC_URL);
const account = web3.eth.accounts.privateKeyToAccount(PRIVATE_KEY);
web3.eth.accounts.wallet.add(account);

const SWAP_PAIRS = [
    ['tUSDT', 'WOPN'],
    ['WOPN', 'tUSDT'],
    ['tUSDT', 'OPNT'],
    ['OPNT', 'tUSDT'],
    ['WOPN', 'OPNT'],
    ['OPNT', 'WOPN'],
];

// Random mintuna tsakanin 3-10
const REST_MINUTES = [3, 5, 8, 9, 10];

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }
function rand(min, max) { return (Math.random() * (max - min) + min).toFixed(4); }
function randInt(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }
function randFrom(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

async function swapTokens(fromSymbol, toSymbol) {
    try {
        const from = TOKENS[fromSymbol];
        const to = TOKENS[toSymbol];
        const tokenContract = new web3.eth.Contract(ERC20_ABI, from.addr);
        const router = new web3.eth.Contract(ROUTER_ABI, ROUTER);

        const amount = rand(0.1, 1);
        const amountIn = BigInt(Math.floor(parseFloat(amount) * 10 ** from.decimals));

        const balance = await tokenContract.methods.balanceOf(account.address).call();
        if (BigInt(balance) < amountIn) {
            console.log('Kadan: ' + fromSymbol + ' = ' + (Number(balance) / 10 ** from.decimals).toFixed(4));
            return;
        }

        console.log('Swap ' + amount + ' ' + fromSymbol + ' -> ' + toSymbol);

        const nonce1 = await web3.eth.getTransactionCount(account.address, 'pending');
        await tokenContract.methods.approve(ROUTER, amountIn.toString()).send({
            from: account.address,
            gas: 100000,
            gasPrice: web3.utils.toWei('7', 'gwei'),
            nonce: Number(nonce1)
        });

        await sleep(2000);

        const nonce2 = await web3.eth.getTransactionCount(account.address, 'pending');
        const deadline = Math.floor(Date.now() / 1000) + 600;
        const tx = await router.methods.swapExactTokensForTokens(
            amountIn.toString(), '0',
            [from.addr, to.addr],
            account.address, deadline
        ).send({
            from: account.address,
            gas: 300000,
            gasPrice: web3.utils.toWei('7', 'gwei'),
            nonce: Number(nonce2)
        });

        console.log('Done! TX: ' + tx.transactionHash);

        // Random sleep tsakanin transactions (3-10 seconds)
        const wait = randInt(3000, 10000);
        console.log('Jiran dakika ' + (wait/1000) + '...');
        await sleep(wait);

    } catch(e) {
        console.log('Error ' + fromSymbol + '->' + toSymbol + ': ' + e.message.slice(0, 80));
    }
}

async function run() {
    console.log('IOPn Swap Bot Yana Aiki!');
    console.log('Wallet: ' + account.address);
    let round = 1;
    while(true) {
        console.log('--- Round ' + round + ' ---');

        // Shuffle pairs don zama random kowane round
        const pairs = [...SWAP_PAIRS].sort(() => Math.random() - 0.5);

        for(const [from, to] of pairs) {
            await swapTokens(from, to);
        }

        // Random hutun mintuna daga jerin
        const restMin = randFrom(REST_MINUTES);
        console.log('Jiran mintuna ' + restMin + '...');
        await sleep(restMin * 60 * 1000);
        round++;
    }
}

run().catch(console.error);
