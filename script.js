let flippedCards = [];
let matchedPairs = 0;
let startTime;
let timer;
let bestTimes = { 'onepiece': null, 'historical': null };

// 取得DOM元素
const cardContainer = document.getElementById('card-container');
const timerDisplay = document.getElementById('timer-display');
const bestTimeDisplay = document.getElementById('best-time-display');
const startScreen = document.getElementById('start-screen');
const gameScreen = document.getElementById('game-screen');
const themeSelect = document.getElementById('theme-select');
const gridSizeSelect = document.getElementById('grid-size-select');
const countdownInput = document.getElementById('countdown-input');

// 加載音效
const successSound = new Audio('match-success.mp3');
const failureSound = new Audio('match-failure.mp3');

// 動態生成卡片
function generateCards(theme, gridSize) {
    cardContainer.innerHTML = '';  
    flippedCards = [];
    matchedPairs = 0;

    let backImages = [];
    // 設定每個主題的背面圖片
    for (let i = 1; i <= 18; i++) {
        if (theme === 'onepiece') {
            backImages.push(`image/onepiece ${i}.png`);
        } else if (theme === 'historical') {
            backImages.push(`image/historical figures ${i}.png`);
        }
    }

    let cardImages = [];
    // 根據網格大小計算所需卡片數量
    const numPairs = (gridSize === '2x2') ? 2 : (gridSize === '4x4') ? 8 : 18;
    
    // 隨機選擇兩兩成對的卡片
    for (let i = 0; i < numPairs; i++) {
        cardImages.push(backImages[i]);
        cardImages.push(backImages[i]);
    }
    
    cardImages.sort(() => Math.random() - 0.5); // 隨機打亂卡片順序

    // 創建卡片
    cardImages.forEach(imageSrc => {
        const card = document.createElement('div');
        card.classList.add('card');

        const frontFace = document.createElement('div');
        frontFace.classList.add('card-face', 'front');
        const frontImage = document.createElement('img');
        // 正面固定顯示主題對應的封面圖片
        frontImage.src = theme === 'onepiece' ? `image/onepiece 0.png` : `image/historical figures 0.png`;
        frontFace.appendChild(frontImage);

        const backFace = document.createElement('div');
        backFace.classList.add('card-face', 'back');
        const backImage = document.createElement('img');
        backImage.src = imageSrc; // 使用隨機分配的背面圖片
        backFace.appendChild(backImage);

        card.appendChild(frontFace);
        card.appendChild(backFace);

        card.addEventListener('click', () => {
            handleCardClick(card, backImage.src);
        });

        cardContainer.appendChild(card);
    });

    // 設定網格布局
    switch (gridSize) {
        case '2x2':
            cardContainer.style.gridTemplateColumns = 'repeat(2, 1fr)';
            break;
        case '4x4':
            cardContainer.style.gridTemplateColumns = 'repeat(4, 1fr)';
            break;
        case '6x6':
            cardContainer.style.gridTemplateColumns = 'repeat(6, 1fr)';
            break;
    }

    displayBestTime(theme, gridSize); // 顯示最佳時間
}

// 遊戲開始時顯示卡片正面並倒數計時後翻回背面
document.getElementById('start-game').addEventListener('click', () => {
    const theme = themeSelect.value;
    const gridSize = gridSizeSelect.value;
    const countdownSeconds = parseInt(countdownInput.value);

    startScreen.style.display = 'none';
    gameScreen.style.display = 'block';

    generateCards(theme, gridSize);

    // 先將卡片翻到正面給玩家看
    document.querySelectorAll('.card').forEach(card => {
        card.classList.add('is-flipped');
    });

    let countdown = countdownSeconds;
    timerDisplay.innerText = `倒數計時: ${countdown}秒`;
    const countdownInterval = setInterval(() => {
        countdown--;
        timerDisplay.innerText = `倒數計時: ${countdown}秒`;
        if (countdown === 0) {
            clearInterval(countdownInterval);

            // 倒數結束後將卡片翻回背面
            document.querySelectorAll('.card').forEach(card => {
                card.classList.remove('is-flipped');
            });

            startTime = Date.now();
            timerDisplay.innerText = `遊戲時間: 0秒`;
            startGameTimer();
        }
    }, 1000);
});

// 重設遊戲
document.getElementById('reset-cards').addEventListener('click', () => {
    resetGame();
});

function resetGame() {
    startScreen.style.display = 'block';
    gameScreen.style.display = 'none';
    clearInterval(timer);
    timerDisplay.innerText = '';
    bestTimeDisplay.innerText = '';
}

// 遊戲計時器
function startGameTimer() {
    timer = setInterval(() => {
        const elapsedTime = Math.floor((Date.now() - startTime) / 1000);
        timerDisplay.innerText = `遊戲時間: ${elapsedTime}秒`;
    }, 1000);
}

// 處理卡片點擊
function handleCardClick(card, backImage) {
    if (flippedCards.length < 2 && !card.classList.contains('matched')) {
        card.classList.add('is-flipped');
        flippedCards.push({ card, backImage });

        if (flippedCards.length === 2) {
            checkForMatch();
        }
    }
}

// 檢查是否配對成功
function checkForMatch() {
    const [firstCard, secondCard] = flippedCards;
    if (firstCard.backImage === secondCard.backImage) {
        successSound.play(); // 播放成功音效
        firstCard.card.classList.add('matched');
        secondCard.card.classList.add('matched');
        matchedPairs++;

        if (matchedPairs === document.querySelectorAll('.card').length / 2) {
            endGame();
        }
    } else {
        failureSound.play(); // 播放失敗音效
        setTimeout(() => {
            firstCard.card.classList.remove('is-flipped');
            secondCard.card.classList.remove('is-flipped');
        }, 1000);
    }

    flippedCards = [];
}

// 遊戲結束
function endGame() {
    clearInterval(timer);
    const elapsedTime = Math.floor((Date.now() - startTime) / 1000);
    timerDisplay.innerText = `遊戲結束！總時間: ${elapsedTime}秒`;

    const theme = themeSelect.value;
    const bestTime = bestTimes[theme];
    if (bestTime === null || elapsedTime < bestTime) {
        bestTimes[theme] = elapsedTime;
        alert(`新紀錄！主題 ${theme} 的最佳挑戰時間是 ${elapsedTime} 秒`);
    }

    displayBestTime(theme, gridSizeSelect.value);
    
    // 2秒後回到初始畫面
    setTimeout(() => {
        resetGame();  // 跳回開始畫面
    }, 2000);
}

// 顯示最佳時間
function displayBestTime(theme, gridSize) {
    const bestTime = bestTimes[theme];
    bestTimeDisplay.innerText = bestTime ? `主題 ${theme} 的最佳挑戰時間: ${bestTime}秒` : '尚無紀錄';
}
