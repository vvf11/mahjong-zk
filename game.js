// Типы плиток маджонга
const TileType = {
    Character: 'Character', // 1-9
    Bamboo: 'Bamboo',      // 1-9
    Circle: 'Circle',      // 1-9
    Wind: 'Wind',          // East, South, West, North
    Dragon: 'Dragon'       // Red, Green, White
};

// Типы ветров
const Wind = {
    East: 'East',
    South: 'South',
    West: 'West',
    North: 'North'
};

// Типы драконов
const Dragon = {
    Red: 'Red',
    Green: 'Green',
    White: 'White'
};

// Класс плитки
class Tile {
    constructor(id, type, value = null, subtype = null) {
        this.id = id;
        this.type = type;
        this.value = value;     // для числовых плиток (Character, Bamboo, Circle)
        this.subtype = subtype; // для Wind и Dragon
    }
    
    // Получение строкового представления плитки
    toString() {
        if (this.type === TileType.Character || this.type === TileType.Bamboo || this.type === TileType.Circle) {
            return `${this.type} ${this.value}`;
        } else if (this.type === TileType.Wind) {
            return `Wind ${this.subtype}`;
        } else if (this.type === TileType.Dragon) {
            return `Dragon ${this.subtype}`;
        }
        return "Unknown Tile";
    }
    
    // Проверка на совпадение плиток (не учитывая ID)
    matches(other) {
        if (this.type !== other.type) return false;
        
        if (this.type === TileType.Character || this.type === TileType.Bamboo || this.type === TileType.Circle) {
            return this.value === other.value;
        } else if (this.type === TileType.Wind || this.type === TileType.Dragon) {
            return this.subtype === other.subtype;
        }
        return false;
    }
}

// Состояния игры
const GameState = {
    WaitingForPlayers: 'WaitingForPlayers',
    InProgress: 'InProgress',
    Completed: 'Completed'
};

// Действия игрока
const PlayerAction = {
    DrawTile: 'DrawTile',
    DiscardTile: 'DiscardTile',
    ClaimWin: 'ClaimWin',
    Pass: 'Pass'
};

// Класс игры в маджонг
class MahjongGame {
    constructor(numPlayers = 2) {
        this.wall = [];            // Стена (не разобранные плитки)
        this.hands = [];           // Руки игроков
        this.discards = [];        // Сброшенные плитки
        this.currentPlayer = 0;    // Текущий игрок
        this.gameState = GameState.WaitingForPlayers;
        
        // Инициализируем игру
        this.setupGame(numPlayers);
    }
    
    // Настройка игры
    setupGame(numPlayers) {
        // Создаем стену плиток
        this.createWall();
        
        // Перемешиваем плитки
        this.shuffleWall();
        
        // Инициализируем руки игроков и стопки сброса
        this.hands = Array(numPlayers).fill().map(() => []);
        this.discards = Array(numPlayers).fill().map(() => []);
        
        // Раздаем начальные руки игрокам
        for (let i = 0; i < numPlayers; i++) {
            for (let j = 0; j < 13; j++) {
                if (this.wall.length > 0) {
                    this.hands[i].push(this.wall.pop());
                }
            }
        }
        
        this.gameState = GameState.InProgress;
    }
    
    // Создание стены плиток
    createWall() {
        this.wall = [];
        let idCounter = 0;
        
        // Создаем числовые плитки (Character, Bamboo, Circle) - по 4 каждого числа от 1 до 9
        for (let num = 1; num <= 9; num++) {
            for (let i = 0; i < 4; i++) {
                this.wall.push(new Tile(idCounter++, TileType.Character, num));
                this.wall.push(new Tile(idCounter++, TileType.Bamboo, num));
                this.wall.push(new Tile(idCounter++, TileType.Circle, num));
            }
        }
        
        // Ветры - по 4 каждого
        const winds = [Wind.East, Wind.South, Wind.West, Wind.North];
        for (let wind of winds) {
            for (let i = 0; i < 4; i++) {
                this.wall.push(new Tile(idCounter++, TileType.Wind, null, wind));
            }
        }
        
        // Драконы - по 4 каждого
        const dragons = [Dragon.Red, Dragon.Green, Dragon.White];
        for (let dragon of dragons) {
            for (let i = 0; i < 4; i++) {
                this.wall.push(new Tile(idCounter++, TileType.Dragon, null, dragon));
            }
        }
    }
    
    // Перемешивание стены
    shuffleWall() {
        for (let i = this.wall.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [this.wall[i], this.wall[j]] = [this.wall[j], this.wall[i]];
        }
    }
    
