/* ===================================
   DATABASE CONNECTION MODULE
   =================================== */

const mysql = require('mysql2');
require('dotenv').config();

// Create connection pool
const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'okahandja_municipal',
    port: process.env.DB_PORT || 3306,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    enableKeepAlive: true,
    keepAliveInitialDelay: 0
});

// Get promise-based pool
const promisePool = pool.promise();

/**
 * Test database connection
 */
async function testConnection() {
    try {
        const connection = await promisePool.getConnection();
        console.log('✅ Database connected successfully');
        connection.release();
        return true;
    } catch (error) {
        console.error('❌ Database connection failed:', error.message);
        return false;
    }
}

/**
 * Execute a query
 * @param {string} sql - SQL query
 * @param {Array} params - Query parameters
 * @returns {Promise<Array>} Query results
 */
async function query(sql, params = []) {
    try {
        const [rows] = await promisePool.query(sql, params);
        return rows;
    } catch (error) {
        console.error('Database query error:', error.message);
        throw error;
    }
}

/**
 * Execute a transaction
 * @param {Function} callback - Callback function that receives connection
 * @returns {Promise} Transaction result
 */
async function transaction(callback) {
    const connection = await promisePool.getConnection();
    try {
        await connection.beginTransaction();
        const result = await callback(connection);
        await connection.commit();
        return result;
    } catch (error) {
        await connection.rollback();
        throw error;
    } finally {
        connection.release();
    }
}

/**
 * Get a single row
 * @param {string} sql - SQL query
 * @param {Array} params - Query parameters
 * @returns {Promise<Object|null>} Single row or null
 */
async function queryOne(sql, params = []) {
    const rows = await query(sql, params);
    return rows.length > 0 ? rows[0] : null;
}

/**
 * Insert a record and return the inserted ID
 * @param {string} table - Table name
 * @param {Object} data - Data to insert
 * @returns {Promise<number>} Inserted ID
 */
async function insert(table, data) {
    const keys = Object.keys(data);
    const values = Object.values(data);
    const placeholders = keys.map(() => '?').join(', ');
    const columns = keys.join(', ');

    const sql = `INSERT INTO ${table} (${columns}) VALUES (${placeholders})`;
    const result = await query(sql, values);
    return result.insertId;
}

/**
 * Update records
 * @param {string} table - Table name
 * @param {Object} data - Data to update
 * @param {string} where - WHERE clause
 * @param {Array} whereParams - WHERE parameters
 * @returns {Promise<number>} Number of affected rows
 */
async function update(table, data, where, whereParams = []) {
    const keys = Object.keys(data);
    const values = Object.values(data);
    const setClause = keys.map(key => `${key} = ?`).join(', ');

    const sql = `UPDATE ${table} SET ${setClause} WHERE ${where}`;
    const result = await query(sql, [...values, ...whereParams]);
    return result.affectedRows;
}

/**
 * Delete records
 * @param {string} table - Table name
 * @param {string} where - WHERE clause
 * @param {Array} params - WHERE parameters
 * @returns {Promise<number>} Number of affected rows
 */
async function deleteRecord(table, where, params = []) {
    const sql = `DELETE FROM ${table} WHERE ${where}`;
    const result = await query(sql, params);
    return result.affectedRows;
}

/**
 * Check if database exists and create if not
 */
async function initializeDatabase() {
    try {
        // Create connection without database selection
        const initPool = mysql.createPool({
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || '',
            port: process.env.DB_PORT || 3306
        }).promise();

        // Create database if it doesn't exist
        await initPool.execute(`CREATE DATABASE IF NOT EXISTS ${process.env.DB_NAME || 'okahandja_municipal'} CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
        console.log('✅ Database initialized');

        initPool.end();
        return true;
    } catch (error) {
        console.error('❌ Database initialization failed:', error.message);
        return false;
    }
}

/**
 * Close database connection pool
 */
async function closePool() {
    try {
        await promisePool.end();
        console.log('Database connection pool closed');
    } catch (error) {
        console.error('Error closing database pool:', error.message);
    }
}

// Export functions
module.exports = {
    pool: promisePool,
    query,
    queryOne,
    transaction,
    insert,
    update,
    delete: deleteRecord,
    testConnection,
    initializeDatabase,
    closePool
};
