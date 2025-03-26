use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use rand::seq::SliceRandom;
use rand::thread_rng;
use rand::rngs::StdRng;
use rand::SeedableRng;
use sha2::{Sha256, Digest};

// Экспортируем модуль sp1_verifier
pub mod sp1_verifier;

// Определение типа плитки маджонга
#[derive(Clone, Copy, Debug, PartialEq, Eq, Hash, Serialize, Deserialize)]
pub enum TileType {
    Character(u8), // 1-9
    Bamboo(u8),    // 1-9
    Circle(u8),    // 1-9
    Wind(Wind),    // Ветры
    Dragon(Dragon) // Драконы
}

#[derive(Clone, Copy, Debug, PartialEq, Eq, Hash, Serialize, Deserialize)]
pub enum Wind {
    East,
    South,
    West,
    North
}

#[derive(Clone, Copy, Debug, PartialEq, Eq, Hash, Serialize, Deserialize)]
pub enum Dragon {
    Red,
    Green,
    White
}

// Структура плитки с уникальным ID для того, чтобы различать одинаковые плитки
#[derive(Clone, Copy, Debug, PartialEq, Eq, Hash, Serialize, Deserialize)]
pub struct Tile {
    pub id: u8,
    pub tile_type: TileType
}

// Структура игры
#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct MahjongGame {
    pub wall: Vec<Tile>,         // Стена (не разобранные плитки)
    pub hands: Vec<Vec<Tile>>,   // Руки игроков
    pub discards: Vec<Vec<Tile>>, // Сброшенные плитки по игрокам
    pub current_player: usize,    // Текущий игрок
    pub game_seed: u64,          // Сид для рандомизации
    pub game_state: GameState,    // Состояние игры
}

#[derive(Clone, Debug, PartialEq, Eq, Serialize, Deserialize)]
pub enum GameState {
    WaitingForPlayers,
    InProgress,
    Completed { winner: Option<usize> },
}

// Структура для действий игрока
#[derive(Clone, Debug, Serialize, Deserialize)]
pub enum PlayerAction {
    DrawTile,
    DiscardTile(Tile),
    ClaimWin,
    Pass,
}

// Результат действия игрока
#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct ActionResult {
    pub success: bool,
    pub new_game_state: Option<MahjongGame>,
    pub message: String,
}

impl MahjongGame {
    // Создание новой игры
    pub fn new(num_players: usize, seed: Option<u64>) -> Self {
        let game_seed = seed.unwrap_or_else(|| rand::random());
        let mut rng = rand::rngs::StdRng::seed_from_u64(game_seed);
        
        // Создаем стандартный набор плиток
        let mut tiles = Vec::new();
        let mut id_counter = 0;
        
        // Символы (Character), бамбук (Bamboo) и круги (Circle) - по 4 каждого числа от 1 до 9
        for num in 1..=9 {
            for _ in 0..4 {
                tiles.push(Tile { id: id_counter, tile_type: TileType::Character(num) });
                id_counter += 1;
                
                tiles.push(Tile { id: id_counter, tile_type: TileType::Bamboo(num) });
                id_counter += 1;
                
                tiles.push(Tile { id: id_counter, tile_type: TileType::Circle(num) });
                id_counter += 1;
            }
        }
        
        // Ветры - по 4 каждого
        for wind in [Wind::East, Wind::South, Wind::West, Wind::North] {
            for _ in 0..4 {
                tiles.push(Tile { id: id_counter, tile_type: TileType::Wind(wind) });
                id_counter += 1;
            }
        }
        
        // Драконы - по 4 каждого
        for dragon in [Dragon::Red, Dragon::Green, Dragon::White] {
            for _ in 0..4 {
                tiles.push(Tile { id: id_counter, tile_type: TileType::Dragon(dragon) });
                id_counter += 1;
            }
        }
        
        // Перемешиваем плитки
        tiles.shuffle(&mut rng);
        
        // Инициализируем руки игроков
        let mut hands = vec![Vec::new(); num_players];
        
        // Раздаем каждому игроку по 13 плиток
        for i in 0..num_players {
            for _ in 0..13 {
                if let Some(tile) = tiles.pop() {
                    hands[i].push(tile);
                }
            }
        }
        
        MahjongGame {
            wall: tiles,
            hands,
            discards: vec![Vec::new(); num_players],
            current_player: 0,
            game_seed,
            game_state: GameState::InProgress,
        }
    }
    
    // Игрок берет плитку из стены
    pub fn draw_tile(&mut self) -> Option<Tile> {
        if self.game_state != GameState::InProgress {
            return None;
        }
        
        self.wall.pop()
    }
    
    // Игрок сбрасывает плитку
    pub fn discard_tile(&mut self, player_idx: usize, tile: Tile) -> bool {
        if self.game_state != GameState::InProgress || player_idx != self.current_player {
            return false;
        }
        
        // Находим и удаляем плитку из руки игрока
        if let Some(pos) = self.hands[player_idx].iter().position(|t| t.id == tile.id) {
            let tile = self.hands[player_idx].remove(pos);
            self.discards[player_idx].push(tile);
            
            // Переход хода к следующему игроку
            self.current_player = (self.current_player + 1) % self.hands.len();
            
            true
        } else {
            false
        }
    }
    
