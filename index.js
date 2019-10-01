const express = require('express')
const cors = require('cors')
var app = express()


app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cors())
app.use('/api/', require('./router'))

// app.post('/OAuth/sheets', function(req, res) {
// 	res.send('Connected to the Server')
// })


app.listen(4000, function () {
  console.log('Example app listening on port 4000!');
});