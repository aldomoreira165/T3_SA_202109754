const { dbManager } = require('../config/database');
const { Logger } = require('../utils/Logger');

class CIService {
    getConnection() {
        const pool = dbManager.getConnection('postgres');
        if (!pool) {
            throw new Error('Database connection not initialized');
        }
        return pool;
    }

    async createCI(data) {
        const pool = this.getConnection();

        const typeQuery = `SELECT mandatory_fields FROM types WHERE type_id = $1`;
        const { rows: typeRows } = await pool.query(typeQuery, [data.type_id]);
        if (typeRows.length === 0) {
            throw new Error(`Type with id=${data.type_id} does not exist`);
        }
        const mandatoryFields = typeRows[0].mandatory_fields;

        const missing = mandatoryFields.filter(field => {
            const v = data[field];
            return v === undefined || v === null || (typeof v === 'string' && v.trim() === '');
        });
        if (missing.length) {
            throw new Error(`Missing required fields for type ${data.type_id}: ${missing.join(', ')}`);
        }

        const cols = [], vals = [], params = [];
        let idx = 1;
        for (const [k, v] of Object.entries(data)) {
            cols.push(k);
            vals.push(`$${idx}`);
            params.push(v);
            idx++;
        }

        const query = `
            INSERT INTO cis (${cols.join(',')})
            VALUES (${vals.join(',')})
            RETURNING *;
        `;

        try {
            const { rows } = await pool.query(query, params);
            return rows[0];
        } catch (err) {
            Logger.error('Error on CIService.createCI:', err);
            throw err;
        }
    }

    async getAllCIs(filters) {
        const pool = this.getConnection();
        const where = [];
        const params = [];
        let idx = 1;

        for (const [k, v] of Object.entries(filters)) {
            where.push(`${k} = $${idx}`);
            params.push(v);
            idx++;
        }

        const q = `
            SELECT * FROM cis
            ${where.length ? `WHERE ${where.join(' AND ')}` : ''}
            ORDER BY ci_id;
        `;

        try {
            const { rows } = await pool.query(q, params);
            return rows;
        } catch (err) {
            Logger.error('Error on CIService.getAllCIs:', err);
            throw err;
        }
    }

    async getCIById(ciId) {
        const pool = this.getConnection();
        const query = `SELECT * FROM cis WHERE ci_id = $1;`;
        try {
            const { rows } = await pool.query(query, [ciId]);
            return rows[0] || null;
        } catch (err) {
            Logger.error('Error on CIService.getCIById:', err);
            throw err;
        }
    }

    async updateCI(ciId, data) {
        const pool = this.getConnection();
        const sets = [], params = [];
        let idx = 1;

        for (const [k, v] of Object.entries(data)) {
            sets.push(`${k} = $${idx}`);
            params.push(v);
            idx++;
        }
        params.push(ciId);

        const query = `
            UPDATE cis
            SET ${sets.join(', ')}
            WHERE ci_id = $${idx}
            RETURNING *;
        `;

        try {
            const { rows } = await pool.query(query, params);
            return rows[0];
        } catch (err) {
            Logger.error('Error on CIService.updateCI:', err);
            throw err;
        }
    }

    async deleteCI(ciId) {
        const pool = this.getConnection();
        const query = `DELETE FROM cis WHERE ci_id = $1;`;
        try {
            await pool.query(query, [ciId]);
        } catch (err) {
            Logger.error('Error on CIService.deleteCI:', err);
            throw err;
        }
    }

    async createHierarchy(data) {
        const pool = this.getConnection();

        const { parent_id, child_id, hierarchy_type } = data;

        const query = `
            INSERT INTO hierarchies (parent_id, child_id, hierarchy_type)
            VALUES ($1, $2, $3)
            RETURNING *;
        `;
        
        const params = [parent_id, child_id, hierarchy_type];
        try {
            const { rows } = await pool.query(query, params);
            return rows[0];
        } catch (err) {
            Logger.error('Error on HierarchyService.createHierarchy:', err);
            throw err;
        }
    }

}

module.exports = new CIService();
