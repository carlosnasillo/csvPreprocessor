/**
* @author : julienderay
* Created on 02/03/2016
*/

"use strict";

/**
 * Constants
 */
const gradesList = ['A', 'B', 'C', 'D', 'E', 'F', 'G'];
const homeList = ['ANY', 'RENT', 'MORTGAGE', 'OWN', 'OTHER', 'NONE'];
const ficoColumns = ['FICO1', 'FICO2', 'FICO3', 'FICO4', 'FICO5', 'FICO6'];
const purposeList = ['credit_card', 'debt_consolidation', 'car', 'house', 'home_improvement', 'other', 'medical', 'moving', 'major_purchase', 'vacation', 'small_business', 'renewable_energy', 'wedding'];

/**
 * Main
 */
var fs = require('fs');
var parse = require('csv-parse');
var transform = require('stream-transform');

let transformedColumns;

var parser = parse({
    delimiter: ',',
    columns: firstLine => {
        transformedColumns = transformColumns(JSON.parse(JSON.stringify(firstLine)));
        return firstLine;
    }
});

var input = fs.createReadStream('csv/LCmerged.csv');

var transformer = transform(record => transformRecord(record));

input
    .pipe(parser).pipe(transformer).pipe(process.stdout);

/**
 * Functions
 */

function transformColumns(columns) {
    let gradeIndex = columns.indexOf('grade');
    const gradeColumnsToAdd = gradesList.map(grade => `grade_${grade}`);
    gradeColumnsToAdd.forEach(col => columns.splice(gradeIndex++, 0, col));
    columns.splice(gradeIndex, 1);

    let homeIndex = columns.indexOf('home_ownership');
    const homeColumnsToAdd = gradesList.map(ho => `home_${ho}`);
    homeColumnsToAdd.forEach(col => columns.splice(homeIndex++, 0, col));
    columns.splice(homeIndex, 1);

    let purposeIndex = columns.indexOf('purpose');
    const purposeColumnsToAdd = purposeList.map(purpose => `purpose_${purpose}`);
    purposeColumnsToAdd.forEach(col => columns.splice(purposeIndex++, 0, col));
    columns.splice(purposeIndex, 1);

    let ficoIndex = columns.indexOf('fico_range_low');
    ficoColumns.forEach(col => columns.splice(ficoIndex++, 0, col));
    columns.splice(ficoIndex, 2);

    return columns;
}

function transformRecord(record) {
    const recordKeys = Object.keys(record);

    const gradesResult = generateMatrix(gradesList, 'grade', record);
    const homeOwnershipResult = generateMatrix(homeList, 'home_ownership', record);
    const purposeResult = generateMatrix(purposeList, 'purpose', record);
    const ficoResult = generateFicoMatrix('fico_range_low', 'fico_range_high', record);

    const gradeColIndex = recordKeys.indexOf('grade');
    const homeOwnershipColIndex = recordKeys.indexOf('home_ownership');
    const purposeColIndex = recordKeys.indexOf('purpose');
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
}