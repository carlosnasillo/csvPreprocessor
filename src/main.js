/**
* @author : julienderay
* Created on 02/03/2016
*/

"use strict";

/**
 * Configuration
 */
const csvFile = '/Users/julienderay/Lattice/csvs/concat.csv';

/**
 * Constants
 */
const gradesList = ['A', 'B', 'C', 'D', 'E', 'F', 'G'];
const homeList = ['ANY', 'RENT', 'MORTGAGE', 'OWN', 'OTHER', 'NONE'];
const ficoColumns = ['FICO1', 'FICO2', 'FICO3', 'FICO4', 'FICO5', 'FICO6'];
const purposeList = ['credit_card', 'debt_consolidation', 'car', 'house', 'home_improvement', 'other', 'medical', 'moving', 'major_purchase', 'vacation', 'small_business', 'renewable_energy', 'wedding'];
const statusList = ['Fully Paid', 'Current'];
const monthList = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/**
 * Main
 */
var fs = require('fs');
var parse = require('csv-parse');
var transform = require('stream-transform');
var stringify = require('csv-stringify');

/**
 * Streams definition
 */

// input
var input = fs.createReadStream(csvFile);

// parser
let transformedColumns;
var parser = parse({
    delimiter: ',',
    columns: firstLine => {
        transformedColumns = transformColumns(JSON.parse(JSON.stringify(firstLine)));
        return firstLine;
    }
});

// coma remover
var comaRemover = transform(record => {
    Object.keys(record).forEach(k => {
        if (record[k].indexOf(',') > -1) {
            record[k] = record[k].replace(/,/g, '');
        }
    });
    return record;
});

// transformer
var transformer = transform(record => transformRecord(record));

// verifier
var verifier = transform(record => {
    // if (record.split(',').length === 80) {
        return record;
    // }
    // else {
    //     console.log("Error : ", record.split(',').length, JSON.stringify(record));
    // }
});

// output
const newFileName = csvFile.split('.csv')[0] + '_preprocessed.csv';
var output = fs.createWriteStream(newFileName);
output.on('finish', function () {
    console.log('== The CSV has been written ==');
    console.log('\n\n ==> Columns to use with this CSV :', transformedColumns);
    console.log(`You can add it to you file using sed (gsed on MacOS) : sed -i "1s/^/${transformedColumns}\\n/" ${newFileName}`);
});

/**
 * Execution of the stream
 */

input
    .pipe(parser).pipe(comaRemover).pipe(transformer).pipe(verifier).pipe(output);

/**
 * Functions
 */

function transformColumns(columns) {
    let gradeIndex = columns.indexOf('grade');
    const gradeColumnsToAdd = gradesList.map(grade => `grade_${grade}`);
    gradeColumnsToAdd.forEach(col => columns.splice(gradeIndex++, 0, col));
    columns.splice(gradeIndex, 1);

    let homeIndex = columns.indexOf('home_ownership');
    const homeColumnsToAdd = homeList.map(ho => `home_${ho}`);
    homeColumnsToAdd.forEach(col => columns.splice(homeIndex++, 0, col));
    columns.splice(homeIndex, 1);

    let purposeIndex = columns.indexOf('purpose');
    const purposeColumnsToAdd = purposeList.map(purpose => `purpose_${purpose}`);
    purposeColumnsToAdd.forEach(col => columns.splice(purposeIndex++, 0, col));
    columns.splice(purposeIndex, 1);

    let statusIndex = columns.indexOf('loan_status');
    const statusColumnToAdd = ['status'];
    statusColumnToAdd.forEach(col => columns.splice(statusIndex++, 0, col));

    let monthsPaidOutOfTermIndex = 0;
    const monthsPaidOutOfTermColumnToAdd = ['monthsPaidOutOfTerm'];
    monthsPaidOutOfTermColumnToAdd.forEach(col => columns.splice(monthsPaidOutOfTermIndex++, 0, col));

    let ficoIndex = columns.indexOf('fico_range_low');
    ficoColumns.forEach(col => columns.splice(ficoIndex++, 0, col));
    columns.splice(ficoIndex, 2);

    return columns;
}

