module.exports = {
  database: {
    url: 'mongodb://127.0.0.1:27017/database',
    options: {
      auth: {authdb: 'admin'},
      user: 'admin',
      pass: 'SecurePass!23',
    }
  }, 
  secret: 'cwp4s0qFn9qMcriWIerq',
  address: 'http://127.0.0.1:82',
  maxStorage: 4096,// stores maximum storage of the server
  serverName: 'storage1'
}