const config = {
    type: Phaser.AUTO,

    width: 1000,
    height: 700,

    backgroundColor: '#1a1a1a',

    render: {
        antialias: true,
        pixelArt: false,
        roundPixels: false
    },

    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH
    },

    resolution: window.devicePixelRatio,

    scene: {
        preload: preload,
        create: create
    }
};

const game = new Phaser.Game(config);

// SYMBOLS
let symbols = [
    "apple",
    "banana",
    "cherry",
    "diamond",
    "grapes",
    "lemon",
    "seven",
    "star",
    "watermelon",
    "scatter"
];

// SYMBOL VALUES
let symbolValues = {

    apple: 4,
    banana: 4,

    cherry: 5,
    lemon: 5,

    watermelon: 6,
    grapes: 8,

    star: 10,
    diamond: 15,

    seven: 25
};

// GRID SETTINGS
const ROWS = 5;
const COLS = 6;

const START_X = 250;
const START_Y = 190;

const SPACING_X = 100;
const SPACING_Y = 80;

// GRID
let grid = [];
let backgrounds = [];

// MASK
let reelMask;

// PLAYER
let credits = 100;
let betAmount = 10;

// WINS
let tumbleTotalWin = 0;
let isTumbling = false;

// FREE SPINS
let freeSpins = 0;
let inFreeSpins = false;
let freeSpinTotalWin = 0;
let waitingForBonusStart = false;

// UI
let creditsText;
let resultText;
let freeSpinsText;
let bonusText;

let isSpinning = false;

// AUTO SPINS
let autoSpinsRemaining = 0;
let autoSpinPaused = false;
if (autoSpinsRemaining > 0) {

    setTimeout(() => {

        spinReels();

    }, 1000);
}
let autoSpinText;
let autoSpinButtons = [];

function preload() {

    // LOAD SYMBOLS
    this.load.image('apple', 'assets/symbols/apple.png');
    this.load.image('banana', 'assets/symbols/banana.png');
    this.load.image('cherry', 'assets/symbols/cherry.png');
    this.load.image('diamond', 'assets/symbols/diamond.png');
    this.load.image('grapes', 'assets/symbols/grapes.png');
    this.load.image('lemon', 'assets/symbols/lemon.png');
    this.load.image('seven', 'assets/symbols/seven.png');
    this.load.image('star', 'assets/symbols/star.png');
    this.load.image('watermelon', 'assets/symbols/watermelon.png');

    // SCATTER
    this.load.image(
        'scatter',
        'assets/symbols/scatter.png'
    );
}

// WEIGHTED SYMBOLS
function getRandomSymbol() {

    // VERY RARE SCATTER
    if (
        Phaser.Math.Between(1, 100) <= 2
    ) {

        return "scatter";
    }

    let weightedSymbols = [

        // LOW SYMBOLS
        "apple",
        "apple",
        "apple",
        "apple",

        "banana",
        "banana",
        "banana",
        "banana",

        "cherry",
        "cherry",
        "cherry",
        "cherry",

        "lemon",
        "lemon",
        "lemon",
        "lemon",

        // MID SYMBOLS
        "watermelon",
        "watermelon",
        "watermelon",

        "grapes",
        "grapes",
        "grapes",

        // HIGH SYMBOLS
        "star",
        "star",

        "diamond",

        "seven"
    ];

    return Phaser.Utils.Array.GetRandom(
        weightedSymbols
    );
}

