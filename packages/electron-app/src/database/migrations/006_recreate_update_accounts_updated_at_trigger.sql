-- 006: Recreate update_accounts_updated_at trigger for accounts table
DROP TRIGGER IF EXISTS update_accounts_updated_at;
CREATE TRIGGER update_accounts_updated_at
AFTER UPDATE ON accounts
FOR EACH ROW
BEGIN
    UPDATE accounts SET updated_at = CURRENT_TIMESTAMP WHERE id = OLD.id;
END;
