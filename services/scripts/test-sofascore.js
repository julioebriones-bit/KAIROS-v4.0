const https = require('https');

const options = {
    method: 'GET',
    hostname: 'sofascore.p.rapidapi.com',
    port: null,
    path: '/tournaments/get-next-matches?tournamentId=17&seasonId=29415&pageIndex=0',
    headers: {
        'x-rapidapi-host': 'sofascore.p.rapidapi.com',
        'x-rapidapi-key': '62a2c7c363msh70025a2fe333f3ap1158ecjsnff47af66a4d9',
        'useQueryString': true
    }
};

const req = https.request(options, function (res) {
    const chunks = [];

    res.on('data', function (chunk) {
        chunks.push(chunk);
    });

    res.on('end', function () {
        const body = Buffer.concat(chunks);
        console.log(body.toString());
    });
});

req.end();
