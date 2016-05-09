FILE="LoanStats3a_securev1.csv"

# remove invalid loans (after the text "Loans that do not meet the credit policy")
head -`grep -n "Loans that do not meet the credit policy" $FILE | awk -F ":" '{print $1}'` $FILE  > ${FILE}.valid
# remove the 3 last lines
sed '$d' $FILE.valid | sed '$d' | sed '$d' > ${FILE}.good

# remove first line of the FILE
sed '1d' $FILE

# remove all double quotes (csv import into db)
gsed -i 's/"//g' concat_preprocessed.csv
