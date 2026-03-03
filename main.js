const fs = require("fs");
function toSec(timeStr) {
    let parts = timeStr.trim().split(' ');
    let hms = parts[0].split(':');
    let h = parseInt(hms[0], 10);
    let m = parseInt(hms[1], 10);
    let s = parseInt(hms[2], 10);
    
    if (parts.length > 1) {
        let ampm = parts[1].toLowerCase();
        if (ampm === 'pm' && h !== 12) h += 12;
        if (ampm === 'am' && h === 12) h = 0;
    }
    return (h * 3600) + (m * 60) + s;
}

function toTime(totalSec) {
    let h = Math.floor(totalSec / 3600);
    let m = Math.floor((totalSec % 3600) / 60);
    let s = totalSec % 60;
    
    let mStr = m < 10 ? '0' + m : m;
    let sStr = s < 10 ? '0' + s : s;
    return h + ":" + mStr + ":" + sStr;
}
// ============================================================
// Function 1: getShiftDuration(startTime, endTime)
// startTime: (typeof string) formatted as hh:mm:ss am or hh:mm:ss pm
// endTime: (typeof string) formatted as hh:mm:ss am or hh:mm:ss pm
// Returns: string formatted as h:mm:ss
// ============================================================
function getShiftDuration(startTime, endTime) {
    let start = toSec(startTime);
    let end = toSec(endTime);
    
    if (end < start) end += 24 * 3600;
    
    return toTime(end - start);
}

// ============================================================
// Function 2: getIdleTime(startTime, endTime)
// startTime: (typeof string) formatted as hh:mm:ss am or hh:mm:ss pm
// endTime: (typeof string) formatted as hh:mm:ss am or hh:mm:ss pm
// Returns: string formatted as h:mm:ss
// ============================================================
function getIdleTime(startTime, endTime) {
    let start = toSec(startTime);
    let end = toSec(endTime);
    if (end < start) end += 24 * 3600;

    let delStart = toSec("8:00:00 am");
    let delEnd = toSec("10:00:00 pm");
    let idle = 0;

    if (start < delStart) {
        let limit = end < delStart ? end : delStart;
        idle += limit - start;
    }
    if (end > delEnd) {
        let limit = start > delEnd ? start : delEnd;
        idle += end - limit;
    }
    return toTime(idle);
}

// ============================================================
// Function 3: getActiveTime(shiftDuration, idleTime)
// shiftDuration: (typeof string) formatted as h:mm:ss
// idleTime: (typeof string) formatted as h:mm:ss
// Returns: string formatted as h:mm:ss
// ============================================================
function getActiveTime(shiftDuration, idleTime) {
    let shiftSec = toSec(shiftDuration);
    let idleSec = toSec(idleTime);
    
    return toTime(shiftSec - idleSec);
}

// ============================================================
// Function 4: metQuota(date, activeTime)
// date: (typeof string) formatted as yyyy-mm-dd
// activeTime: (typeof string) formatted as h:mm:ss
// Returns: boolean
// ============================================================
function metQuota(date, activeTime) {
    let activeSec = toSec(activeTime);
    let quotaSec = toSec("8:24:00"); 

    let d = new Date(date);
    let eidStart = new Date("2025-04-10");
    let eidEnd = new Date("2025-04-30");

    if (d >= eidStart && d <= eidEnd) {
        quotaSec = toSec("6:00:00"); 
    }
    
    return activeSec >= quotaSec;
}

// ============================================================
// Function 5: addShiftRecord(textFile, shiftObj)
// textFile: (typeof string) path to shifts text file
// shiftObj: (typeof object) has driverID, driverName, date, startTime, endTime
// Returns: object with 10 properties or empty object {}
// ============================================================
function addShiftRecord(textFile, shiftObj) {
    // TODO: Implement this function
}

// ============================================================
// Function 6: setBonus(textFile, driverID, date, newValue)
// textFile: (typeof string) path to shifts text file
// driverID: (typeof string)
// date: (typeof string) formatted as yyyy-mm-dd
// newValue: (typeof boolean)
// Returns: nothing (void)
// ============================================================
function setBonus(textFile, driverID, date, newValue) {
    // TODO: Implement this function
}

// ============================================================
// Function 7: countBonusPerMonth(textFile, driverID, month)
// textFile: (typeof string) path to shifts text file
// driverID: (typeof string)
// month: (typeof string) formatted as mm or m
// Returns: number (-1 if driverID not found)
// ============================================================
function countBonusPerMonth(textFile, driverID, month) {
    // TODO: Implement this function
}

// ============================================================
// Function 8: getTotalActiveHoursPerMonth(textFile, driverID, month)
// textFile: (typeof string) path to shifts text file
// driverID: (typeof string)
// month: (typeof number)
// Returns: string formatted as hhh:mm:ss
// ============================================================
function getTotalActiveHoursPerMonth(textFile, driverID, month) {
    // TODO: Implement this function
}

// ============================================================
// Function 9: getRequiredHoursPerMonth(textFile, rateFile, bonusCount, driverID, month)
// textFile: (typeof string) path to shifts text file
// rateFile: (typeof string) path to driver rates text file
// bonusCount: (typeof number) total bonuses for given driver per month
// driverID: (typeof string)
// month: (typeof number)
// Returns: string formatted as hhh:mm:ss
// ============================================================
function getRequiredHoursPerMonth(textFile, rateFile, bonusCount, driverID, month) {
    // TODO: Implement this function
}

// ============================================================
// Function 10: getNetPay(driverID, actualHours, requiredHours, rateFile)
// driverID: (typeof string)
// actualHours: (typeof string) formatted as hhh:mm:ss
// requiredHours: (typeof string) formatted as hhh:mm:ss
// rateFile: (typeof string) path to driver rates text file
// Returns: integer (net pay)
// ============================================================
function getNetPay(driverID, actualHours, requiredHours, rateFile) {
    // TODO: Implement this function
}


module.exports = {
    getShiftDuration,
    getIdleTime,
    getActiveTime,
    metQuota,
    addShiftRecord,
    setBonus,
    countBonusPerMonth,
    getTotalActiveHoursPerMonth,
    getRequiredHoursPerMonth,
    getNetPay
};