function create() {

    this.textures.each(texture => {

    texture.setFilter(
        Phaser.Textures.FilterMode.LINEAR
    );

});

    // TITLE
    this.add.text(500, 40, 'MY SLOT MACHINE', {
        fontSize: '40px',
        color: '#ffffff'
    }).setOrigin(0.5);

    // CREDITS
    creditsText = this.add.text(
        20,
        650,
        'Credits: 100',
        {
            fontSize: '28px',
            color: '#ffff00'
        }
    );

    // FREE SPINS
    freeSpinsText = this.add.text(
        20,
        610,
        '',
        {
            fontSize: '28px',
            color: '#ff66ff'
        }
    );

    // RESULT
    resultText = this.add.text(
        500,
        585,
        'READY',
        {
            fontSize: '32px',
            color: '#00ff00'
        }
    ).setOrigin(0.5);

    resultText.setDepth(100);

    // BONUS POPUP
    bonusText = this.add.text(
        500,
        350,
        '',
        {
            fontSize: '42px',
            color: '#ffcc00',
            align: 'center',
            backgroundColor: '#000000',
            padding: {
                left: 20,
                right: 20,
                top: 20,
                bottom: 20
            }
        }
    )
    .setOrigin(0.5)
    .setDepth(200)
    .setVisible(false);

    // MASK
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

    // SPIN BUTTON
    const spinButton = this.add.text(
    500,
    640,
    'SPIN',
    {
        fontSize: '24px',
        backgroundColor: '#ff0000',
        color: '#ffffff',
        align: 'center',
        fixedWidth: 160,
        fixedHeight: 58,
        padding: {
            top: 14
        }
    }
)
.setOrigin(0.5);

spinButton.setDepth(100);

spinButton.setInteractive();

    spinButton.on('pointerdown', () => {

        if (
            !waitingForBonusStart &&
            !inFreeSpins
        ) {

            spinReels();
        }
    });

// AUTO BUTTON
const autoButton = this.add.text(
    900,
    640,
    'AUTO SPIN',
    {
        fontSize: '20px',
        backgroundColor: '#444444',
        color: '#ffffff',
        align: 'center',
        fixedWidth: 160,
        fixedHeight: 58,
        padding: {
            top: 16
        }
    }
)
.setOrigin(0.5)
.setInteractive();

autoButton.setDepth(100);

// AUTO SPIN STATUS
autoSpinText = this.add.text(
    500,
    105,
    '',
    {
        fontSize: '24px',
        color: '#00ffff'
    }
).setOrigin(0.5);

const autoOptions = [
    25,
    50,
    75,
    100,
    500,
    1000
];

let autoMenu = [];

autoOptions.forEach((amount, index) => {

    let btn = this.add.text(
    900,
    580 - (index * 45),
        amount,
        {
            fontSize: '22px',
            backgroundColor: '#222222',
            color: '#ffffff',
            padding: {
                left: 15,
                right: 15,
                top: 8,
                bottom: 8
            }
        }
    )
    .setOrigin(0.5)
    .setInteractive()
    .setVisible(false);

    btn.setDepth(100);

    btn.on('pointerdown', () => {

        if (
            isSpinning ||
            waitingForBonusStart
        ) {
            return;
        }

        autoSpinsRemaining = amount;

        updateAutoSpinText();

        autoMenu.forEach(b => {

            b.setVisible(false);

        });

        spinReels();
    });

    autoMenu.push(btn);
});

// OPEN/CLOSE AUTO MENU
autoButton.on('pointerdown', () => {

    let visible =
        !autoMenu[0].visible;

    autoMenu.forEach(btn => {

        btn.setVisible(visible);

    });
});


}

function createGrid(scene) {

    for (let row = 0; row < ROWS; row++) {

        grid[row] = [];
        backgrounds[row] = [];

        for (let col = 0; col < COLS; col++) {

            let x =
                START_X + (col * SPACING_X);

            let y =
                START_Y + (row * SPACING_Y);

            // BACKGROUND
            let bg = scene.add.rectangle(
                x,
                y,
                85,
                85,
                0x333333
            )
            .setStrokeStyle(3, 0xffffff);

            backgrounds[row][col] = bg;

            // SYMBOL
            let randomSymbol =
                getRandomSymbol();

            let symbol = scene.add.image(
                x,
                y,
                randomSymbol
            );

            symbol.setScale(0.06);

            symbol.setMask(reelMask);

            symbol.originalX = x;
            symbol.originalY = y;

            grid[row][col] = symbol;
        }
    }
}

