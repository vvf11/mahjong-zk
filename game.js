// Типы плиток маджонга
const TileType = {
    Character: 'Character', // 1-9
    Bamboo: 'Bamboo',      // 1-9
    Circle: 'Circle',      // 1-9
    Wind: 'Wind',          // East, South, West, North
    Dragon: 'Dragon',      // Red, Green, White
    Season: 'Season',      // Spring, Summer, Autumn, Winter
    Flower: 'Flower'       // Plum, Orchid, Chrysanthemum, Bamboo
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

// Времена года
const Season = {
    Spring: 'Spring',
    Summer: 'Summer',
    Autumn: 'Autumn',
    Winter: 'Winter'
};

// Цветы
const Flower = {
    Plum: 'Plum',
    Orchid: 'Orchid',
    Chrysanthemum: 'Chrysanthemum',
    Bamboo: 'Bamboo'
};

// Класс плитки
class Tile {
    constructor(id, type, value = null, subtype = null) {
        this.id = id;
        this.type = type;
        this.value = value;     // для числовых плиток (Character, Bamboo, Circle)
        this.subtype = subtype; // для Wind, Dragon, Season, Flower
        this.x = 0;             // позиция по X
        this.y = 0;             // позиция по Y
        this.z = 0;             // уровень (слой) плитки
        this.isFree = false;    // доступна ли плитка для выбора
    }
    
    // Получение строкового представления плитки
    toString() {
        if (this.type === TileType.Character || this.type === TileType.Bamboo || this.type === TileType.Circle) {
            return `${this.type} ${this.value}`;
        } else if (this.type === TileType.Wind) {
            return `Wind ${this.subtype}`;
        } else if (this.type === TileType.Dragon) {
            return `Dragon ${this.subtype}`;
        } else if (this.type === TileType.Season) {
            return `Season ${this.subtype}`;
        } else if (this.type === TileType.Flower) {
            return `Flower ${this.subtype}`;
        }
        return "Unknown Tile";
    }
    
    // Проверка на совпадение плиток (не учитывая ID)
    matches(other) {
        // Сезоны всегда можно комбинировать между собой
        if (this.type === TileType.Season && other.type === TileType.Season) {
            return true;
        }
        
        // Цветы всегда можно комбинировать между собой
        if (this.type === TileType.Flower && other.type === TileType.Flower) {
            return true;
        }
        
        // В остальных случаях плитки должны быть одинакового типа
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
    NotStarted: 'NotStarted',
    InProgress: 'InProgress',
    Completed: 'Completed',
    Failed: 'Failed'
};

// Класс пасьянса маджонг
class MahjongSolitaire {
    constructor() {
        this.board = [];           // Доска с плитками
        this.selectedTile = null;  // Выбранная плитка
        this.removedTiles = [];    // Удаленные плитки
        this.gameState = GameState.NotStarted;
        this.moves = 0;            // Количество ходов
        this.tilesLeft = 0;        // Оставшиеся плитки
        this.hintUsed = 0;         // Количество использованных подсказок
        this.startTime = null;     // Время начала игры
        this.layout = null;        // Раскладка поля
        
        // Доступные раскладки
        this.layouts = {
            turtle: {
                name: "Черепаха",
                width: 17,
                height: 8,
                depth: 5,
                coordinates: this.generateTurtleLayout()
            },
            dragon: {
                name: "Дракон",
                width: 15,
                height: 8,
                depth: 5,
                coordinates: this.generateDragonLayout()
            },
            classic: {
                name: "Классическая",
                width: 13,
                height: 7,
                depth: 5,
                coordinates: this.generateClassicLayout()
            }
        };
    }
    
    // Генерация координат для раскладки "Черепаха"
    generateTurtleLayout() {
        const coordinates = [];
        
        // Основная часть (тело черепахи)
        for (let z = 0; z < 4; z++) {
            for (let y = 1; y < 7; y++) {
                for (let x = 2; x < 15; x++) {
                    if (z === 0 || (x >= 3 && x <= 13 && y >= 2 && y <= 5)) {
                        coordinates.push({ x, y, z });
                    }
                }
            }
        }
        
        // Голова и конечности
        for (let x = 7; x < 10; x++) {
            coordinates.push({ x, y: 0, z: 0 }); // Голова
        }
        for (let y = 2; y < 5; y++) {
            coordinates.push({ x: 0, y, z: 0 }); // Левая передняя лапа
            coordinates.push({ x: 16, y, z: 0 }); // Правая передняя лапа
        }
        for (let y = 2; y < 5; y++) {
            coordinates.push({ x: 2, y, z: 0 }); // Левая задняя лапа
            coordinates.push({ x: 14, y, z: 0 }); // Правая задняя лапа
        }
        coordinates.push({ x: 8, y: 7, z: 0 }); // Хвост
        
        // Верхушка
        coordinates.push({ x: 8, y: 3, z: 4 });
        
        return coordinates;
    }
    
    // Генерация координат для раскладки "Дракон"
    generateDragonLayout() {
        const coordinates = [];
        
        // Основная часть (тело дракона)
        for (let z = 0; z < 4; z++) {
            for (let y = 2; y < 6; y++) {
                for (let x = 3; x < 12; x++) {
                    if (z === 0 || (x >= 4 && x <= 10 && y >= 3 && y <= 4)) {
                        coordinates.push({ x, y, z });
                    }
                }
            }
        }
        
        // Голова
        for (let x = 1; x < 4; x++) {
            for (let y = 2; y < 6; y++) {
                coordinates.push({ x, y, z: 0 });
            }
        }
        coordinates.push({ x: 0, y: 3, z: 0 }); // Рог
        
        // Хвост
        for (let x = 12; x < 15; x++) {
            for (let y = 3; y < 5; y++) {
                coordinates.push({ x, y, z: 0 });
            }
        }
        
        // Крылья
        for (let x = 5; x < 10; x++) {
            coordinates.push({ x, y: 0, z: 0 });
            coordinates.push({ x, y: 7, z: 0 });
        }
        
        // Верхушка
        coordinates.push({ x: 7, y: 3, z: 4 });
        
        return coordinates;
    }
    
    // Генерация координат для классической раскладки
    generateClassicLayout() {
        const coordinates = [];
        
        // 5 слоев пирамиды
        for (let z = 0; z < 5; z++) {
            for (let y = z; y < 7 - z; y++) {
                for (let x = z; x < 13 - z; x++) {
                    coordinates.push({ x, y, z });
                }
            }
        }
        
        return coordinates;
    }
    
    // Инициализация новой игры
    newGame(layoutName = 'classic') {
        this.gameState = GameState.InProgress;
        this.moves = 0;
        this.hintUsed = 0;
        this.removedTiles = [];
        this.selectedTile = null;
        this.startTime = Date.now();
        
        // Выбор раскладки
        this.layout = this.layouts[layoutName];
        
        // Создаем и размещаем плитки
        this.createTiles();
        
        // Обновляем статус доступности плиток
        this.updateFreeTiles();
        
        // Проверяем наличие ходов
        if (!this.hasValidMoves()) {
            this.reshuffleTiles();
        }
        
        return {
            success: true,
            message: "Новая игра начата!",
            layout: this.layout.name,
            tilesLeft: this.tilesLeft
        };
    }
    
    // Создание плиток для игры
    createTiles() {
        this.board = [];
        let idCounter = 0;
        
        // Подготовка набора плиток
        const tileSet = [];
        
        // Числовые плитки (Character, Bamboo, Circle) - по 4 каждого числа от 1 до 9
        for (let num = 1; num <= 9; num++) {
            for (let i = 0; i < 4; i++) {
                tileSet.push(new Tile(idCounter++, TileType.Character, num));
                tileSet.push(new Tile(idCounter++, TileType.Bamboo, num));
                tileSet.push(new Tile(idCounter++, TileType.Circle, num));
            }
        }
        
        // Ветры - по 4 каждого
        const winds = [Wind.East, Wind.South, Wind.West, Wind.North];
        for (let wind of winds) {
            for (let i = 0; i < 4; i++) {
                tileSet.push(new Tile(idCounter++, TileType.Wind, null, wind));
            }
        }
        
        // Драконы - по 4 каждого
        const dragons = [Dragon.Red, Dragon.Green, Dragon.White];
        for (let dragon of dragons) {
            for (let i = 0; i < 4; i++) {
                tileSet.push(new Tile(idCounter++, TileType.Dragon, null, dragon));
            }
        }
        
        // Сезоны - по 1 каждого
        const seasons = [Season.Spring, Season.Summer, Season.Autumn, Season.Winter];
        for (let season of seasons) {
            tileSet.push(new Tile(idCounter++, TileType.Season, null, season));
        }
        
        // Цветы - по 1 каждого
        const flowers = [Flower.Plum, Flower.Orchid, Flower.Chrysanthemum, Flower.Bamboo];
        for (let flower of flowers) {
            tileSet.push(new Tile(idCounter++, TileType.Flower, null, flower));
        }
        
        // Перемешиваем плитки
        this.shuffleArray(tileSet);
        
        // Необходимо точное количество плиток для раскладки
        const requiredTileCount = this.layout.coordinates.length;
        if (tileSet.length < requiredTileCount) {
            console.error('Недостаточно плиток для выбранной раскладки!');
            return;
        }
        
        // Берем только нужное количество плиток
        const selectedTiles = tileSet.slice(0, requiredTileCount);
        this.tilesLeft = selectedTiles.length;
        
        // Размещаем плитки на доске согласно координатам раскладки
        for (let i = 0; i < selectedTiles.length; i++) {
            const tile = selectedTiles[i];
            const position = this.layout.coordinates[i];
            
            tile.x = position.x;
            tile.y = position.y;
            tile.z = position.z;
            
            this.board.push(tile);
        }
    }
    
    // Перемешивание массива (алгоритм Фишера-Йейтса)
    shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    }
    
    // Обновление статуса доступности плиток
    updateFreeTiles() {
        // Сначала помечаем все плитки как недоступные
        this.board.forEach(tile => {
            tile.isFree = false;
        });
        
        // Затем проверяем каждую плитку на доступность
        this.board.forEach(tile => {
            // Плитка свободна, если у неё свободна либо левая, либо правая сторона
            if (this.isLeftFree(tile) || this.isRightFree(tile)) {
                tile.isFree = true;
            }
        });
    }
    
    // Проверка, свободна ли левая сторона плитки
    isLeftFree(tile) {
        // Проверяем, есть ли плитка слева на том же уровне или выше
        return !this.board.some(other => 
            other.x === tile.x - 1 && 
            other.y === tile.y && 
            other.z >= tile.z
        );
    }
    
    // Проверка, свободна ли правая сторона плитки
    isRightFree(tile) {
        // Проверяем, есть ли плитка справа на том же уровне или выше
        return !this.board.some(other => 
            other.x === tile.x + 1 && 
            other.y === tile.y && 
            other.z >= tile.z
        );
    }
    
    // Проверка, есть ли еще доступные ходы
    hasValidMoves() {
        const freeTiles = this.board.filter(tile => tile.isFree);
        
        // Проверяем каждую пару свободных плиток
        for (let i = 0; i < freeTiles.length; i++) {
            for (let j = i + 1; j < freeTiles.length; j++) {
                if (freeTiles[i].matches(freeTiles[j])) {
                    return true;
                }
            }
        }
        
        return false;
    }
    
    // Перемешивание оставшихся плиток (когда нет доступных ходов)
    reshuffleTiles() {
        // Копируем оставшиеся плитки
        const remainingTiles = [...this.board];
        
        // Перемешиваем их
        this.shuffleArray(remainingTiles);
        
        // Сохраняем координаты плиток
        const coordinates = this.board.map(tile => ({ x: tile.x, y: tile.y, z: tile.z }));
        
        // Размещаем перемешанные плитки обратно на те же координаты
        for (let i = 0; i < remainingTiles.length; i++) {
            remainingTiles[i].x = coordinates[i].x;
            remainingTiles[i].y = coordinates[i].y;
            remainingTiles[i].z = coordinates[i].z;
        }
        
        this.board = remainingTiles;
        
        // Обновляем статус доступности
        this.updateFreeTiles();
        
        return {
            success: true,
            message: "Плитки перемешаны. Продолжайте игру!"
        };
    }
    
    // Выбор плитки
    selectTile(tileId) {
        if (this.gameState !== GameState.InProgress) {
            return { 
                success: false, 
                message: "Игра не активна" 
            };
        }
        
        // Ищем плитку по ID
        const tile = this.board.find(t => t.id === tileId);
        
        if (!tile) {
            return { 
                success: false, 
                message: "Плитка не найдена" 
            };
        }
        
        if (!tile.isFree) {
            return { 
                success: false, 
                message: "Эта плитка заблокирована" 
            };
        }
        
        // Если уже есть выбранная плитка, проверяем на совпадение
        if (this.selectedTile) {
            // Если выбрана та же плитка, снимаем выбор
            if (this.selectedTile.id === tile.id) {
                this.selectedTile = null;
                return { 
                    success: true, 
                    message: "Выбор снят", 
                    action: "deselect"
                };
            }
            
            // Проверяем на совпадение
            if (this.selectedTile.matches(tile)) {
                // Удаляем обе плитки
                this.removeTiles(this.selectedTile, tile);
                
                // Увеличиваем счетчик ходов
                this.moves++;
                
                // Проверяем условия завершения игры
                if (this.board.length === 0) {
                    this.gameState = GameState.Completed;
                    return { 
                        success: true, 
                        message: "Поздравляем! Вы выиграли!", 
                        action: "match", 
                        gameOver: true,
                        moves: this.moves,
                        time: Math.floor((Date.now() - this.startTime) / 1000)
                    };
                }
                
                // Проверяем наличие ходов
                this.updateFreeTiles();
                if (!this.hasValidMoves()) {
                    // Если ходов нет, но еще остались плитки
                    if (this.board.length > 0) {
                        // Предлагаем перемешать плитки
                        return { 
                            success: true, 
                            message: "Нет доступных ходов. Плитки будут перемешаны.", 
                            action: "no_moves", 
                            shouldReshuffle: true
                        };
                    }
                }
                
                return { 
                    success: true, 
                    message: "Плитки совпали и удалены!", 
                    action: "match",
                    tilesLeft: this.tilesLeft
                };
            } else {
                // Если плитки не совпадают, выбираем новую плитку
                this.selectedTile = tile;
                return { 
                    success: true, 
                    message: "Плитки не совпадают. Выбрана новая плитка.", 
                    action: "select"
                };
            }
        } else {
            // Выбираем первую плитку
            this.selectedTile = tile;
            return { 
                success: true, 
                message: "Плитка выбрана", 
                action: "select"
            };
        }
    }
    
    // Удаление пары плиток с доски
    removeTiles(tile1, tile2) {
        // Добавляем плитки в список удаленных
        this.removedTiles.push(tile1, tile2);
        
        // Удаляем плитки из доски
        this.board = this.board.filter(t => t.id !== tile1.id && t.id !== tile2.id);
        
        // Обновляем количество оставшихся плиток
        this.tilesLeft = this.board.length;
        
        // Сбрасываем выбранную плитку
        this.selectedTile = null;
    }
    
    // Получение подсказки (находит пару совпадающих свободных плиток)
    getHint() {
        if (this.gameState !== GameState.InProgress) {
            return { 
                success: false, 
                message: "Игра не активна" 
            };
        }
        
        const freeTiles = this.board.filter(tile => tile.isFree);
        
        // Ищем пару совпадающих плиток
        for (let i = 0; i < freeTiles.length; i++) {
            for (let j = i + 1; j < freeTiles.length; j++) {
                if (freeTiles[i].matches(freeTiles[j])) {
                    this.hintUsed++;
                    return { 
                        success: true, 
                        message: "Найдена подходящая пара плиток", 
                        hint: [freeTiles[i].id, freeTiles[j].id],
                        hintUsed: this.hintUsed
                    };
                }
            }
        }
        
        return { 
            success: false, 
            message: "Нет доступных совпадающих плиток" 
        };
    }
    
    // Перемешивание плиток по запросу игрока
    shuffleBoard() {
        if (this.gameState !== GameState.InProgress) {
            return { 
                success: false, 
                message: "Игра не активна" 
            };
        }
        
        const result = this.reshuffleTiles();
        
        // Сбрасываем выбранную плитку
        this.selectedTile = null;
        
        return result;
    }
    
    // Получение состояния игры
    getGameState() {
        return {
            board: this.board,
            selectedTile: this.selectedTile ? this.selectedTile.id : null,
            gameState: this.gameState,
            moves: this.moves,
            tilesLeft: this.tilesLeft,
            hintUsed: this.hintUsed,
            timePlayed: this.startTime ? Math.floor((Date.now() - this.startTime) / 1000) : 0,
            layout: this.layout ? this.layout.name : null
        };
    }
    
    // Отмена хода (возврат последней пары удаленных плиток)
    undoMove() {
        if (this.gameState !== GameState.InProgress || this.removedTiles.length < 2) {
            return { 
                success: false, 
                message: "Невозможно отменить ход" 
            };
        }
        
        // Получаем последние две удаленные плитки
        const tile2 = this.removedTiles.pop();
        const tile1 = this.removedTiles.pop();
        
        // Возвращаем их на доску
        this.board.push(tile1, tile2);
        
        // Обновляем количество оставшихся плиток
        this.tilesLeft = this.board.length;
        
        // Обновляем статус доступности
        this.updateFreeTiles();
        
        // Уменьшаем счетчик ходов
        if (this.moves > 0) this.moves--;
        
        // Сбрасываем выбранную плитку
        this.selectedTile = null;
        
        return { 
            success: true, 
            message: "Ход отменен", 
            tilesLeft: this.tilesLeft,
            moves: this.moves
        };
    }
}

// Экспортируем классы и константы
window.MahjongSolitaire = MahjongSolitaire;
window.TileType = TileType;
window.Wind = Wind;
window.Dragon = Dragon;
window.Season = Season;
window.Flower = Flower;
window.GameState = GameState; 