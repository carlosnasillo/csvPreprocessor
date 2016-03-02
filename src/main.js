/**
* @author : julienderay
* Created on 02/03/2016
*/

var fs = require('fs');
var parse = require('csv-parse');
var transform = require('stream-transform');

var output = [];
var parser = parse({delimiter: ':', columns: true});
var input = fs.createReadStream('csv/test.csv');

var transformer = transform(function(record, callback){
    setTimeout(function(){
        callback(null, transformRecord(record));
    }, 500);
}, {parallel: 10});

input.pipe(parser).pipe(transformer).pipe(process.stdout);




function transformRecord(record) {
    return transformGrades(record);
}

function transformGrades(record) {
    const gradesList = ['A', 'B', 'C', 'D', 'E', 'F', 'G'];
    const gradesResult = Array(gradesList.length).fill(0);
    const gradeNo = gradesList.indexOf(record.grade);
    gradesResult[gradeNo] = 1;
    return gradesResult.concat([record.name]).join(' ') + '\n';
}