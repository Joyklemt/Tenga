// Database helper for SQLite persistence
// Uses better-sqlite3 for synchronous, fast database operations

const Database = require('better-sqlite3');
const path = require('path');

// Database file path in project root
const DB_PATH = path.join(process.cwd(), 'database.db');

// Singleton database connection
let db = null;

/**
 * Get or create the database connection.
 * Creates the messages table if it doesn't exist.
 */
function getDatabase() {
  if (db) {
    return db;
  }

  // Create new database connection
  db = new Database(DB_PATH);
  
  // Enable WAL mode for better performance
  db.pragma('journal_mode = WAL');

  // Create messages table if it doesn't exist
  // Columns:
  // - id: unique message identifier (TEXT PRIMARY KEY)
  // - channel: "teamchat" for group chat, or agent id for DM (TEXT)
  // - role: "user" or "agent" (TEXT)
  // - agentId: agent identifier, null for user messages (TEXT)
  // - content: the message content (TEXT)
  // - timestamp: ISO timestamp string (TEXT)
  // - tags: JSON array of tagged agent IDs (TEXT, nullable)
  db.exec(`
    CREATE TABLE IF NOT EXISTS messages (
      id TEXT PRIMARY KEY,
      channel TEXT NOT NULL,
      role TEXT NOT NULL CHECK (role IN ('user', 'agent')),
      agentId TEXT,
      content TEXT NOT NULL,
      timestamp TEXT NOT NULL,
      tags TEXT
    )
  `);

  // Create index on channel for faster queries
  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_messages_channel ON messages(channel)
  `);

  return db;
}

/**
 * Get all messages for a specific channel.
 * Returns messages sorted by timestamp (oldest first).
 */
function getMessagesByChannel(channel) {
  const db = getDatabase();
  
  const stmt = db.prepare(`
    SELECT id, channel, role, agentId, content, timestamp, tags
    FROM messages
    WHERE channel = ?
    ORDER BY timestamp ASC
  `);
  
  const rows = stmt.all(channel);
  
  // Parse tags JSON and convert timestamp to Date
  return rows.map(row => ({
    id: row.id,
    channel: row.channel,
    role: row.role,
    agentId: row.agentId || undefined,
    content: row.content,
    timestamp: new Date(row.timestamp),
    tags: row.tags ? JSON.parse(row.tags) : undefined,
  }));
}

/**
 * Save a new message to the database.
 */
function saveMessage(message) {
  const db = getDatabase();
  
  const stmt = db.prepare(`
    INSERT INTO messages (id, channel, role, agentId, content, timestamp, tags)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);
  
  stmt.run(
    message.id,
    message.channel,
    message.role,
    message.agentId || null,
    message.content,
    message.timestamp instanceof Date 
      ? message.timestamp.toISOString() 
      : message.timestamp,
    message.tags ? JSON.stringify(message.tags) : null
  );
  
  return message;
}

/**
 * Delete all messages for a specific channel.
 * Used for clearing conversation history.
 */
function deleteMessagesByChannel(channel) {
  const db = getDatabase();
  
  const stmt = db.prepare(`
    DELETE FROM messages WHERE channel = ?
  `);
  
  const result = stmt.run(channel);
  return result.changes;
}

/**
 * Get all channels that have messages.
 * Useful for loading history on startup.
 */
function getAllChannels() {
  const db = getDatabase();
  
  const stmt = db.prepare(`
    SELECT DISTINCT channel FROM messages
  `);
  
  return stmt.all().map(row => row.channel);
}

/**
 * Get message count per channel.
 * Useful for debugging and statistics.
 */
function getMessageCounts() {
  const db = getDatabase();
  
  const stmt = db.prepare(`
    SELECT channel, COUNT(*) as count FROM messages GROUP BY channel
  `);
  
  return stmt.all();
}

module.exports = {
  getDatabase,
  getMessagesByChannel,
  saveMessage,
  deleteMessagesByChannel,
  getAllChannels,
  getMessageCounts,
};
