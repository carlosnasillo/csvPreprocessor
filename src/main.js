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
    const homeColumnsToAdd = gradesList.map(grade => `home_${grade}`);
    homeColumnsToAdd.forEach(col => columns.splice(homeIndex++, 0, col));
    columns.splice(homeIndex, 1);

    console.log(columns);
    return columns;
}

function transformRecord(record) {
    const gradesResult = Array(gradesList.length).fill(0);
    const gradeNo = gradesList.indexOf(record.grade);
    gradesResult[gradeNo] = 1;

    const homeOwnershipResult = Array(homeList.length).fill(0);
    const homeOwnershipNo = homeList.indexOf(record.home_ownership);
    homeOwnershipResult[homeOwnershipNo] = 1;

    const recordKeys = Object.keys(record);
    const gradeColIndex = recordKeys.indexOf('grade');
    const homeOwnershipColIndex = recordKeys.indexOf('home_ownership');

    let result = [];
    recordKeys.forEach((key, index) => {
        if (index == homeOwnershipColIndex) {
            result.push(homeOwnershipResult);
        }
        else if (index == gradeColIndex) {
            result.push(gradesResult);
        }
        else {
            result.push(record[key]);
        }
    });

    return result + '\n';
}