function updateAutoSpinText() {

    if (autoSpinsRemaining > 0) {

        autoSpinText.setText(
            "AUTO SPINS LEFT: " +
            autoSpinsRemaining
        );
    }
    else {

        autoSpinText.setText('');
    }
}

function spinReels() {

    if (isSpinning) {
        return;
    }

    isSpinning = true;

    tumbleTotalWin = 0;
    isTumbling = true;

    // RESET
    for (let row = 0; row < ROWS; row++) {

        for (let col = 0; col < COLS; col++) {

            backgrounds[row][col]
                .setFillStyle(0x333333);

            if (grid[row][col] !== null) {

                grid[row][col]
                    .setVisible(true);

                grid[row][col].y =
                    grid[row][col].originalY;
            }
        }
    }

    // NORMAL SPIN
    if (!inFreeSpins) {

    credits -= betAmount;

    // AUTO SPINS
    if (autoSpinsRemaining > 0) {

        autoSpinsRemaining--;

        updateAutoSpinText();
    }
}
    else {

        freeSpins--;

        freeSpinsText.setText(
            "FREE SPINS: " + freeSpins
        );
    }

    creditsText.setText(
        "Credits: " + credits
    );

    resultText.setText(
        "SPINNING..."
    );

    // SPIN EFFECT
    let spinInterval = setInterval(() => {

        for (let row = 0; row < ROWS; row++) {

            for (let col = 0; col < COLS; col++) {

                if (grid[row][col] !== null) {

                    let symbol =
                        grid[row][col];

                    let randomSymbol =
                        getRandomSymbol();

                    symbol.setTexture(
                        randomSymbol
                    );

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

                    let symbol =
                        grid[row][col];

                    let finalSymbol =
                        getRandomSymbol();

                    symbol.setTexture(
                        finalSymbol
                    );

                    symbol.y =
                        symbol.originalY;
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

    // RESET COLORS
    for (let row = 0; row < ROWS; row++) {

        for (let col = 0; col < COLS; col++) {

            backgrounds[row][col]
                .setFillStyle(0x333333);
        }
    }

    // COUNT
    for (let row = 0; row < ROWS; row++) {

        for (let col = 0; col < COLS; col++) {

            if (grid[row][col] !== null) {

                let symbolKey =
                    grid[row][col]
                    .texture.key;

                if (!counts[symbolKey]) {

                    counts[symbolKey] = 0;
                }

                counts[symbolKey]++;
            }
        }
    }

    // SCATTERS
    let scatterCount =
        counts["scatter"] || 0;

    // BONUS TRIGGER
    if (
        scatterCount >= 3 &&
        !inFreeSpins &&
        !waitingForBonusStart
    ) {

        waitingForBonusStart = true;
        autoSpinPaused = true;

        freeSpins = 10;

        freeSpinTotalWin = 0;

        bonusText.setText(
            "FREE SPINS WON!\n10 FREE SPINS\n\nCLICK TO CONTINUE"
        );

        bonusText.setVisible(true);

        bonusText.setInteractive();

        bonusText.once('pointerdown', () => {

            bonusText.setVisible(false);

            waitingForBonusStart = false;

            inFreeSpins = true;

            freeSpinsText.setText(
                "FREE SPINS: " + freeSpins
            );

            // AUTO START BONUS
            setTimeout(() => {

                spinReels();

            }, 1000);
        });
    }

    // RETRIGGER
    if (
        scatterCount >= 3 &&
        inFreeSpins
    ) {

        freeSpins += 5;

        freeSpinsText.setText(
            "FREE SPINS: " + freeSpins
        );

        bonusText.setText(
            "+5 FREE SPINS!"
        );

        bonusText.setVisible(true);

        setTimeout(() => {

            bonusText.setVisible(false);

        }, 2000);
    }

    let totalWin = 0;

    // CHECK WINS
    for (let symbol in counts) {

        if (symbol === "scatter") {
            continue;
        }

        // SWEET BONANZA STYLE
        if (counts[symbol] >= 8) {

            let winAmount =
                symbolValues[symbol] *
                counts[symbol];

            totalWin += winAmount;

            // HIGHLIGHT
            for (let row = 0; row < ROWS; row++) {

                for (let col = 0; col < COLS; col++) {

                    if (
                        grid[row][col] !== null &&
                        grid[row][col]
                        .texture.key === symbol
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

        if (inFreeSpins) {

            freeSpinTotalWin += totalWin;
        }

        resultText.setText(
            "TOTAL WIN " + tumbleTotalWin
        );

        setTimeout(() => {

            removeWinningSymbols(
                winningPositions
            );

        }, 800);
    }
    else {

        if (isTumbling) {

            // NORMAL PAYOUT
            if (!inFreeSpins) {

                credits += tumbleTotalWin;

                creditsText.setText(
                    "Credits: " + credits
                );

                resultText.setText(
                    "PAID " + tumbleTotalWin
                );
            }
            else {

                resultText.setText(
                    "BONUS WIN " +
                    freeSpinTotalWin
                );
            }

            isTumbling = false;

            // BONUS COMPLETE
            if (
                inFreeSpins &&
                freeSpins <= 0
            ) {

                inFreeSpins = false;

                freeSpinsText.setText('');

                setTimeout(() => {

                    bonusText.setText(
                        "BONUS COMPLETE!\n\nTOTAL WIN\n" +
                        freeSpinTotalWin +
                        "\n\nCLICK TO COLLECT"
                    );

                    bonusText.setVisible(true);

                    bonusText.setInteractive();

                    bonusText.once(
                        'pointerdown',
                        () => {

                        credits +=
                            freeSpinTotalWin;

                        creditsText.setText(
                            "Credits: " + credits
                        );

                        bonusText.setVisible(
                            false
                        );

                        freeSpinTotalWin = 0;

                        resultText.setText(
                            "READY"
                        );
                    });

                }, 1500);

                return;
            }

            // AUTO BONUS SPINS
            if (
                inFreeSpins &&
                freeSpins > 0
            ) {

                setTimeout(() => {

                    spinReels();

                }, 1500);
            }
        }

// CONTINUE AUTO SPINS
if (
    !inFreeSpins &&
    !waitingForBonusStart &&
    !autoSpinPaused &&
    autoSpinsRemaining > 0
)

{

    setTimeout(() => {

        spinReels();

    }, 1500);
}

    }
}

function removeWinningSymbols(
    winningPositions
) {

    for (
        let i = 0;
        i < winningPositions.length;
        i++
    ) {

        let pos =
            winningPositions[i];

        let symbol =
            grid[pos.row][pos.col];

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

        for (
            let row = ROWS - 1;
            row >= 0;
            row--
        ) {

            if (grid[row][col] !== null) {

                symbolKeys.push(
                    grid[row][col]
                    .texture.key
                );

                grid[row][col].destroy();

                grid[row][col] = null;
            }
        }

        let currentRow = ROWS - 1;

        for (
            let i = 0;
            i < symbolKeys.length;
            i++
        ) {

            let x =
                START_X +
                (col * SPACING_X);

            let targetY =
                START_Y +
                (currentRow * SPACING_Y);

            let startY =
                targetY - 120;

            let symbol =
                game.scene.scenes[0]
                .add.image(
                    x,
                    startY,
                    symbolKeys[i]
                );

            symbol.setScale(0.06);

            symbol.setMask(reelMask);

            symbol.originalX = x;
            symbol.originalY = targetY;

            grid[currentRow][col] =
                symbol;

            game.scene.scenes[0]
            .tweens.add({
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
                    START_X +
                    (col * SPACING_X);

                let finalY =
                    START_Y +
                    (row * SPACING_Y);

                let startY =
                    finalY - 300;

                let randomSymbol =
                    getRandomSymbol();

                let symbol =
                    game.scene.scenes[0]
                    .add.image(
                        x,
                        startY,
                        randomSymbol
                    );

                symbol.setScale(0.06);

                symbol.setMask(reelMask);

                symbol.originalX = x;
                symbol.originalY = finalY;

                grid[row][col] =
                    symbol;

                game.scene.scenes[0]
                .tweens.add({
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