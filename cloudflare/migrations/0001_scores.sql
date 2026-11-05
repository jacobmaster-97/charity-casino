-- Only public result fields and technical identifiers. No player identity or gameplay log.
CREATE TABLE IF NOT EXISTS scores (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  submission_id TEXT NOT NULL UNIQUE CHECK(length(submission_id) = 36),
  name TEXT NOT NULL CHECK(length(name) BETWEEN 1 AND 16),
  amount_cents TEXT NOT NULL CHECK(
    length(amount_cents) BETWEEN 1 AND 128 AND
    amount_cents NOT GLOB '*[^0-9]*' AND
    (amount_cents = '0' OR substr(amount_cents, 1, 1) != '0')
  ),
  amount_digits INTEGER GENERATED ALWAYS AS (length(amount_cents)) STORED
);
CREATE INDEX IF NOT EXISTS scores_order ON scores(amount_digits DESC, amount_cents DESC, id ASC);