    // Проверка на выигрышную комбинацию
    pub fn check_win(&self, player_idx: usize) -> bool {
        // Упрощенная проверка - для демонстрационных целей
        // В реальной игре здесь должна быть сложная логика проверки выигрышных комбинаций
        
        // Пример простой проверки: если у игрока есть 4 тройки одинаковых плиток и одна пара
        let hand = &self.hands[player_idx];
        
        // Считаем количество каждого типа плиток
        let mut tile_counts: HashMap<TileType, u8> = HashMap::new();
        for tile in hand {
            *tile_counts.entry(tile.tile_type).or_insert(0) += 1;
        }
        
        // Проверяем количество троек и пар
        let mut triplets = 0;
        let mut pairs = 0;
        
        for count in tile_counts.values() {
            if *count >= 3 {
                triplets += count / 3;
            }
            if *count % 3 == 2 {
                pairs += 1;
            }
        }
        
        // Выигрышная комбинация - 4 тройки и 1 пара
        triplets >= 4 && pairs == 1
    }
    
    // Применение действия игрока
    pub fn apply_action(&mut self, player_idx: usize, action: PlayerAction) -> ActionResult {
        if self.game_state != GameState::InProgress {
            return ActionResult {
                success: false,
                new_game_state: None,
                message: "Игра не в активном состоянии".to_string(),
            };
        }
        
        if player_idx != self.current_player {
            return ActionResult {
                success: false,
                new_game_state: None,
                message: "Сейчас не ваш ход".to_string(),
            };
        }
        
        match action {
            PlayerAction::DrawTile => {
                if let Some(tile) = self.draw_tile() {
                    self.hands[player_idx].push(tile);
                    
                    ActionResult {
                        success: true,
                        new_game_state: Some(self.clone()),
                        message: format!("Игрок {} взял плитку", player_idx),
                    }
                } else {
                    // Если плитки закончились, игра завершается ничьей
                    self.game_state = GameState::Completed { winner: None };
                    
                    ActionResult {
                        success: true,
                        new_game_state: Some(self.clone()),
                        message: "Плитки закончились, игра завершена ничьей".to_string(),
                    }
                }
            },
            PlayerAction::DiscardTile(tile) => {
                if self.discard_tile(player_idx, tile) {
                    ActionResult {
                        success: true,
                        new_game_state: Some(self.clone()),
                        message: format!("Игрок {} сбросил плитку", player_idx),
                    }
                } else {
                    ActionResult {
                        success: false,
                        new_game_state: None,
                        message: "Невозможно сбросить эту плитку".to_string(),
                    }
                }
            },
            PlayerAction::ClaimWin => {
                if self.check_win(player_idx) {
                    self.game_state = GameState::Completed { winner: Some(player_idx) };
                    
                    ActionResult {
                        success: true,
                        new_game_state: Some(self.clone()),
                        message: format!("Игрок {} объявил победу!", player_idx),
                    }
                } else {
                    ActionResult {
                        success: false,
                        new_game_state: None,
                        message: "Нет выигрышной комбинации".to_string(),
                    }
                }
            },
            PlayerAction::Pass => {
                // Просто переход хода к следующему игроку
                self.current_player = (self.current_player + 1) % self.hands.len();
                
                ActionResult {
                    success: true,
                    new_game_state: Some(self.clone()),
                    message: format!("Игрок {} пропустил ход", player_idx),
                }
            }
        }
    }
    
    // Создание хеша текущего состояния игры для верификации
    pub fn create_state_hash(&self) -> String {
        let serialized = serde_json::to_string(self).unwrap_or_default();
        let mut hasher = Sha256::new();
        hasher.update(serialized.as_bytes());
        let result = hasher.finalize();
        hex::encode(result)
    }
}

// Структура для хранения доказательства игрового события
#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct GameProof {
    pub game_state_before: MahjongGame,
    pub player_action: PlayerAction,
    pub player_idx: usize,
    pub game_state_after: MahjongGame,
    pub state_hash: String,
}

impl GameProof {
    pub fn new(
        game_state_before: MahjongGame,
        player_action: PlayerAction,
        player_idx: usize,
        game_state_after: MahjongGame,
    ) -> Self {
        let state_hash = game_state_after.create_state_hash();
        
        GameProof {
            game_state_before,
            player_action,
            player_idx,
            game_state_after,
            state_hash,
        }
    }
    
    // Верификация доказательства
    pub fn verify(&self) -> bool {
        // 1. Проверяем, что хеш состояния после действия соответствует сохраненному хешу
        let calculated_hash = self.game_state_after.create_state_hash();
        if calculated_hash != self.state_hash {
            return false;
        }
        
        // 2. Создаем копию начального состояния и применяем действие
        let mut game_copy = self.game_state_before.clone();
        let result = game_copy.apply_action(self.player_idx, self.player_action.clone());
        
        // 3. Проверяем, что результат соответствует сохраненному состоянию после действия
        match result {
            ActionResult { success: true, new_game_state: Some(new_state), .. } => {
                let new_state_hash = new_state.create_state_hash();
                let expected_hash = self.game_state_after.create_state_hash();
                new_state_hash == expected_hash
            },
            _ => false,
        }
    }
} 