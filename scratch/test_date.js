const { parseISO } = require('date-fns');
try {
  console.log('Testing parseISO(null)...');
  parseISO(null);
} catch (e) {
  console.error('Caught error:', e.message);
}
try {
  console.log('Testing parseISO(undefined)...');
  parseISO(undefined);
} catch (e) {
  console.error('Caught error:', e.message);
}
