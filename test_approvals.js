const fs = require('fs');
let content = fs.readFileSync('app.js', 'utf8');
if (content.includes('navigateToPage(\'pipeline\')')) {
  console.log('Still navigates to pipeline');
} else {
  console.log('Does not navigate to pipeline');
}
