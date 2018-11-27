/**
 * This file is an example on how should be defined a controllers map to trigger specific actions 
 * 
 * AKAI MIDIMIX 
 * 
 * ___________________________
 * | 16 20 24 28 46 50 54 58 |
 * | 17 21 25 29 47 51 55 59 |
 * | 18 22 26 30 48 52 56 60 |
 * |-------------------------|
 * | 19 23 27 31 49 53 57 61 |
 * |-------------------------|
 * 
 */

export default [
  {
    id: 16,
    onChange: (value) => { console.log(value) }
  },
  {
    id: 20,
    onChange: (value) => { console.log(value) }
  },
  {
    id: 24,
    onChange: (value) => { console.log(value) }
  },
  {
    id: 28,
    onChange: (value) => { console.log(value) }
  },
  {
    id: 46,
    onChange: (value) => { console.log(value) }
  },
  {
    id: 50,
    onChange: (value) => { console.log(value) }
  },
  {
    id: 54,
    onChange: (value) => { console.log(value) }
  },
  {
    id: 58,
    onChange: (value) => { console.log(value) }
  }
];


