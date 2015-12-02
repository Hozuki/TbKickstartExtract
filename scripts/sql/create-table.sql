DROP TABLE IF EXISTS main;
CREATE TABLE main (
    id INT PRIMARY KEY,
    type INT NOT NULL,
    name TEXT NOT NULL,
    url TEXT NOT NULL UNIQUE,
    lowest_price REAL NOT NULL,
    lowest_price_person INT NOT NULL,
    hottest_price REAL NOT NULL,
    hottest_price_person INT NOT NULL,
    is_hottest_price_full INT NOT NULL,
    most_money_price REAL NOT NULL,
    most_money_price_person INT NOT NULL,
    project_state INT NOT NULL,
    project_tb_state INT NOT NULL,
    project_state_text TEXT NOT NULL,
    total_money REAL NOT NULL,
    total_person INT NOT NULL,
    target_money REAL NOT NULL,
    is_succeeded INT NOT NULL,
    like_count INT NOT NULL
);