const config = {
    type: Phaser.AUTO,

    width: 1000,
    height: 700,

    backgroundColor: '#1a1a1a',

    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH
    },

    scene: {
        preload: preload,
        create: create
    }
};

const game = new Phaser.Game(config);

// SYMBOL NAMES
let symbols = [
    "cherry",
    "lemon",
    "star",
    "seven",
    "diamond",
    "grapes"
];

// SYMBOL VALUES
let symbolValues = {
    cherry: 5,
    lemon: 5,
    star: 10,
    seven: 25,
    diamond: 15,
    grapes: 8
};

// GRID SETTINGS
const ROWS = 5;
const COLS = 6;

// GRID POSITION
const START_X = 250;
const START_Y = 190;

const SPACING_X = 100;
const SPACING_Y = 80;

// GRID ARRAYS
let grid = [];
let backgrounds = [];

// MASK
let reelMask;

// PLAYER DATA
let credits = 100;
let betAmount = 10;

// TOTAL TUMBLE WIN
let tumbleTotalWin = 0;
let isTumbling = false;

// UI
let creditsText;
let resultText;

let isSpinning = false;

function preload() {

    // LOAD SYMBOL IMAGES
    this.load.image('cherry', 'assets/symbols/cherry.png');
    this.load.image('lemon', 'assets/symbols/lemon.png');
    this.load.image('star', 'assets/symbols/star.png');
    this.load.image('seven', 'assets/symbols/seven.png');
    this.load.image('diamond', 'assets/symbols/diamond.png');
    this.load.image('grapes', 'assets/symbols/grapes.png');
}

function create() {

    // TITLE CENTERED
    this.add.text(500, 40, 'MY SLOT MACHINE', {
        fontSize: '40px',
        color: '#ffffff'
    }).setOrigin(0.5);

    // CREDITS BOTTOM LEFT
    creditsText = this.add.text(20, 650, 'Credits: 100', {
        fontSize: '28px',
        color: '#ffff00'
    });

    // RESULT TEXT CENTERED
    resultText = this.add.text(500, 585, 'READY', {
        fontSize: '32px',
        color: '#00ff00'
    }).setOrigin(0.5);

    resultText.setDepth(100);

    // CREATE MASK
    const maskShape = this.make.graphics({});

    maskShape.fillStyle(0xffffff);

    maskShape.fillRect(
        200,
        145,
        620,
        430
    );

    reelMask = maskShape.createGeometryMask();

    createGrid(this);

    // SPIN BUTTON CENTERED
    const spinButton = this.add.text(500, 640, 'SPIN', {
        fontSize: '32px',
        backgroundColor: '#ff0000',
        color: '#ffffff',
        padding: {
            left: 20,
            right: 20,
            top: 10,
            bottom: 10
        }
    }).setOrigin(0.5);

    spinButton.setDepth(100);

    spinButton.setInteractive();

    spinButton.on('pointerdown', () => {

        spinReels();

    });
}

function createGrid(scene) {

    for (let row = 0; row < ROWS; row++) {

        grid[row] = [];
        backgrounds[row] = [];

        for (let col = 0; col < COLS; col++) {

            let x = START_X + (col * SPACING_X);
            let y = START_Y + (row * SPACING_Y);

            // BACKGROUND TILE
            let bg = scene.add.rectangle(
                x,
                y,
                85,
                85,
                0x333333
            )
            .setStrokeStyle(3, 0xffffff);

            backgrounds[row][col] = bg;

            // RANDOM SYMBOL
            let randomSymbol = Phaser.Utils.Array.GetRandom(symbols);

            // SYMBOL IMAGE
            let symbol = scene.add.image(
                x,
                y,
                randomSymbol
            );

            symbol.setDisplaySize(65, 65);

            symbol.setMask(reelMask);

            symbol.originalX = x;
            symbol.originalY = y;

            grid[row][col] = symbol;
        }
    }
}

function spinReels() {

    if (isSpinning) {
        return;
    }

    isSpinning = true;

    tumbleTotalWin = 0;
    isTumbling = true;

    // RESET GRID
    for (let row = 0; row < ROWS; row++) {

        for (let col = 0; col < COLS; col++) {

            backgrounds[row][col].setFillStyle(0x333333);

            if (grid[row][col] !== null) {

                grid[row][col].setVisible(true);

                grid[row][col].y = grid[row][col].originalY;
            }
        }
    }

    // REMOVE BET
    credits -= betAmount;

    creditsText.setText("Credits: " + credits);

    resultText.setText("SPINNING...");

    // SPIN EFFECT
    let spinInterval = setInterval(() => {

        for (let row = 0; row < ROWS; row++) {

            for (let col = 0; col < COLS; col++) {

                if (grid[row][col] !== null) {

                    let symbol = grid[row][col];

                    let randomSymbol =
                        Phaser.Utils.Array.GetRandom(symbols);

                    symbol.setTexture(randomSymbol);

                    symbol.y =
                        symbol.originalY +
                        Phaser.Math.Between(-2, 2);
                }
            }
        }

    }, 80);

    // STOP SPIN
    setTimeout(() => {

        clearInterval(spinInterval);

        for (let row = 0; row < ROWS; row++) {

            for (let col = 0; col < COLS; col++) {

                if (grid[row][col] !== null) {

                    let symbol = grid[row][col];

                    let finalSymbol =
                        Phaser.Utils.Array.GetRandom(symbols);

                    symbol.setTexture(finalSymbol);

                    symbol.y = symbol.originalY;
                }
            }
        }

        checkWin();

        isSpinning = false;

    }, 2000);
}

