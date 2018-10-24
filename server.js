var express = require('express');

var app = express();
var server = app.listen(3000);

app.get('/', (req, res) => {
    res.send('Hello World');
});

app.listen(3000, () => console.log('Listening on port 3000'));

// app.use(express.static('public'));

