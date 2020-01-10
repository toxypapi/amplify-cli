"use strict";
const print = require('../../extensions/amplify-helpers/print');
const util = require('util');
function run(e) {
    print.error('Error occured during configuration.');
    print.info(util.inspect(e));
}
module.exports = {
    run,
};
//# sourceMappingURL=../../../src/lib/lib/config-steps/c9-onFailure.js.map