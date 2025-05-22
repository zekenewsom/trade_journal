// packages/electron-app/src/database/emotionService.js
const { getDb } = require('./connection');

function getEmotions() {
  console.log('[EMOTION_SERVICE] getEmotions CALLED');
  const db = getDb();
  return db.prepare('SELECT emotion_id, emotion_name FROM emotions ORDER BY emotion_name ASC').all();
}

function getEmotionsForTrade(tradeId) {
  console.log(`[EMOTION_SERVICE] getEmotionsForTrade CALLED for Trade ID: ${tradeId}`);
  const db = getDb();
  return db.prepare('SELECT emotion_id FROM trade_emotions WHERE trade_id = ?').all(tradeId).map(row => row.emotion_id);
}

function saveTradeEmotions(tradeId, emotionIds = []) {
  console.log(`[EMOTION_SERVICE] saveTradeEmotions CALLED for Trade ID: ${tradeId}`);
  const db = getDb();
  try {
    const transactFn = db.transaction(() => {
      db.prepare('DELETE FROM trade_emotions WHERE trade_id = ?').run(tradeId);
      if (emotionIds && emotionIds.length > 0) {
        const stmt = db.prepare('INSERT INTO trade_emotions (trade_id, emotion_id) VALUES (?, ?)');
        for (const emotionId of emotionIds) {
          stmt.run(tradeId, emotionId);
        }
      }
      db.prepare('UPDATE trades SET updated_at = CURRENT_TIMESTAMP WHERE trade_id = ?').run(tradeId);
    });
    transactFn();
    return { success: true, message: 'Trade emotions updated successfully.' };
  } catch (error) {
    console.error('[EMOTION_SERVICE] Error saving trade emotions:', error);
    return { success: false, message: (error instanceof Error ? error.message : String(error)) || 'Failed to save trade emotions.' };
  }
}

module.exports = {
  getEmotions,
  getEmotionsForTrade,
  saveTradeEmotions,
};