function checkWin() {

    let counts = {};

    let winningPositions = [];

    // RESET TILE COLORS
    for (let row = 0; row < ROWS; row++) {

        for (let col = 0; col < COLS; col++) {

            backgrounds[row][col]
                .setFillStyle(0x333333);
        }
    }

    // COUNT SYMBOLS
    for (let row = 0; row < ROWS; row++) {

        for (let col = 0; col < COLS; col++) {

            if (grid[row][col] !== null) {

                let symbolKey =
                    grid[row][col].texture.key;

                if (!counts[symbolKey]) {

                    counts[symbolKey] = 0;
                }

                counts[symbolKey]++;
            }
        }
    }

    let totalWin = 0;

    // CHECK WINS
    for (let symbol in counts) {

        if (counts[symbol] >= 8) {

            let winAmount =
                symbolValues[symbol] *
                counts[symbol];

            totalWin += winAmount;

            // STORE WINNING POSITIONS
            for (let row = 0; row < ROWS; row++) {

                for (let col = 0; col < COLS; col++) {

                    if (
                        grid[row][col] !== null &&
                        grid[row][col].texture.key === symbol
                    ) {

                        backgrounds[row][col]
                            .setFillStyle(0xffff00);

                        winningPositions.push({
                            row: row,
                            col: col
                        });
                    }
                }
            }
        }
    }

    // WIN
    if (totalWin > 0) {

        tumbleTotalWin += totalWin;

        resultText.setText(
            "TOTAL WIN " + tumbleTotalWin
        );

        setTimeout(() => {

            removeWinningSymbols(winningPositions);

        }, 800);
    }
    else {

        if (isTumbling) {

            credits += tumbleTotalWin;

            creditsText.setText(
                "Credits: " + credits
            );

            resultText.setText(
                "PAID " + tumbleTotalWin
            );

            isTumbling = false;
        }
    }
}

function removeWinningSymbols(winningPositions) {

    for (let i = 0; i < winningPositions.length; i++) {

        let pos = winningPositions[i];

        let symbol = grid[pos.row][pos.col];

        symbol.setVisible(false);

        grid[pos.row][pos.col] = null;

        backgrounds[pos.row][pos.col]
            .setFillStyle(0x333333);
    }

    resultText.setText(
        "TOTAL WIN " + tumbleTotalWin
    );

    setTimeout(() => {

        dropSymbols();

    }, 500);
}

function dropSymbols() {

    for (let col = 0; col < COLS; col++) {

        let symbolKeys = [];

        for (let row = ROWS - 1; row >= 0; row--) {

            if (grid[row][col] !== null) {

                symbolKeys.push(
                    grid[row][col].texture.key
                );

                grid[row][col].destroy();

                grid[row][col] = null;
            }
        }

        let currentRow = ROWS - 1;

        for (let i = 0; i < symbolKeys.length; i++) {

            let x =
                START_X + (col * SPACING_X);

            let targetY =
                START_Y + (currentRow * SPACING_Y);

            let startY = targetY - 120;

            let symbol =
                game.scene.scenes[0].add.image(
                    x,
                    startY,
                    symbolKeys[i]
                );

            symbol.setDisplaySize(65, 65);

            symbol.setMask(reelMask);

            symbol.originalX = x;
            symbol.originalY = targetY;

            grid[currentRow][col] = symbol;

            game.scene.scenes[0].tweens.add({
                targets: symbol,
                y: targetY,
                duration: 300
            });

            currentRow--;
        }
    }

    setTimeout(() => {

        spawnNewSymbols();

    }, 350);
}

function spawnNewSymbols() {

    for (let col = 0; col < COLS; col++) {

        for (let row = 0; row < ROWS; row++) {

            if (grid[row][col] === null) {

                let x =
                    START_X + (col * SPACING_X);

                let finalY =
                    START_Y + (row * SPACING_Y);

                let startY = finalY - 300;

                let randomSymbol =
                    Phaser.Utils.Array.GetRandom(symbols);

                let symbol =
                    game.scene.scenes[0].add.image(
                        x,
                        startY,
                        randomSymbol
                    );

                symbol.setDisplaySize(65, 65);

                symbol.setMask(reelMask);

                symbol.originalX = x;
                symbol.originalY = finalY;

                grid[row][col] = symbol;

                game.scene.scenes[0].tweens.add({
                    targets: symbol,
                    y: finalY,
                    duration: 400
                });
            }
        }
    }

    setTimeout(() => {

        checkWin();

    }, 500);
}