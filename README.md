# CSV Preprocessor

## Usage

* Change the path to your CSV in the first line of main.js (`csvFile`)
* Install the dependencies : `npm install`
* Run the program : `node main.js`
* Adds the new columns to the generated file using sed once the process is done (`sed -i \'\' "1s/^/${transformedColumns}\\n/" preprocessedCSV.csv`)