module.exports = {
  HOST: "localhost",
  PORT: "1433",
  USER: "RecorderDB",
  PASSWORD: "Pronet@123",
  DB: "RecorderDB",
  dialect: 'mssql',
  dialectOptions: {
    options: { instanceName: "sqlexpress", encrypt: false }
  },
  pool: {
    max: 10,
    min: 0,
    acquire: 30000,
    idle: 30000,
  }
}