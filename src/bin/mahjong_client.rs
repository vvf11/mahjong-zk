use madjong::{MahjongGame, PlayerAction, GameProof, Tile, TileType, GameState};
use madjong::sp1_verifier::{create_sp1_proof, verify_sp1_proof};
use std::io::{self, Write};
use std::path::Path;

// Вспомогательная функция для форматирования вывода плитки
fn format_tile(tile: &Tile) -> String {
    match tile.tile_type {
        TileType::Character(n) => format!("Character {}", n),
        TileType::Bamboo(n) => format!("Bamboo {}", n),
        TileType::Circle(n) => format!("Circle {}", n),
        TileType::Wind(wind) => format!("Wind {:?}", wind),
        TileType::Dragon(dragon) => format!("Dragon {:?}", dragon),
    }
}

// Вспомогательная функция для отображения руки игрока
fn display_hand(hand: &[Tile]) {
    for (i, tile) in hand.iter().enumerate() {
        println!("{}. {}", i + 1, format_tile(tile));
    }
}

// Функция для ввода действия пользователя
fn get_player_action(game: &MahjongGame, player_idx: usize) -> PlayerAction {
    println!("\nТекущий ход игрока {}", player_idx);
    println!("Ваша рука:");
    display_hand(&game.hands[player_idx]);
    
    println!("\nВыберите действие:");
    println!("1. Взять плитку");
    println!("2. Сбросить плитку");
    println!("3. Объявить победу");
    println!("4. Пропустить ход");
    
    let mut choice = String::new();
    print!("> ");
    io::stdout().flush().unwrap();
    io::stdin().read_line(&mut choice).unwrap();
    let choice: u32 = choice.trim().parse().unwrap_or(0);
    
    match choice {
        1 => PlayerAction::DrawTile,
        2 => {
            println!("Выберите плитку для сброса (номер):");
            let mut tile_idx = String::new();
            print!("> ");
            io::stdout().flush().unwrap();
            io::stdin().read_line(&mut tile_idx).unwrap();
            let tile_idx: usize = tile_idx.trim().parse().unwrap_or(0);
            
            if tile_idx > 0 && tile_idx <= game.hands[player_idx].len() {
                PlayerAction::DiscardTile(game.hands[player_idx][tile_idx - 1])
            } else {
                println!("Неверный номер плитки. Пропуск хода.");
                PlayerAction::Pass
            }
        },
        3 => PlayerAction::ClaimWin,
        4 => PlayerAction::Pass,
        _ => {
            println!("Неверный выбор. Пропуск хода.");
            PlayerAction::Pass
        }
    }
}

fn main() {
    println!("=== Маджонг с ZK-доказательствами ===");
    
    // Инициализация игры для 2 игроков
    let mut game = MahjongGame::new(2, None);
    println!("Новая игра создана для 2 игроков!");
    
    // Путь к исполняемому файлу SP1 (должен быть создан заранее)
    let elf_path = "target/riscv32im-succinct-zkvm-elf/release/mahjong_sp1";
    
    // Проверяем, существует ли исполняемый файл SP1
    let sp1_exists = Path::new(elf_path).exists();
    if !sp1_exists {
        println!("Предупреждение: SP1 ELF файл не найден по пути: {}", elf_path);
        println!("ZK-доказательства будут симулироваться.");
    }
    
    let mut game_history: Vec<GameProof> = Vec::new();
    
    loop {
        if let GameState::Completed { winner } = &game.game_state {
            match winner {
                Some(player) => println!("\nИгра завершена! Победитель: Игрок {}", player),
                None => println!("\nИгра завершена ничьей!"),
            }
            break;
        }
        
        let player_idx = game.current_player;
        let game_state_before = game.clone();
        
        // Получаем действие от пользователя
        let action = get_player_action(&game, player_idx);
        
        // Применяем действие
        let result = game.apply_action(player_idx, action.clone());
        
        match result {
            ActionResult { success: true, new_game_state: Some(new_state), message } => {
                println!("{}", message);
                
                // Сохраняем новое состояние игры
                game = new_state.clone();
                
                // Создаем доказательство
                let proof = GameProof::new(
                    game_state_before,
                    action,
                    player_idx,
                    new_state,
                );
                
                // Проверяем доказательство
                let valid = proof.verify();
                println!("Доказательство хода верифицировано: {}", valid);
                
                // Если включена интеграция с SP1 и файл существует
                if sp1_exists {
                    match create_sp1_proof(&proof, elf_path) {
                        Ok(sp1_proof) => {
                            println!("SP1 доказательство создано успешно!");
                            
                            match verify_sp1_proof(&sp1_proof, elf_path) {
                                Ok(output) => {
                                    println!("SP1 доказательство верифицировано успешно!");
                                    println!("Хеш состояния: {}", output.state_hash);
                                },
                                Err(e) => println!("Ошибка верификации SP1 доказательства: {}", e),
                            }
                        },
                        Err(e) => println!("Ошибка создания SP1 доказательства: {}", e),
                    }
                }
                
                game_history.push(proof);
            },
            ActionResult { success: false, message, .. } => {
                println!("Ошибка: {}", message);
            },
        }
        
        println!("\nНажмите Enter для продолжения...");
        let mut buffer = String::new();
        io::stdin().read_line(&mut buffer).unwrap();
    }
    
    println!("\nИстория игры:");
    for (i, proof) in game_history.iter().enumerate() {
        println!("Ход {}: Игрок {} совершил действие", i + 1, proof.player_idx);
    }
} 