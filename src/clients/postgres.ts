
import dotenv from 'dotenv';
import { Pool } from 'pg';

dotenv.config();

const { POSTGRES_HOST, POSTGRES_PORT, POSTGRES_USER, POSTGRES_PASSWORD, POSTGRES_MAX_CONNECTIONS } = process.env;

class PostgresClient {
  constructor(
    private pool: Pool | undefined = undefined,
  ) {}

  async connect() {
    if (this.pool) return console.log('Attempted to connect to Postgres Pool but Pool already connected!'); // eslint-disable-line

    this.pool = new Pool({
      host: POSTGRES_HOST,
      port: Number(POSTGRES_PORT),
      user: POSTGRES_USER,
      password: POSTGRES_PASSWORD,
      max: Number(POSTGRES_MAX_CONNECTIONS),
      idleTimeoutMillis: 60000,
      connectionTimeoutMillis: 10000,
    });

    try {
      const response = await this.pool.query('SELECT NOW()');
      console.log(`Connected postgres pool at ${response.rows[0].now}`); // eslint-disable-line
    } catch (err) {
      console.error('Could not connect postgres pool', { err }); // eslint-disable-line
    }
  }

  async end() {
    if (!this.pool) return console.log('Attempted to end postgres pool connection but no pool is connected'); // eslint-disable-line

    await this.pool.end();
    console.log(`Postgres pool connection ended at ${new Date()}`);
    this.pool = undefined;
  }

  async query(query: string, values?: unknown[]) {
    if (!this.pool) return console.log('Cannot query postgres without connecting to pool. Try client.connect()');

    try {
      const response = await this.pool?.query(query, values);
      return response;
    } catch (err) {
      return console.error('Could not query postgres', { err, query, values });
    }
  }
}

const postgresClient = new PostgresClient();

export default postgresClient;
