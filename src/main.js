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

let columns = [];

var parser = parse({
    delimiter: ',',
    columns: firstLine => {
        columns = transformColumns(firstLine);
        console.log(columns);
        return columns;
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
    return columns;
}

function transformGrades(record) {
    const gradesResult = Array(gradesList.length).fill(0);
    const gradeNo = gradesList.indexOf(record.grade);
    gradesResult[gradeNo] = 1;
    return gradesResult.concat([]).join(' ') + '\n';
}
