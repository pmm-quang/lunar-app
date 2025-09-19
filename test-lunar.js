import { Lunar, Solar } from 'lunar-javascript';

// Test với ngày cụ thể
const solar = Solar.fromYmd(2024, 1, 1);
const lunar = solar.getLunar();

console.log('Lunar object methods:');
console.log(Object.getOwnPropertyNames(lunar.__proto__).filter(name =>
    name.includes('Leap') ||
    name.includes('leap') ||
    name.includes('Month') ||
    name.includes('month')
));

console.log('\nLunar object:');
console.log('Year:', lunar.getYear());
console.log('Month:', lunar.getMonth());
console.log('Day:', lunar.getDay());

// Thử các method có thể liên quan đến leap month
console.log('\nTesting methods:');
try {
    console.log('isLeap():', lunar.isLeap());
} catch (e) {
    console.log('isLeap() error:', e.message);
}

try {
    console.log('getLeapMonth():', lunar.getLeapMonth());
} catch (e) {
    console.log('getLeapMonth() error:', e.message);
}

try {
    console.log('isLeapMonth():', lunar.isLeapMonth());
} catch (e) {
    console.log('isLeapMonth() error:', e.message);
}
