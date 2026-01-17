const https = require('https');

const API_KEY = 'dd5186c23e0be2ad862313449b0078b5';
const SPORT = 'basketball_nba'; // Puedes probar con 'soccer_mexico_liga_mx' también
const REGION = 'us';

const url = `https://api.the-odds-api.com/v4/sports/${SPORT}/odds/?apiKey=${API_KEY}&regions=${REGION}&markets=h2h&oddsFormat=decimal`;

console.log(`🚀 Consultando cuotas para: ${SPORT}...`);

https.get(url, (res) => {
    let data = '';

    res.on('data', (chunk) => {
        data += chunk;
    });

    res.on('end', () => {
        if (res.statusCode === 200) {
            const odds = JSON.parse(data);
            console.log('✅ Cuotas recibidas:');
            // Mostrar los primeros 2 partidos para no saturar
            console.log(JSON.stringify(odds.slice(0, 2), null, 2));
            console.log(`\nTotal de eventos encontrados: ${odds.length}`);
        } else {
            console.error(`❌ Error en la API: ${res.statusCode}`);
            console.log(data);
        }
    });

}).on('error', (err) => {
    console.error(`❌ Error de conexión: ${err.message}`);
});
