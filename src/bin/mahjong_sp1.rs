use serde_json::{from_str, to_string};
use sha2::{Sha256, Digest};
use std::io::{Read, Write};
use madjong::{MahjongGame, PlayerAction, ActionResult};

fn main() {
    // Получаем входные данные
    let mut input = Vec::new();
    std::io::stdin().read_to_end(&mut input).unwrap();
    
    // Десериализуем входные данные
    let input_str = std::str::from_utf8(&input).unwrap();
    let input_json: serde_json::Value = from_str(input_str).unwrap();
    
    // Извлекаем состояние игры и действие
    let game_state_str = input_json["game_state_before"].as_str().unwrap();
    let action_str = input_json["action"].as_str().unwrap();
    let player_idx = input_json["player_idx"].as_u64().unwrap() as usize;
    
    // Десериализуем состояние игры и действие
    let mut game_state: MahjongGame = from_str(game_state_str).unwrap();
    let action: PlayerAction = from_str(action_str).unwrap();
    
    // Применяем действие
    let result = game_state.apply_action(player_idx, action);
    
    // Формируем выходные данные
    let output = match result {
        ActionResult { success: true, new_game_state: Some(new_state), .. } => {
            // Создаем хеш нового состояния
            let new_state_str = to_string(&new_state).unwrap();
            let mut hasher = Sha256::new();
            hasher.update(new_state_str.as_bytes());
            let hash = hex::encode(hasher.finalize());
            
            serde_json::json!({
                "game_state_after": new_state_str,
                "success": true,
                "state_hash": hash
            })
        },
        _ => {
            serde_json::json!({
                "game_state_after": game_state_str,
                "success": false,
                "state_hash": ""
            })
        }
    };
    
    // Выводим результат
    let output_str = to_string(&output).unwrap();
    std::io::stdout().write_all(output_str.as_bytes()).unwrap();
} 