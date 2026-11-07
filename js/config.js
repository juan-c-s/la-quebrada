// Datos del catálogo y contacto — cambia precios/copy aquí, sin tocar app.js

const WHATSAPP_NUMBER = '573054251432'; // formato wa.me: solo dígitos, con código de país

const SHEET_ENDPOINT = 'https://script.google.com/macros/s/AKfycbxhUGqJQRfMkvInYh-85UvhUOR9wzXJ1LM4qcFQMaLa3E_WOtgQRXX7o--SuKwRJiVBnA/exec';

// URL del Apps Script del sheet de retroalimentación (separado del de sugerencias, porque
// el formato de fila es distinto: una fila por cerveza calificada). Pega aquí el /exec
// una vez despliegues el Apps Script del nuevo sheet.
const FEEDBACK_SHEET_ENDPOINT = 'https://script.google.com/macros/s/AKfycbyOWcgXh2-lqss_ueKZKA8eG71SWvZxI9H3tKomBnUncwN4tuWNDD2DHyVvWer7oyVo/exec';

const BEERS = [
  {
    id:'mona',
    name:'Mona',
    latin:'Cebus capucinus',
    style:'Blonde Ale',
    color:'#E3C767',
    abv:'5.6%', ibu:'25', ebc:'10',
    description:'Rubia y curiosa, Blonde ale maltosa y ligera, de fermentación limpia con un leve toque frutal de fondo. Amargor notable pero suave, cierre seco y agradable.',
    ingredients:['Malta de Cebada','Lúpulos Apollo, Challenger','Levadura Ale'],
    pairing:['Pollo','Arepa','Sanduche'],
    tag:'Disponible',
    prices:{unit:11000, four:42000}
  },
  {
    id:'murcielago',
    name:'Murciélago',
    latin:'Desmodus rotundus',
    style:'Coffee Stout Picante',
    color:'#4A4644',
    abv:'5.3%', ibu:'20', ebc:'70',
    medal:{type:'bronze', label:'Bronce', event:'Pola Dorada VIII'},
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
    tag:'Agotado',
    soldOut:true,
    prices:{unit:13000, four:46000}
  },
  {
    id:'tucan',
    name:'Tucán',
    latin:'Ramphastos ambiguus',
    style:'Hazy Mango IPA',
    color:'#F2A02A',
    abv:'8.3%', ibu:'45', ebc:'10',
    description:'Amarilla como su pico y el mango que disfruta. Lúpulo tropical protagonista, con una nota de pulpa real de mango. Turbia, jugosa, sin concesiones.',
    ingredients:['Malta de Cebada','Lúpulos Lotus, El Dorado','Levadura Ale','Pulpa de Mango'],
    pairing:['Cerdo','Hamburguesas','Papas Fritas'],
    tag:'Agotado',
    soldOut:true,
    prices:{unit:14000, four:50000}
  },
  {
    id:'salamandra',
    name:'Salamandra',
    latin:'Notophthalmus viridescens',
    style:'Red IPA',
    color:'#D9601A',
    abv:'6.5%', ibu:'60', ebc:'25',
    medal:{type:'gold', label:'Oro', event:'Pola Dorada VIII'},
    description:'Como la salamandra, naranja e imposible de ignorar. Cítrico y pino fragante anuncian una amargura limpia y directa, sostenida por malta y caramelo.',
    ingredients:['Malta de Cebada','Lúpulos Apollo, Centennial','Levadura Ale'],
    pairing:['Fritos','Pizza','Chocolate'],
    tag:'Agotado',
    soldOut:true,
    prices:{unit:13000, four:46000}
  },
  {
    id:'viudanegra',
    name:'Viuda Negra',
    latin:'Latrodectus curacaviensis',
    style:'Imperial Stout',
    color:'#141212',
    abv:'9%', ibu:'60', ebc:'90',
    description:'La viuda negra atrae con dulzura y no perdona. Chocolate, vainilla y malta tostada sobre un cuerpo pleno y cremoso gracias a la lactosa, como una malteada de chocolate.',
    ingredients:['Malta de Cebada','Cebada Tostada','Lactosa','Saborizante de Vainilla','Lúpulos Apollo','Levadura Ale'],
    pairing:['Helado','Tiramisú','Carne ahumada'],
    tag:'Edición limitada',
    limited:true,
    prices:{unit:15000, four:54000}
  },
  {
    id:'ranadorada',
    name:'Rana Dorada',
    latin:'Phyllobates terribilis',
    style:'Belgian Golden Strong',
    color:'#B8860B',
    abv:'9%', ibu:'25', ebc:'9',
    description:'Igual que la rana dorada, el color dorado fuerte advierte sobre su potencia. Notas frutales y un toque de pimienta sobre un cuerpo liviano, con un calor de alcohol suave.',
    ingredients:['Malta de Cebada','Lúpulos Hallertauer Tradition, Challenger','Levadura Ale'],
    pairing:['Frutas','Mariscos','Charcutería'],
    tag:'Disponible',
    prices:{unit:14000, four:50000}
  }
];

// Combo promocional — precio fijo, queda fuera del carrito y del descuento de 4-pack.
// Se oculta solo después de `expires` (fin del 30 de noviembre, hora de Colombia).
const COMBO = {
  name:'Combo Promocional',
  items:[{id:'murcielago', qty:2}, {id:'salamandra', qty:2}],
  price:42000,
  expires:'2026-11-30T23:59:59-05:00',
  validUntil:'30 de noviembre'
};

const PACK = 4; // tamaño del paquete
