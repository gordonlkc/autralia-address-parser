var parser = require('./parser'); 

console.log(parser.parseLocation('51 Montacute Rd, Campbelltown SA 5074'));
console.log(parser.parseLocation('13A Burlina Cct, Elizabeth Hills NSW 2171'));
console.log(parser.parseLocation('1 Darling Island Road, Pyrmont NSW 2009'));
console.log(parser.parseLocation('Breakfast Creek Rd & Austin St, Newstead QLD 4006'));