/**
 * The utility sets up the default README.md based on the PARTNER environment variable
 *
 * For example `PARTNER=cloud9 npm install` will replace README.md with README.cloud9.md
 */
var fs = require('fs');
var path = require('path');

if (process.env.PARTNER) {
  var readme = path.join(__dirname, '../README.md'); // README.md
  var slReadme = path.join(__dirname, '../README.strongloop.md'); // README.strongloop.md
  var partnerReadme = path.join(__dirname, '../README.' + process.env.PARTNER + '.md'); // README.<partner>.md, for example README.cloud9.md
  // If the provider specific README exists
  if (fs.existsSync(partnerReadme)) {
    // Rename README.md to be README.strongloop.md
    if (fs.existsSync(readme)) {
      fs.renameSync(readme, slReadme);
      console.log(readme, '-->', slReadme);
    }
    // Rename README.<partner>.md to be README.md
    fs.renameSync(partnerReadme, readme);
    console.log(partnerReadme, '-->', readme);
  }
}