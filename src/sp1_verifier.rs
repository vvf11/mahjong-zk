// SP1 verifier module (empty file)
use sp1_core::{SP1Prover, SP1Stdin, SP1Verifier};
use serde::{Deserialize, Serialize};
use crate::{MahjongGame, PlayerAction, GameProof};

// Структура входных данных для SP1-программы
#[derive(Debug, Serialize, Deserialize)]
pub struct MahjongProofInput {
    pub game_state_before: String, // сериализованное состояние игры до действия
    pub action: String,            // сериализованное действие игрока
    pub player_idx: usize,         // индекс игрока
}

// Структура выходных данных SP1-программы
#[derive(Debug, Serialize, Deserialize)]
pub struct MahjongProofOutput {
    pub game_state_after: String,  // сериализованное состояние игры после действия
    pub success: bool,              // было ли действие успешным
    pub state_hash: String,         // хеш нового состояния игры
}

// Функция для создания SP1-доказательства для действия игрока
pub fn create_sp1_proof(
    game_proof: &GameProof,
    elf_path: &str,
) -> Result<Vec<u8>, String> {
    // Сериализуем входные данные
    let input = MahjongProofInput {
        game_state_before: serde_json::to_string(&game_proof.game_state_before)
            .map_err(|e| format!("Ошибка сериализации состояния игры: {}", e))?,
        action: serde_json::to_string(&game_proof.player_action)
            .map_err(|e| format!("Ошибка сериализации действия: {}", e))?,
        player_idx: game_proof.player_idx,
    };
    
    let input_bytes = serde_json::to_vec(&input)
        .map_err(|e| format!("Ошибка сериализации входных данных: {}", e))?;
    
    // Создаем SP1 Prover
    let prover = SP1Prover::new(elf_path)
        .map_err(|e| format!("Ошибка создания SP1 Prover: {}", e))?;
    
    // Устанавливаем входные данные
    let mut stdin = SP1Stdin::new();
    stdin.write(&input_bytes);
    
    // Генерируем доказательство
    let proof = prover.prove(stdin)
        .map_err(|e| format!("Ошибка генерации доказательства: {}", e))?;
    
    Ok(proof)
}

// Функция для верификации SP1-доказательства
pub fn verify_sp1_proof(
    proof: &[u8],
    elf_path: &str,
) -> Result<MahjongProofOutput, String> {
    // Создаем SP1 Verifier
    let verifier = SP1Verifier::new(elf_path)
        .map_err(|e| format!("Ошибка создания SP1 Verifier: {}", e))?;
    
    // Верифицируем доказательство
    let output = verifier.verify(proof)
        .map_err(|e| format!("Ошибка верификации доказательства: {}", e))?;
    
    // Десериализуем выходные данные
    let output_str = std::str::from_utf8(&output)
        .map_err(|e| format!("Ошибка преобразования выходных данных: {}", e))?;
    
    let proof_output: MahjongProofOutput = serde_json::from_str(output_str)
        .map_err(|e| format!("Ошибка десериализации выходных данных: {}", e))?;
    
    Ok(proof_output)
}
