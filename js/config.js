// Datos del catálogo y contacto — cambia precios/copy aquí, sin tocar app.js

const WHATSAPP_NUMBER = '573106046332'; // formato wa.me: solo dígitos, con código de país

const SHEET_ENDPOINT = 'https://script.google.com/macros/s/AKfycbxhUGqJQRfMkvInYh-85UvhUOR9wzXJ1LM4qcFQMaLa3E_WOtgQRXX7o--SuKwRJiVBnA/exec';

const BEERS = [
  {
    id:'murcielago',
    name:'Murciélago',
    latin:'Desmodus rotundus',
    style:'Coffee Stout Picante',
    color:'#4A4644',
    abv:'5.3%', ibu:'20', ebc:'70',
    description:'Como el murciélago, oscuro y nocturno. Al olfato, café y tostado; en boca aparece un leve chocolate junto a notas intensas de café, con un picante que llega al final — cada trago lo apaga, y el siguiente lo revive. Bastante oscura, casi negra, con espuma café con leche. Cuerpo medio, sólido sin ser pesada ni cremosa. El remate deja café y el calor del picante.',
    ingredients:['Malta de Cebada, Cebada Tostada','Lúpulos Horizon, Golding','Levadura Ale','Café tostado','Pimientos cayenne'],
    pairing:['Carne Asada','Torta de Chocolate','Tacos'],
    tag:'Disponible',
    prices:{unit:14000, four:50000}
  },
  {
    id:'chiguiro',
    name:'Chigüiro',
    latin:'Hydrochoerus hydrochaeris',
    style:'Amber Ale',
    color:'#9C3A24',
    abv:'4.7%', ibu:'30', ebc:'27',
    description:'El más grande de los roedores. Aroma maltoso y de caramelo, que en boca se encuentra con un toque cítrico y un leve amargo — refrescante. Rojo fuerte y oscuro. Cuerpo medio, liviana pero con estructura propia. Remate dulce y levemente amargo. Serena, como su origen.',
    ingredients:['Malta de Cebada','Lúpulos Centennial','Levadura Ale'],
    pairing:['Quesos','Costillas','Nueces'],
    tag:'Disponible',
    prices:{unit:13000, four:46000}
  },
  {
    id:'colibri',
    name:'Colibrí',
    latin:'Chaetocercus mulsant',
    style:'Wheat Ale',
    color:'#7CB853',
    abv:'4.5%', ibu:'12', ebc:'7',
    description:'Puro néctar, siempre en vuelo. Cuerpo ligero, con notas de banano y clavo al fondo. Turbia por naturaleza, fácil de tomar.',
    ingredients:['Malta de Cebada, Malta de Trigo','Lúpulos Hallertau Tradition, Centennial','Levadura Ale'],
    pairing:['Pescado','Ensalada','Ceviche'],
    tag:'Disponible',
    prices:{unit:13000, four:46000}
  },
  {
    id:'tucan',
    name:'Tucán',
    latin:'Ramphastos ambiguus',
    style:'Hazy Mango IPA',
    color:'#F0B429',
    abv:'8.3%', ibu:'45', ebc:'10',
    description:'Amarilla como su pico y el mango que disfruta. Lúpulo tropical protagonista, con una nota de pulpa real de mango. Turbia, jugosa, sin concesiones.',
    ingredients:['Malta de Cebada','Lúpulos Lotus, El Dorado','Levadura Ale','Pulpa de Mango'],
    pairing:['Cerdo','Hamburguesas','Papas Fritas'],
    tag:'Disponible',
    prices:{unit:14000, four:50000}
  }
];

const PACK = 4; // tamaño del paquete
