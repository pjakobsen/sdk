import assert from 'assert';
import { DockAPI } from '../src/api';
import {
  getLastBlock, getBlockNo, blockNumberToHash, getBlock, getBalance, getAllExtrinsicsFromBlock, getTransfersFromBlock,
  getAllEventsFromBlock, getLastFinalizedBlock, generateAccount, transferMicroDock, transferDock, validateAddress,
} from '../src/utils/chain-ops';

require('dotenv').config();

const { FullNodeEndpoint } = process.env;

function validateAddresses() {
  if (!validateAddress('3Fc793dfkwsiTpLNStqvXA5JapNyPrr5pQLngwifEB1zc8LG', 'main')) {
    throw new Error('Cannot validate 3Fc793dfkwsiTpLNStqvXA5JapNyPrr5pQLngwifEB1zc8LG as mainnet address');
  }

  if (!validateAddress('375J3PbYjaD252gBAWVRfJwD5Hs7iQrHUDhGUGs2ujJgjsjX', 'test')) {
    throw new Error('Cannot validate 375J3PbYjaD252gBAWVRfJwD5Hs7iQrHUDhGUGs2ujJgjsjX as testnet address');
  }

  if (validateAddress('3Fc793dfkwsiTpLNStqvXA5JapNyPrr5pQLngwifEB1zc8L', 'main')) {
    throw new Error('Validated incorrect address 3Fc793dfkwsiTpLNStqvXA5JapNyPrr5pQLngwifEB1zc8L as mainnet address');
  }

  if (validateAddress('375J3PbYjaD252gBAWVRfJwD5Hs7iQrHUDhGUGs2ujJgjsX', 'test')) {
    throw new Error('Validated incorrect address 375J3PbYjaD252gBAWVRfJwD5Hs7iQrHUDhGUGs2ujJgjsX as testnet address');
  }
}

async function accountGenerationExamples() {
  // With random seed
  // @ts-ignore
  const [uri1, address1] = await generateAccount({ type: 'ed25519', network: 'test' });
  console.info(`Generated random seed ${uri1} for ed25519 account with address ${address1}`);

  // @ts-ignore
  const [uri2, address2] = await generateAccount({ type: 'sr25519', network: 'main' });
  console.info(`Generated random seed ${uri2} for sr25519 account with address ${address2}`);

  // @ts-ignore
  const [uri3, address3] = await generateAccount({ type: 'ecdsa', network: 'main' });
  console.info(`Generated random seed ${uri3} for ecdsa account with address ${address3}`);

  // With hex seed
  // @ts-ignore
  const [, address4] = await generateAccount({ secretUri: '0x67826291fd8ce9941e19e2e0d97ad16cd467f40aee9c29898570f9b28645d7c2', type: 'sr25519', network: 'main' });
  console.info(`Generated sr25519 account with address ${address4} using given hex seed`);

  // With secret phrase
  // @ts-ignore
  const [, address5] = await generateAccount({ secretUri: '//file upper fever frog achieve side catalog flash age bright mirror split', type: 'ed25519', network: 'main' });
  console.info(`Generated ed25519 account with address ${address5} using given secret phrase`);
}

async function printLastBlockNo(api) {
  const block = await getLastBlock(api);
  const num = getBlockNo(block);
  console.info(`Last block number is ${num}`);
  return num;
}

async function printLastFinalizedBlockNo(api) {
  const block = await getLastFinalizedBlock(api);
  const num = getBlockNo(block);
  console.info(`Last finalized block number is ${num}`);
  return num;
}

async function printBlock(api, blockNo) {
  const blockByNum = await getBlock(api, blockNo);
  const blockHash = await blockNumberToHash(api, blockNo);
  const blockByHash = await getBlock(api, blockHash);
  assert(blockByNum.header.number.toNumber() === blockByHash.header.number.toNumber(), 'Blocks received by hash and number are different');
  console.info(`Block is ${blockByNum}`);
  return blockByNum;
}

async function printBalance(api, address) {
  const bal = await getBalance(api, address);
  console.info(`Balance of ${address} is ${bal}`);
}

async function printExtrinsicsOfBlock(api, blockNumberOrHash) {
  console.info(await getAllExtrinsicsFromBlock(api, blockNumberOrHash));
}

async function printTransfersOfBlock(api, blockNumberOrHash) {
  console.info(await getTransfersFromBlock(api, blockNumberOrHash, 'dev'));
}

async function printAllEventsFromBlock(api, blockNumberOrHash) {
  const evs = await getAllEventsFromBlock(api, blockNumberOrHash);
  console.info(evs);
}

async function doTokenTransfer(api) {
  const recip = '5FHneW46xGXgs5mUiveU4sbTyGBzmstUspZC92UhjJM694ty';
  const [, , keypair] = await generateAccount({ secretUri: '//Alice', type: 'sr25519', network: 'test' });

  // Transfer tokens
  const txnHash = await transferDock(api, keypair, recip, 2.5);
  console.info(`Gave 2.5 Docks in transaction hash ${txnHash}`);

  // Prepare a transfer transaction with micro tokens but do not send
  const txn = await transferMicroDock(api, keypair, recip, 500, false);
  console.info(`Transfer transaction with 500 microDocks ${txn}`);
  console.info(`Transfer transaction with 500 microDocks as hex encoded ${txn.toHex()}`);
}

async function main() {
  const dock = new DockAPI();
  await dock.init({
    address: FullNodeEndpoint,
  });

  validateAddresses();

  await accountGenerationExamples();

  await printLastFinalizedBlockNo(dock.api);

  const num = await printLastBlockNo(dock.api);

  await printBlock(dock.api, num);

  const address = '5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY';
  await printBalance(dock.api, address);

  await printExtrinsicsOfBlock(dock.api, 3);

  await printTransfersOfBlock(dock.api, 3);

  await printAllEventsFromBlock(dock.api, 3);

  await doTokenTransfer(dock.api);
}

main()
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    console.error('Error occurred somewhere, it was caught!', error);
    process.exit(1);
  });
