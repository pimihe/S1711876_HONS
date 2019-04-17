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
  address: 'http://127.0.0.1:81',
  maxStorage: 4096,// stores maximum storage of the server
  maxQueue: 10,// stores maximum queue size of server
  serverName: 'processing1',
  maxFileSize: 1024
}