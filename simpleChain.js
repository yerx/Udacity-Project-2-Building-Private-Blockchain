// Require levelDb 
const leveldb = require('./levelSandbox');

// Require crypto-js

const SHA256 = require('crypto-js/sha256');

// class with a constructor for block 

class Block{
	constructor(data){
     this.hash = "",
     this.height = 0,
     this.body = data,
     this.time = 0,
     this.previousBlockHash = ""
    }
}

// Class with a constructor for a new blockchain

class Blockchain{
    constructor(){
      this.getBlockHeight().then((blockHeight) => {
          if (blockHeight === -1) {
              this.addBlock(new Block("First block in the chain - Genesis Block")).then(() =>
              console.log("Genesis Block added"));
          }
      });
    }
    
    // Add new block 
    async addBlock(newBlock) {
        // Block height 
        const blockHeight = parseInt(await this.getBlockHeight());
        newBlock.height = blockHeight + 1;
        // UTC timestamp
        newBlock.time = new Date().getTime().toString().slice(0,-3);
        // Previous block hash 
        if (newBlock.height > 0) {
            const previousBlock = await this.getBlock(blockHeight);
            newBlock.previousBlockHash = previousBlock.hash;
        }
        // Block hash with SHA256 using newBlock and converting to a string
        newBlock.hash = SHA256(JSON.stringify(newBlock)).toString();
        console.log("New block hash " + newBlock.hash);
        // Adding block to levelDB
        await leveldb.addBlockLevelDB(newBlock.height, JSON.stringify(newBlock));
        console.log("Block " + newBlock.height + " added");
    }

    // Get block height
    async getBlockHeight() {
        return parseInt(await leveldb.getBlockHeightLevelDB());
    }

    // Get block
    async getBlock(blockHeight) {
        return JSON.parse(await leveldb.getBlockLevelDB(blockHeight));
    }

    // Validate block 
    async validateBlock(blockHeight) {
        // get block object 
        let block = JSON.parse(await this.getBlock(blockHeight));
        // get block hash
        let blockHash = block.hash;
        // remove block hash to test block integrity
        block.hash = "";
        console.log("block hash " + block.hash);
        // generate block hash
        let validBlockHash = SHA256(JSON.stringify(block)).toString();
        // compare 
        if (blockHash === validBlockHash) {
            return true;
        } else {
            console.log('Block # ' + blockHeight + ' invalid hash:\n' + blockHash + '<>' + validBlockHash);
            return false;
        }
    }

    // Validate blockchain 
    async validateChain () {
        let errorLog = [];

        const blockHeight = await this.getBlockHeight();

        for (let i = 0; i < blockHeight; i++) {
            // validate block
            if(!this.validateBlock(i))errorLog.push(i);
    
            // compare blocks hash link
            let block = await leveldb.getBlockLevelDB(i);
            let blockHash = block.hash;
            let nextBlock = await leveldb.getBlockLevelDB(i + 1);
            let previousHash = nextBlock.previousBlockHash;

            if (blockHash !== previousHash) {
            errorLog.push(i);
            }
    
            if (!this.validateBlock(blockHeight))errorLog.push(blockHeight);

            if (errorLog.length > 0) {
                console.log('Block errors = ' + errorLog.length);
                console.log('Blocks: '+ errorLog);
            } else {
                console.log('No errors detected');
            }
        }
    }
}

// testing the code 


let blockchain = new Blockchain();


setTimeout(async function () {
    console.log(await blockchain.getBlockHeight());
    await blockchain.addBlock(new Block(" test--1"));
    await blockchain.validateBlock(1);
    await blockchain.validateChain();
}, 1200);