    // Игрок берет плитку из стены
    drawTile(playerIdx) {
        if (this.gameState !== GameState.InProgress || playerIdx !== this.currentPlayer) {
            return { success: false, message: "Невозможно взять плитку сейчас" };
        }
        
        if (this.wall.length === 0) {
            this.gameState = { state: GameState.Completed, winner: null };
            return { success: true, message: "Плитки закончились, игра завершена ничьей" };
        }
        
        const tile = this.wall.pop();
        this.hands[playerIdx].push(tile);
        
        return { success: true, message: `Игрок ${playerIdx + 1} взял плитку`, tile };
    }
    
    // Игрок сбрасывает плитку
    discardTile(playerIdx, tileId) {
        if (this.gameState !== GameState.InProgress || playerIdx !== this.currentPlayer) {
            return { success: false, message: "Невозможно сбросить плитку сейчас" };
        }
        
        // Находим плитку в руке игрока
        const tileIndex = this.hands[playerIdx].findIndex(t => t.id === tileId);
        if (tileIndex === -1) {
            return { success: false, message: "Плитка не найдена в вашей руке" };
        }
        
        // Удаляем плитку из руки и добавляем в сброс
        const tile = this.hands[playerIdx].splice(tileIndex, 1)[0];
        this.discards[playerIdx].push(tile);
        
        // Передаем ход следующему игроку
        this.currentPlayer = (this.currentPlayer + 1) % this.hands.length;
        
        return { success: true, message: `Игрок ${playerIdx + 1} сбросил плитку` };
    }
    
    // Проверка выигрышной комбинации
    checkWin(playerIdx) {
        const hand = this.hands[playerIdx];
        
        // Подсчет количества каждого типа плиток
        const tileCounts = {};
        for (const tile of hand) {
            const key = tile.toString();
            tileCounts[key] = (tileCounts[key] || 0) + 1;
        }
        
        // Проверяем количество троек и пар
        let triplets = 0;
        let pairs = 0;
        
        for (const count of Object.values(tileCounts)) {
            if (count >= 3) {
                triplets += Math.floor(count / 3);
            }
            if (count % 3 === 2) {
                pairs += 1;
            }
        }
        
        // Выигрышная комбинация - 4 тройки и 1 пара
        return triplets >= 4 && pairs === 1;
    }
    
    // Игрок объявляет победу
    claimWin(playerIdx) {
        if (this.gameState !== GameState.InProgress || playerIdx !== this.currentPlayer) {
            return { success: false, message: "Невозможно объявить победу сейчас" };
        }
        
        if (this.checkWin(playerIdx)) {
            this.gameState = { state: GameState.Completed, winner: playerIdx };
            return { success: true, message: `Игрок ${playerIdx + 1} победил!` };
        } else {
            return { success: false, message: "Нет выигрышной комбинации" };
        }
    }
    
    // Применение действия игрока
    applyAction(playerIdx, action, tileId = null) {
        switch (action) {
            case PlayerAction.DrawTile:
                return this.drawTile(playerIdx);
            case PlayerAction.DiscardTile:
                return this.discardTile(playerIdx, tileId);
            case PlayerAction.ClaimWin:
                return this.claimWin(playerIdx);
            case PlayerAction.Pass:
                this.currentPlayer = (this.currentPlayer + 1) % this.hands.length;
                return { success: true, message: `Игрок ${playerIdx + 1} пропустил ход` };
            default:
                return { success: false, message: "Неизвестное действие" };
        }
    }
    
    // Создание хеша текущего состояния игры (имитация ZK-доказательства)
    createStateHash() {
        // В реальном приложении здесь был бы код для создания настоящего ZK-доказательства
        // Сейчас мы просто имитируем это, создавая хеш
        const gameState = {
            hands: this.hands,
            discards: this.discards,
            currentPlayer: this.currentPlayer,
            gameState: this.gameState
        };
        
        // Простая функция хеширования для демонстрации
        return btoa(JSON.stringify(gameState));
    }
    
    // Получение состояния игры для игрока (скрывает плитки других игроков)
    getStateForPlayer(playerIdx) {
        // Копируем текущее состояние игры
        const playerView = {
            wallSize: this.wall.length,
            hand: this.hands[playerIdx],
            discards: this.discards,
            currentPlayer: this.currentPlayer,
            gameState: this.gameState,
            otherHands: []
        };
        
        // Для каждого другого игрока показываем только количество плиток в руке
        for (let i = 0; i < this.hands.length; i++) {
            if (i !== playerIdx) {
                playerView.otherHands.push({
                    playerIdx: i,
                    tileCount: this.hands[i].length
                });
            }
        }
        
        return playerView;
    }
}

// Экспортируем классы и константы
window.MahjongGame = MahjongGame;
window.TileType = TileType;
window.Wind = Wind;
window.Dragon = Dragon;
window.GameState = GameState;
window.PlayerAction = PlayerAction; 