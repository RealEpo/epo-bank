-- 1. USERS TABLE
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    balance DECIMAL(10, 2) DEFAULT 100.00, -- Start with $100
    is_admin BOOLEAN DEFAULT FALSE,       -- YOUR GOD MODE SWITCH
    is_frozen BOOLEAN DEFAULT FALSE,      -- For Admin Jail
    title VARCHAR(50) DEFAULT 'Citizen',  -- Dynamic Titles
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. TRANSACTIONS LEDGER (Immutable History)
CREATE TABLE transactions (
    id SERIAL PRIMARY KEY,
    sender_id INTEGER REFERENCES users(id), -- NULL if system generated
    receiver_id INTEGER REFERENCES users(id), -- NULL if system burn/tax
    amount DECIMAL(10, 2) NOT NULL,
    type VARCHAR(50) NOT NULL, -- 'TRANSFER', 'ROBBERY', 'TAX', 'STIPEND', 'SHOP', 'HEIST'
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. STOCK MARKET (Friends as Stocks)
CREATE TABLE stocks (
    user_id INTEGER PRIMARY KEY REFERENCES users(id),
    current_price DECIMAL(10, 2) DEFAULT 10.00,
    total_shares_owned INTEGER DEFAULT 0,
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. GLOBAL CHAT
CREATE TABLE chat_messages (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    message TEXT NOT NULL,
    is_admin_command BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 5. SEASONS (Weekly Resets)
CREATE TABLE seasons (
    id SERIAL PRIMARY KEY,
    season_number INTEGER NOT NULL,
    start_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    end_date TIMESTAMP,
    winner_id INTEGER REFERENCES users(id), -- Hall of Fame
    is_active BOOLEAN DEFAULT TRUE
);

-- 6. ADMIN LOGS (Secret History of Your Chaos)
CREATE TABLE admin_logs (
    id SERIAL PRIMARY KEY,
    admin_id INTEGER REFERENCES users(id),
    action VARCHAR(100) NOT NULL, -- 'FINED_USER', 'SWAP_BALANCE', 'TRIGGERED_BOT'
    target_user_id INTEGER,
    details TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 🚀 SEED DATA: CREATE YOU (THE ADMIN)
-- Note: In real code, we hash the password. For now, this is a placeholder logic.
-- We will insert the real hashed password via the backend script later.
INSERT INTO users (username, password_hash, balance, is_admin, title) 
VALUES ('Epo', 'placeholder_hash_replace_me', 1000000.00, TRUE, 'The Bank Owner');

-- Initialize Stock for Epo
INSERT INTO stocks (user_id, current_price) 
SELECT id, 50.00 FROM users WHERE username = 'Epo';