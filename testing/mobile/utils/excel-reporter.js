const WDIOReporter = require('@wdio/reporter').default;
const exceljs = require('exceljs');
const path = require('path');
const fs = require('fs');

class ExcelReporter extends WDIOReporter {
    constructor(options) {
        super(options);
        this.options = options;
        this._workbook = new exceljs.Workbook();
        this._sheet = this._workbook.addWorksheet('Mobile Test Results');
        this._sheet.columns = [
            { header: 'Suite', key: 'suite', width: 25 },
            { header: 'Test Name', key: 'title', width: 40 },
            { header: 'Status', key: 'status', width: 15 },
            { header: 'Duration (ms)', key: 'duration', width: 15 },
            { header: 'Error', key: 'error', width: 50 }
        ];
        this._sheet.getRow(1).font = { bold: true };
        this.results = [];
    }

    onTestPass(test) {
        this.results.push({
            suite: test.parent,
            title: test.title,
            status: 'Pass',
            duration: test._duration,
            error: ''
        });
    }

    onTestFail(test) {
        this.results.push({
            suite: test.parent,
            title: test.title,
            status: 'Fail',
            duration: test._duration,
            error: test.error ? test.error.message : 'Unknown error'
        });
    }

    onTestSkip(test) {
        this.results.push({
            suite: test.parent,
            title: test.title,
            status: 'Skipped',
            duration: 0,
            error: ''
        });
    }

    async onRunnerEnd() {
        this.results.forEach(res => {
            this._sheet.addRow(res);
        });

        const resultsDir = this.options.outputDir || path.join(process.cwd(), 'test-results');
        if (!fs.existsSync(resultsDir)) {
            fs.mkdirSync(resultsDir, { recursive: true });
        }
        
        const filename = this.options.filename || 'Mobile_Test_Report.xlsx';
        const exportPath = path.join(resultsDir, filename);
        
        await this._workbook.xlsx.writeFile(exportPath);
        console.log(`Saved Mobile Excel Report to ${exportPath}`);
    }
}

module.exports = ExcelReporter;
