/**
* @author : julienderay
* Created on 02/03/2016
*/

"use strict";

/**
 * Constants
 */
const gradesList = ['A', 'B', 'C', 'D', 'E', 'F', 'G'];

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

var transformer = transform(function(record, callback){
    setTimeout(function(){
        callback(null, transformRecord(record));
    }, 500);
}, {parallel: 10});

input.pipe(parser).pipe(transformer).pipe(process.stdout);


/**
 * Functions
 */

function transformRecord(record) {
    return transformGrades(record);
}

function transformColumns(columns) {
    let gradeIndex = columns.indexOf('grade');
    const columnsToAdd = gradesList.map(grade => `grade_${grade}`);
    columnsToAdd.forEach(col => columns.splice(gradeIndex++, 0, col));
    columns.splice(gradeIndex, 1);
    return columns;
}

function transformGrades(record) {
    console.log(record);
    const gradesResult = Array(gradesList.length).fill(0);
    const gradeNo = gradesList.indexOf(record.grade);
    gradesResult[gradeNo] = 1;

    const recordKeys = Object.keys(record);
    const gradeColIndex = recordKeys.indexOf('grade');

    let result = [];

    recordKeys.forEach((key, index) => {
        if (index == gradeColIndex) {
            result.push(gradesResult);
        }
        else {
            result.push(record[key]);
        }
    });

    return result + '\n';
}