function transformRecord(record) {
    const recordKeys = Object.keys(record);

    if (record.issue_d === undefined) {
        return '';
    }

    const gradesResult = generateMatrix(gradesList, 'grade', record);
    const homeOwnershipResult = generateMatrix(homeList, 'home_ownership', record);
    const purposeResult = generateMatrix(purposeList, 'purpose', record);
    const statusResult = statusList.indexOf(record.loan_status) > -1 ? 1 : 0;
    const monthsPaidOutOfTermResult = diffDates(record.issue_d, record.last_pymnt_d) / record.term;
    const ficoResult = generateFicoMatrix('fico_range_low', 'fico_range_high', record);

    const gradeColIndex = recordKeys.indexOf('grade');
    const homeOwnershipColIndex = recordKeys.indexOf('home_ownership');
    const purposeColIndex = recordKeys.indexOf('purpose');
    const statusColIndex = recordKeys.indexOf('loan_status');
    const monthsPaidOutOfTermIndex = 0;
    const ficoLowColIndex = recordKeys.indexOf('fico_range_low');

    let result = [];
    recordKeys.forEach((key, index) => {
        if (index == homeOwnershipColIndex) {
            result.push(homeOwnershipResult);
        }
        else if (index == gradeColIndex) {
            result.push(gradesResult);
        }
        else if (index == purposeColIndex) {
            result.push(purposeResult);
        }
        else if (index == statusColIndex) {
            result.push(statusResult);
            result.push(record[recordKeys[index]]);
        }
        else if (index == monthsPaidOutOfTermIndex) {
            result.push(monthsPaidOutOfTermResult);
            result.push(record[recordKeys[index]]);
        }
        else if (index == ficoLowColIndex) {
            result.push(ficoResult);
        }
        else if (index == ficoLowColIndex + 1) {
            // ignored
        }
        else {
            result.push(record[key]);
        }
    });

    return result + '\n';

    function generateFicoMatrix(colLow, colHigh, record) {
        const matrix = Array(ficoColumns.length).fill(0);
        matrix[getFicoRangeNo(record[colLow], record[colHigh])] = 1;

        return matrix;

        function getFicoRangeNo(ficoLow, ficoHigh) {
            const res = [];

            if (ficoHigh < 640) {
                res.push(0);
            }
            if (640 <= ficoLow && ficoLow < 659) {
                res.push(0);
            }
            if (660 <= ficoLow && ficoLow < 678) {
                res.push(1);
            }
            if (679 <= ficoLow && ficoLow < 713) {
                res.push(2);
            }
            if (714 <= ficoLow && ficoLow < 749) {
                res.push(3);
            }
            if (750 <= ficoLow && ficoLow < 780) {
                res.push(4);
            }
            if (ficoLow > 780) {
                res.push(5);
            }

            return res[0];
        }
    }

    function generateMatrix(values, columnToReplace, record) {
        const matrix = Array(values.length).fill(0);
        const valueNo = values.indexOf(record[columnToReplace]);
        matrix[valueNo] = 1;

        return matrix;
    }

    function diffDates(issued_d, last_payment) {
        const issuedDSplit = issued_d.split('-');
        const issuedMonthNb = monthList.indexOf(issuedDSplit[0]);
        const issuedYearNb = issuedDSplit[1];

        const lastPaymentSplit = last_payment.split('-');
        const lastPaymentMonthNb = monthList.indexOf(lastPaymentSplit[0]);
        const lastPaymentYearNb = lastPaymentSplit[1];

        if (issuedYearNb == lastPaymentYearNb) {
            const diff = issuedMonthNb - lastPaymentMonthNb;
            return Math.abs(diff);
        }
        else {
            return lastPaymentMonthNb - issuedMonthNb + Math.abs(issuedYearNb - lastPaymentYearNb) * 12;
        }
    }
}