import mysql from 'mysql2';
import dotenv from 'dotenv';
import { Sequelize } from 'sequelize';
const isTestEnvironment = process.env.node_env === 'test';
dotenv.config();

const sequelize = new Sequelize(
  process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASS, {
  host: process.env.DB_HOST,
  dialect: 'mysql',
  logging: false
});


const connectDB =async () => {
  try {
    await sequelize.authenticate();
    console.log('Database connection established successfully.');
  } catch (error) {
    console.error('Unable to connect to the database:', error);
  }
}
export default sequelize;
