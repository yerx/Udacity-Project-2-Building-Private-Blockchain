/* ===== Persist data with LevelDB ===================================
|  Learn more: level: https://github.com/Level/level     |
|  =============================================================*/

// require levelDB
const level = require('level');
const chainDB = './chaindata';
const db = level(chainDB);

function addBlockLevelDB(key, value) {
    return new Promise((resolve, reject) => {
        db.put(key, JSON.stringify(value), (err) => {
            if (err) reject (err);
            resolve('Added block #' + key);
            console.log('Added Block #' + key)
        });
    });
}

function getBlockLevelDB(key) {
    return new Promise((resolve, reject) => {
        db.get(key, (err, value) => {
            if (err) reject(err);
            resolve(JSON.parse(JSON.stringify(value)));
        });
    });
}

function getBlockHeightLevelDB() {
    return new Promise((resolve, reject) => {
        let height = -1;
        db.createReadStream()
            .on('data', (data) => {
                console.log(data.key);
                height++;
            })
            .on('error', (err) => {
                console.log("Error", err);
                reject(err);
            })
            .on('close', () => {
                console.log('Stream closed');
                resolve(height);
            });
    });
}

module.exports = { addBlockLevelDB, getBlockHeightLevelDB, getBlockLevelDB };

/* ===== Testing ==============================================================|
|  - Self-invoking function to add blocks to chain                             |
|  - Learn more:                                                               |
|   https://scottiestech.info/2014/07/01/javascript-fun-looping-with-a-delay/  |
|                                                                              |
|  * 100 Milliseconds loop = 36,000 blocks per hour                            |
|     (13.89 hours for 500,000 blocks)                                         |
|    Bitcoin blockchain adds 8640 blocks per day                               |
|     ( new block every 10 minutes )                                           |
|  ===========================================================================*/

/*
(function theLoop (i) {
  setTimeout(function () {
    addDataToLevelDB('Testing data');
    if (--i) theLoop(i);
  }, 100);
})(10);
*/
