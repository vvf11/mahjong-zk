# 🀄 Маджонг с ZK-доказательствами (Mahjong ZK)

Проект создан для конкурса **Succinct Rockstars: Week 3**. Это игра в маджонг с верификацией ходов и достижений через ZK-доказательства с использованием технологии SP1.

## 📝 Описание

Маджонг ZK - это реализация игры в маджонг с упрощенными правилами, где каждый ход игрока верифицируется с использованием нулевого разглашения (Zero-Knowledge Proof). Это позволяет:

1. Гарантировать честность игры без необходимости доверять центральному серверу
2. Подтверждать достижения игроков без разглашения их стратегии или комбинаций
3. Создавать верифицируемую историю игры, которая может быть проверена любым участником

## 🚀 Особенности

- Игра в маджонг с основными правилами и механиками
- Генерация ZK-доказательств для каждого хода с использованием SP1
- Верификация доказательств как в игре, так и через блокчейн
- Подтверждение достижений и рейтинга игроков

## 🛠️ Технологии

- **Rust** для основной логики игры
- **SP1** от Succinct для создания ZK-доказательств
- **zkVM** для выполнения доказательств
- **STARK** и **SNARK** для эффективной верификации

## 📦 Установка

```bash
git clone https://github.com/yourusername/madjong-zk.git
cd madjong-zk
cargo build --release
```

## 🎮 Использование

### Запуск игры

```bash
cargo run --bin mahjong_client
```

### Компиляция SP1-программы

```bash
cargo prove build --release --bin mahjong_sp1
```

### Генерация и верификация доказательств

Доказательства генерируются автоматически во время игры и могут быть проверены через:

```bash
cargo prove verify target/zkbin/mahjong_sp1 proof.bin
```

## 📊 Как работают ZK-доказательства в игре

1. Каждый ход игрока фиксируется как состояние до и после действия
2. SP1 zkVM выполняет вычисления и создает доказательство:
   - Действие было легальным по правилам игры
   - Новое состояние игры корректно вычислено
   - Не было мошенничества или некорректных манипуляций
3. Доказательства можно проверить без доступа к приватным данным игроков

## 🔗 Пример интеграции с блокчейном

Проект может быть интегрирован с блокчейном для верификации рейтинга игроков или проведения турниров:

```solidity
function verifyMahjongWin(bytes memory proof) public view returns (bool) {
    // Вызов смарт-контракта верификации SP1 доказательств
    return sp1Verifier.verify(proof);
}
```

## 📚 Руководство для разработчиков

Для создания своих ZK-приложений с использованием этого проекта:

1. Адаптируйте логику игры в `lib.rs`
2. Модифицируйте программу для zkVM в `mahjong_sp1.rs`
3. Создайте свои схемы доказательств в `sp1_verifier.rs`

## 🤝 Вклад в развитие

Мы приветствуем контрибуции! Если вы хотите улучшить проект, пожалуйста:

1. Сделайте форк репозитория
2. Создайте ветку для вашей функции
3. Отправьте пул-реквест с вашими изменениями

## 📄 Лицензия

MIT

## 👨‍💻 Авторы

- Ваше Имя - [GitHub](https://github.com/yourusername) 