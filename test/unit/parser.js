/* eslint-env mocha */
/* eslint-disable max-statements */
const assert = require("assert");

const parser = require("../../src/parser");

describe("Parser - Unit", ()=>
{

  it("should extract the settings from Display Control Configuration content text", () =>
  {
    const content = `
Select 'Need help configuring Display Control?' above for instructions.
-----------------------------------------------------------------------
interface=cec
serial-port=SERIAL1
serial-baud-rate=
serial-data-bits=
serial-parity=
serial-stop-bits=
serial-flow-control=
serial-screen-on-cmd=
serial-screen-off-cmd=`;

    const settings = parser.parseContent(content);
console.log(JSON.stringify(settings));
    assert(settings);
    assert.equal(settings.interface, "cec");
    assert.equal(settings['serial-port'], "SERIAL1");
    assert.equal(settings['serial-baud-rate'], "");
    assert.equal(settings['serial-screen-off-cmd'], "");
  });

});
