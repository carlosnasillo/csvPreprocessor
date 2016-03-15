/**
 * Created by julienderay on 15/03/2016.
 */

const issued_d = 'Jan-09';
const last_payment = 'May-11';

const monthList = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const res = diffDates(issued_d, last_payment);

console.log(res);

//==========

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