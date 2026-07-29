const Mocha = require('mocha');
const {
  EVENT_RUN_BEGIN,
  EVENT_RUN_END,
  EVENT_TEST_FAIL,
  EVENT_TEST_PASS,
  EVENT_TEST_PENDING
} = Mocha.Runner.constants;
const exceljs = require('exceljs');
const path = require('path');
const fs = require('fs');

class ExcelReporter {
  constructor(runner) {
    this._workbook = new exceljs.Workbook();
    this._sheet = this._workbook.addWorksheet('Test Results');
    this._sheet.columns = [
      { header: 'Suite', key: 'suite', width: 25 },
      { header: 'Test Name', key: 'title', width: 40 },
      { header: 'Status', key: 'status', width: 15 },
      { header: 'Duration (ms)', key: 'duration', width: 15 },
      { header: 'Error', key: 'error', width: 50 }
    ];
    
    // Style header
    this._sheet.getRow(1).font = { bold: true };

    const stats = runner.stats;
    const resultsDir = path.join(__dirname, '..', '..', '..', 'test-results');
    
    if (!fs.existsSync(resultsDir)) {
      fs.mkdirSync(resultsDir, { recursive: true });
    }

    this.resultsPath = path.join(resultsDir, 'Web_Test_Report.xlsx');

    runner
      .once(EVENT_RUN_BEGIN, () => {
        console.log('Starting Web Tests...');
      })
      .on(EVENT_TEST_PASS, test => {
        this._sheet.addRow({
          suite: test.parent.title,
          title: test.title,
          status: 'Pass',
          duration: test.duration,
          error: ''
        });
      })
      .on(EVENT_TEST_FAIL, (test, err) => {
        this._sheet.addRow({
          suite: test.parent.title,
          title: test.title,
          status: 'Fail',
          duration: test.duration,
          error: err.message
        });
      })
      .on(EVENT_TEST_PENDING, test => {
         this._sheet.addRow({
          suite: test.parent.title,
          title: test.title,
          status: 'Skipped',
          duration: 0,
          error: ''
        });
      })
      .once(EVENT_RUN_END, async () => {
        console.log(`\nTests finished. Passed: ${stats.passes}, Failed: ${stats.failures}`);
        await this._workbook.xlsx.writeFile(this.resultsPath);
        console.log(`Saved Excel Report to ${this.resultsPath}`);
      });
  }
}

module.exports = ExcelReporter;
