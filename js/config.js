// Datos del catálogo y contacto — cambia precios/copy aquí, sin tocar app.js

const WHATSAPP_NUMBER = '573106046332'; // formato wa.me: solo dígitos, con código de país

const BEERS = [
  {
    id:'murcielago',
    name:'Murciélago',
    latin:'Desmodus rotundus',
    style:'Coffee Stout Picante',
    color:'#4A4644',
    abv:'5.3%', ibu:'20', ebc:'70',
    short:'Como el murciélago, oscuro y nocturno. Stout de cuerpo lleno con notas de café tostado y un toque picante.',
    long:'Un stout de cuerpo lleno construido sobre malta tostada y café colombiano añadido en frío. El ají entra al final, apenas como un calor seco en la garganta — no pica, abriga. Fermentación lenta y guarda en frío para redondear el amargo del tostado.',
    ingredients:['Malta de Cebada, Cebada Tostada','Lúpulos Horizon, Golding','Levadura Ale','Café tostado + toque picante'],
    pairing:['Carne Asada','Torta de Chocolate','Tacos'],
    tag:'De la casa',
    prices:{unit:14000, four:50000}
  },
  {
    id:'chiguiro',
    name:'Chigüiro',
    latin:'Hydrochoerus hydrochaeris',
    style:'Amber Ale',
    color:'#B5654A',
    abv:'4.7%', ibu:'30', ebc:'27',
    short:'El más grande de los roedores. Cuerpo maltoso, dulzura de caramelo, un toque cítrico al final. Serena, como su origen.',
    long:'Amber ale de perfil maltoso y equilibrado. La malta caramelo da el color cobrizo y una dulzura suave que el Centennial corta con cítrico y un amargor limpio. Fácil de tomar, pero con estructura — la cerveza de quedarse.',
    ingredients:['Malta de Cebada','Lúpulos Centennial','Levadura Ale'],
    pairing:['Quesos','Costillas','Nueces'],
    tag:'Próximamente',
    comingSoon:true,
    prices:{unit:13000, four:46000}
  }
];

const PACK = 4; // tamaño del paquete
