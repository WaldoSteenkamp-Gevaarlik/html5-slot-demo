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

let tumbleMultipliers = [];
let finalSpinBoard = [];
let stoppedColumns = [];

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
let bigWinText;
let betText;

let isSpinning = false;

// AUTO SPINS
let autoSpinsRemaining = 0;
let autoSpinPaused = false;

let autoSpinText;
let autoSpinButtons = [];
let currentBonusMultiplier = 0;
let multiplierText;
let activeMultiplierSprites = [];
const BONUS_BUY_COST = 100;


function preload() {

    this.load.image(
    'logo',
    'assets/ui/logo.png'
);

    this.load.image(
    'bg',
    'assets/backgrounds/bg.png'
);

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

this.load.image(
    'multi2',
    'assets/symbols/2x.png'
);

this.load.image(
    'multi5',
    'assets/symbols/5x.png'
);

this.load.image(
    'multi10',
    'assets/symbols/10x.png'
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

    
    // BACKGROUND
let bg = this.add.image(
    500,
    350,
    'bg'
);

bg.setDisplaySize(
    1000,
    700
);

bg.setDepth(-100);

    this.textures.each(texture => {

    texture.setFilter(
        Phaser.Textures.FilterMode.LINEAR
    );

    let logo = this.add.image(
    500,
    108,
    'logo'
);

logo.setScale(0.35);

});

    

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

// BET TEXT
betText = this.add.text(
    640,
    620,
    'Bet: ' + betAmount,
    {
        fontSize: '28px',
        color: '#ffffff'
    }
);

// BET DOWN BUTTON
const betDownButton = this.add.text(
    590,
    620,
    '-',
    {
        fontSize: '32px',
        backgroundColor: '#000000',
        color: '#ffffff',
        fixedWidth: 40,
        fixedHeight: 40,
        align: 'center'
    }
)
.setInteractive();

betDownButton.on('pointerdown', () => {

    if (isSpinning) return;

    betAmount = Math.max(
        1,
        betAmount - 1
    );

    betText.setText(
        'Bet: ' + betAmount
    );
});

// BET UP BUTTON
const betUpButton = this.add.text(
    770,
    620,
    '+',
    {
        fontSize: '32px',
        backgroundColor: '#444444',
        color: '#ffffff',
        fixedWidth: 40,
        fixedHeight: 40,
        align: 'center'
    }
)
.setInteractive();

betUpButton.on('pointerdown', () => {

    if (isSpinning) return;

    betAmount += 1;

    betText.setText(
        'Bet: ' + betAmount
    );
});


   

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
    multiplierText = this.add.text(
    500,
    150,
    '',
    {
        fontSize: '36px',
        color: '#ff0000',
        fontStyle: 'bold'
    }
)
.setOrigin(0.5)
.setDepth(150);

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

// BIG WIN TEXT
bigWinText = this.add.text(
    500,
    300,
    '',
    {
        fontSize: '72px',
        color: '#ffd700',
        fontStyle: 'bold',
        stroke: '#000000',
        strokeThickness: 10,
        align: 'center'
    }
)
.setOrigin(0.5)
.setDepth(500)
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

// BUY BONUS BUTTON
const buyBonusButton = this.add.text(
    90,
    420,
    'BUY\nBONUS',
    {
        fontSize: '28px',
        backgroundColor: '#9900ff',
        color: '#ffffff',
        align: 'center',
        fixedWidth: 160,
        fixedHeight: 120,
        padding: {
            top: 18
        }
    }
)
.setOrigin(0.5)
.setInteractive();

buyBonusButton.setDepth(100);

buyBonusButton.on('pointerdown', () => {

    if (
        isSpinning ||
        inFreeSpins ||
        waitingForBonusStart
    ) {
        return;
    }

    // NOT ENOUGH CREDITS
    if (credits < BONUS_BUY_COST) {

        resultText.setText(
            "NOT ENOUGH CREDITS"
        );

        return;
    }

    // PAY
    credits -= BONUS_BUY_COST;

    creditsText.setText(
        "Credits: " + credits
    );

    buyBonusRound();
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

    // CLEAR OLD MULTIPLIERS
multiplierText.setText('');

// REMOVE MULTIPLIER SPRITES
activeMultiplierSprites.forEach(
    sprite => sprite.destroy()
);

activeMultiplierSprites = [];

// CLEAR MULTIPLIER POSITIONS
tumbleMultipliers.forEach(multi => {

    // SAFETY CHECK
    if (
        grid[multi.row][multi.col] === null
    ) {

        let x =
            START_X +
            (multi.col * SPACING_X);

        let y =
            START_Y +
            (multi.row * SPACING_Y);

        let randomSymbol =
            getRandomSymbol();

        let symbol =
            game.scene.scenes[0]
            .add.image(
                x,
                y,
                randomSymbol
            );

        symbol.setScale(0.06);

        symbol.setMask(reelMask);

        symbol.originalX = x;
        symbol.originalY = y;

        grid[multi.row][multi.col] =
            symbol;
    }
});

tumbleMultipliers = [];

currentBonusMultiplier = 0;

// REBUILD EMPTY GRID SPACES
for (let row = 0; row < ROWS; row++) {

    for (let col = 0; col < COLS; col++) {

        if (grid[row][col] === null) {

            let x =
                START_X + (col * SPACING_X);

            let y =
                START_Y + (row * SPACING_Y);

            let randomSymbol =
                getRandomSymbol();

            let symbol =
                game.scene.scenes[0]
                .add.image(
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

// PREGENERATE FINAL BOARD
finalSpinBoard = [];

for (let row = 0; row < ROWS; row++) {

    finalSpinBoard[row] = [];

    for (let col = 0; col < COLS; col++) {

        // NORMAL SYMBOL
        finalSpinBoard[row][col] =
            getRandomSymbol();

        // BONUS MULTIPLIER CHANCE
        if (
            inFreeSpins &&
            Phaser.Math.Between(1,100) <= 12
        ) {

            let multipliers = [

                {
                    value: 2,
                    key: 'multi2'
                },

                {
                    value: 5,
                    key: 'multi5'
                },

                {
                    value: 10,
                    key: 'multi10'
                }
            ];

            let picked =
                Phaser.Utils.Array.GetRandom(
                    multipliers
                );

            finalSpinBoard[row][col] = {

                multiplier: true,

                value: picked.value,

                key: picked.key
            };
        }
    }
}


stoppedColumns = [];

    // SPIN EFFECT
    let spinInterval = setInterval(() => {

    for (let col = 0; col < COLS; col++) {

        for (let row = 0; row < ROWS; row++) {

            if (grid[row][col] !== null) {

                let symbol =
                    grid[row][col];

                // FAST SYMBOL CYCLING
                if (
    spinInterval !== null &&
    !stoppedColumns.includes(col)
) {

    symbol.setTexture(
        getRandomSymbol()
    );
}

                if (!stoppedColumns.includes(col)) {

    symbol.y =
        symbol.originalY +
        Phaser.Math.Between(-8, 8);

} else {

    symbol.y = symbol.originalY;
}

                if (!stoppedColumns.includes(col)) {

    symbol.setScale(
        0.058,
        0.068
    );

} else {

    symbol.setScale(0.06);
}
            }
        }
    }

}, 45);

    // STOP SPIN
    setTimeout(() => {

        clearInterval(spinInterval);
        // STOP ALL SYMBOL RANDOMIZING
spinInterval = null;

// APPLY FINAL BOARD IMMEDIATELY
for (let row = 0; row < ROWS; row++) {

    for (let col = 0; col < COLS; col++) {

        let boardItem =
            finalSpinBoard[row][col];

        let symbol =
            grid[row][col];

        if (symbol === null) {
            continue;
        }

        // NORMAL SYMBOL
        if (
            typeof boardItem === 'string'
        ) {

            symbol.setTexture(
                boardItem
            );

            symbol.setVisible(true);
        }

        // MULTIPLIER
        else {

            symbol.setTexture(
                boardItem.key
            );

            symbol.setVisible(true);

            tumbleMultipliers.push({

                value: boardItem.value,

                row: row,

                col: col,

                sprite: symbol
            });
        }

        symbol.y =
            symbol.originalY;

        symbol.setScale(0.06);
    }
}

        for (let col = 0; col < COLS; col++) {

    setTimeout(() => {

        stoppedColumns.push(col);

        for (let row = 0; row < ROWS; row++) {

            if (grid[row][col] !== null) {

                let symbol =
                    grid[row][col];

                symbol.setVisible(true);

                game.scene.scenes[0]
                .tweens.add({

                    targets: symbol,

                    y: symbol.originalY + 10,

                    duration: 80,

                    yoyo: true,

                    ease: 'Sine.easeOut'
                });
            }
        }

    }, col * 180);
}

// CHECK WIN AFTER ALL REELS STOP
setTimeout(() => {

    checkWin();

    isSpinning = false;

}, COLS * 180 + 200);

}, 2000);
}

function buyBonusRound() {

    isSpinning = true;

    resultText.setText(
        "BUY BONUS..."
    );

    // CLEAR OLD MULTIPLIERS
    activeMultiplierSprites.forEach(
        sprite => sprite.destroy()
    );

    activeMultiplierSprites = [];
    tumbleMultipliers = [];

    // SPIN EFFECT
    let spinInterval = setInterval(() => {

        for (let row = 0; row < ROWS; row++) {

            for (let col = 0; col < COLS; col++) {

                let symbol =
                    grid[row][col];

                let randomSymbol =
                    getRandomSymbol();

                symbol.setTexture(
                    randomSymbol
                );
            }
        }

    }, 80);



    // STOP SPIN
    setTimeout(() => {

        clearInterval(spinInterval);

        // RANDOM SYMBOLS
        for (let row = 0; row < ROWS; row++) {

            for (let col = 0; col < COLS; col++) {

                let randomSymbol =
                    getRandomSymbol();

                grid[row][col]
                .setTexture(randomSymbol);

                grid[row][col]
                .setVisible(true);
            }
        }

        // FORCE 3 SCATTERS
        let forcedPositions = [

            { row: 0, col: 1 },
            { row: 2, col: 3 },
            { row: 4, col: 5 }
        ];

        forcedPositions.forEach(pos => {

            grid[pos.row][pos.col]
            .setTexture('scatter');
        });

        resultText.setText(
            "FREE SPINS WON!"
        );

        setTimeout(() => {

            inFreeSpins = true;

            freeSpins = 10;

            freeSpinTotalWin = 0;

            freeSpinsText.setText(
                "FREE SPINS: " + freeSpins
            );

            isSpinning = false;

            spinReels();

        }, 1800);

    }, 2000);
}

function showBigWin(amount) {

    let title = '';

    // WIN LEVELS
    if (amount >= 1000) {

        title = 'MAX WIN';
    }
    else if (amount >= 500) {

        title = 'SUPER WIN';
    }
    else if (amount >= 150) {

        title = 'MEGA WIN';
    }
    else if (amount >= 50) {

        title = 'BIG WIN';
    }
    else {

        return;
    }

    bigWinText.setScale(0.2);

    bigWinText.setAlpha(1);

    bigWinText.setVisible(true);

    let displayValue = {
        value: 0
    };

    // POP ANIMATION
    game.scene.scenes[0].tweens.add({

        targets: bigWinText,

        scaleX: 1,
        scaleY: 1,

        duration: 400,

        ease: 'Back.easeOut'
    });

    // COUNT UP
    game.scene.scenes[0].tweens.add({

        targets: displayValue,

        value: amount,

        duration: 2500,

        onUpdate: () => {

            bigWinText.setText(

                title +
                '\n' +
                Math.floor(displayValue.value)
            );
        },

        onComplete: () => {

            setTimeout(() => {

                game.scene.scenes[0]
                .tweens.add({

                    targets: bigWinText,

                    alpha: 0,

                    duration: 500,

                    onComplete: () => {

                        bigWinText
                        .setVisible(false);
                    }
                });

            }, 1000);
        }
    });
}

function rollBonusMultiplier() {
    console.log("MULTIPLIER SPAWNED");

    

    // ALWAYS SPAWN FOR TESTING

    let multipliers = [

        {
            value: 2,
            key: 'multi2'
        },

        {
            value: 5,
            key: 'multi5'
        },

        {
            value: 10,
            key: 'multi10'
        }
    ];

    let picked =
        Phaser.Utils.Array.GetRandom(
            multipliers
        );

    

    

    let sprite =
    game.scene.scenes[0]
    .add.image(
        0,
        -120,
        picked.key
    );

    sprite.setScale(0.06);
    sprite.setMask(reelMask);

    sprite.setDepth(1);

    activeMultiplierSprites.push(
        sprite
    );

    

    // RANDOM GRID POSITION
// FIND EMPTY POSITIONS
let emptyPositions = [];

for (let row = 0; row < ROWS; row++) {

    for (let col = 0; col < COLS; col++) {

        if (grid[row][col] === null) {

            emptyPositions.push({
                row: row,
                col: col
            });
        }
    }
}

// NO EMPTY SPACES
if (emptyPositions.length <= 0) {
    return;
}

// PICK RANDOM EMPTY SPACE
let pickedPos =
    Phaser.Utils.Array.GetRandom(
        emptyPositions
    );

    tumbleMultipliers.push({

    value: picked.value,

    sprite: sprite,

    row: pickedPos.row,

    col: pickedPos.col
});

let x =
    START_X +
    (pickedPos.col * SPACING_X);

let targetY =
    START_Y +
    (pickedPos.row * SPACING_Y);

// MOVE SPRITE TO START POSITION
sprite.x = x;

// DROP ANIMATION
game.scene.scenes[0]
.tweens.add({

    targets: sprite,

    y: targetY,

    duration: 700,

    ease: 'Bounce.easeOut'
});

    // TEXT
    multiplierText.setText(
        picked.value + "x"
    );
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

          if (
    grid[row][col] !== null
)
{

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
    (
        symbolValues[symbol] *
        counts[symbol]
    ) * betAmount;

            totalWin += winAmount;

            // HIGHLIGHT
            for (let row = 0; row < ROWS; row++) {

                for (let col = 0; col < COLS; col++) {

                    let hasMultiplier =
    tumbleMultipliers.some(
        multi =>
            multi.row === row &&
            multi.col === col
    );

if (
    grid[row][col] !== null &&
    grid[row][col]
        .texture.key === symbol &&
    !hasMultiplier
)
    
                    {

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
        // BONUS MULTIPLIERS


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

            // APPLY BONUS MULTIPLIERS
if (
    inFreeSpins &&
    tumbleMultipliers.length > 0
) {

    let totalMultiplier = 0;

    tumbleMultipliers.forEach(m => {

        totalMultiplier += m.value;

    });

    let bonusWin =
        tumbleTotalWin *
        totalMultiplier;

    tumbleTotalWin += bonusWin;

    freeSpinTotalWin += bonusWin;

    resultText.setText(
    "TOTAL WIN " +
    tumbleTotalWin +
    "  x" +
    totalMultiplier
);

// HIDE OLD MULTIPLIER TEXT
multiplierText.setText('');
}

isTumbling = false;
// SHOW BIG WIN AFTER ALL TUMBLES
showBigWin(tumbleTotalWin);

setTimeout(() => {

    multiplierText.setText('');

}, 1200);




            // BONUS COMPLETE
            if (
                inFreeSpins &&
                freeSpins <= 0
            ) {

                

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

    // RESET BONUS STATE
    inFreeSpins = false;

    autoSpinPaused = false;

    // RESUME AUTO SPINS
    if (autoSpinsRemaining > 0) {

        setTimeout(() => {

            spinReels();

        }, 1000);
    }
});

                }, 4500);

                return;
            }

            // AUTO BONUS SPINS
            if (
                inFreeSpins &&
                freeSpins > 0
            ) {

                setTimeout(() => {

                    spinReels();

                }, 4500);
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

// POP ANIMATION
game.scene.scenes[0]
.tweens.add({

    targets: symbol,

    scaleX: 0.085,
    scaleY: 0.085,

    y: symbol.y - 12,

    duration: 120,

    yoyo: true,

    repeat: 1,

    ease: 'Sine.easeInOut'
});

// HIDE AFTER POP
setTimeout(() => {

    symbol.setVisible(false);

grid[pos.row][pos.col] = null;

}, 200);

        backgrounds[pos.row][pos.col]
            .setFillStyle(0x333333);
    }

    resultText.setText(
        "TOTAL WIN " + tumbleTotalWin
    );

    

setTimeout(() => {

    dropSymbols();

}, 700);
}
function dropSymbols() {

    // MOVE MULTIPLIERS DOWN FIRST
    tumbleMultipliers.forEach(multi => {

        let newRow = multi.row;

        // FIND LOWEST EMPTY SPACE
        while (
            newRow + 1 < ROWS &&
            grid[newRow + 1][multi.col] === null &&
            !tumbleMultipliers.some(other =>
                other !== multi &&
                other.row === newRow + 1 &&
                other.col === multi.col
            )
        ) {
            newRow++;
        }

        // UPDATE ROW
        multi.row = newRow;

        // MOVE SPRITE
        let targetY =
            START_Y +
            (newRow * SPACING_Y);

        game.scene.scenes[0].tweens.add({
            targets: multi.sprite,
            y: targetY,
            duration: 300
        });
    });

    // NORMAL SYMBOL DROPS
    for (let col = 0; col < COLS; col++) {

        let symbolKeys = [];

        for (
            let row = ROWS - 1;
            row >= 0;
            row--
        ) {

            let hasMultiplier =
                tumbleMultipliers.some(
                    multi =>
                        multi.row === row &&
                        multi.col === col
                );

            if (
                grid[row][col] !== null &&
                !hasMultiplier
            ) {

                symbolKeys.push(
    grid[row][col].texture.key
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

            // SKIP MULTIPLIER POSITIONS
            while (
                tumbleMultipliers.some(
                    multi =>
                        multi.row === currentRow &&
                        multi.col === col
                )
            ) {
                currentRow--;
            }

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

            

            let hasMultiplier =
    tumbleMultipliers.some(
        multi =>
            multi.row === row &&
            multi.col === col
    );

if (
    grid[row][col] === null &&
    !hasMultiplier
)
            {

                let x =
                    START_X +
                    (col * SPACING_X);

                let finalY =
                    START_Y +
                    (row * SPACING_Y);

                let startY =
                    finalY - 300;

// RANDOM BONUS MULTIPLIER SPAWN
let shouldSpawnMultiplier =
    inFreeSpins &&
    Phaser.Math.Between(1, 100) <= 18 &&
    !tumbleMultipliers.some(
        multi =>
            multi.row === row &&
            multi.col === col
    );

if (shouldSpawnMultiplier) {

    let multipliers = [

        {
            value: 2,
            key: 'multi2'
        },

        {
            value: 5,
            key: 'multi5'
        },

        {
            value: 10,
            key: 'multi10'
        }
    ];

    let picked =
        Phaser.Utils.Array.GetRandom(
            multipliers
        );

    let multiSprite =
        game.scene.scenes[0]
        .add.image(
            x,
            startY,
            picked.key
        );

    multiSprite.setScale(0.06);

    multiSprite.setMask(reelMask);

    multiSprite.setDepth(5);

    multiSprite.originalX = x;
    multiSprite.originalY = finalY;

    activeMultiplierSprites.push(
        multiSprite
    );

    tumbleMultipliers.push({

        value: picked.value,

        sprite: multiSprite,

        row: row,

        col: col
    });

    game.scene.scenes[0]
    .tweens.add({

        targets: multiSprite,

        y: finalY,

        duration: 400
    });

    continue;
}

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