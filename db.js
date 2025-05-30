import dotenv from 'dotenv';
import mariadb from 'mariadb';

dotenv.config();

export const db = mariadb.createConnection({
  host: 'localhost',
  user: 'root',
  password: process.env.PASSWORD,
  database: 'RouteIt',
  dateStrings: true,
});
