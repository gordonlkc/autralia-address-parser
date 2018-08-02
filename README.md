# **Australia Address Parser**

Australia Address Parser is a regex-based street address and street intersection parser for Australia🇦🇺. It's basic goal is  parsing user-provided address strings into parts, thus identify the street type (that Google API is not providing). 

## Project Version Status
v1.0.0 

This project is currently in development. 

#### Usage:
```javascript
//install
npm install parse-address
var parser = require('australia-address-parser'); 

//use in browser
<script type="text/javascript" src="./auAddressParser.min.js"></script>

//Standard Address
parser.parseLocation('1 Darling Island Road, Pyrmont NSW 2009');

//Output
{ streetNumber: '1',
  streetName: 'Darling Island',
  streetType: 'Road',
  suburb: 'Pyrmont',
  state: 'NSW',
  postcode: '2009' }

//Intersection of roads
parser.parseLocation('Breakfast Creek Rd & Austin St, Newstead QLD 4006');

//Output
{ streetName1: 'Breakfast Creek',
  streetType1: 'Rd',
  streetName2: 'Austin',
  streetType2: 'St',
  suburb: 'Newstead',
  state: 'QLD',
  postcode: '4006',
  streetName: 'Breakfast Creek Rd & Austin St' }

//Address with unit
parser.parseLocation('13A Burlina Cct, Elizabeth Hills NSW 2171');

//Output
{ unitType: 'unit',
  unitNumber: 'A',
  streetName: 'Burlina',
  streetType: 'Cct',
  suburb: 'Elizabeth Hills',
  state: 'NSW',
  postcode: '2171' }
```
