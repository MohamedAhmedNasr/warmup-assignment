const fs = require("fs");
function toSec(timeStr) {
    let spaceSplit = timeStr.split(" ");
    let timePart = spaceSplit[0];
    
    let timeArray = timePart.split(":");
    let hours = parseInt(timeArray[0]);
    let minutes = parseInt(timeArray[1]);
    let seconds = parseInt(timeArray[2]);
    
    if (spaceSplit.length == 2) {
        let amOrPm = spaceSplit[1];
        
        if (amOrPm == "pm") {
            if (hours != 12) {
                hours = hours + 12;
            }
        }
        
        if (amOrPm == "am") {
            if (hours == 12) {
                hours = 0;
            }
        }
    }
    
    let totalSeconds = (hours * 3600) + (minutes * 60) + seconds;
    return totalSeconds;
}

function toTime(totalSec) {
    let hours = Math.floor(totalSec / 3600);
    
    let remaining = totalSec % 3600;
    let minutes = Math.floor(remaining / 60);
    let seconds = remaining % 60;
    
    let minString = minutes.toString();
    let secString = seconds.toString();
    
    if (minutes < 10) {
        minString = "0" + minString;
    }
    
    if (seconds < 10) {
        secString = "0" + secString;
    }
    
    return hours + ":" + minString + ":" + secString;
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
    
    if (end < start) {
        end = end + (24 * 3600);
    }

    let delStart = toSec("8:00:00 am");
    let delEnd = toSec("10:00:00 pm");
    let idle = 0;

    if (start < delStart) {
        let limit;
        if (end < delStart) {
            limit = end;
        } else {
            limit = delStart;
        }
        idle = idle + (limit - start);
    }
    
    if (end > delEnd) {
        let limit;
        if (start > delEnd) {
            limit = start;
        } else {
            limit = delEnd;
        }
        idle = idle + (end - limit);
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
    let fileContent = fs.readFileSync(textFile, "utf-8");
    let rows = fileContent.split("\n");
    for (let row of rows) {
        if (row == "") continue;
        let col = row.split(",");
        if (col[0] == shiftObj.driverID && col[2] == shiftObj.date) {
            return {};
        }
    }

    let shiftDuration = getShiftDuration(shiftObj.startTime, shiftObj.endTime);
    let idleTime = getIdleTime(shiftObj.startTime, shiftObj.endTime);
    let activeTime = getActiveTime(shiftDuration, idleTime);
    let quota = metQuota(shiftObj.date, activeTime);

    let newRow = shiftObj.driverID + "," + shiftObj.driverName + "," + shiftObj.date + "," + shiftObj.startTime + "," + shiftObj.endTime + "," + shiftDuration + "," + idleTime + "," + activeTime + "," + quota + "," + false;

    let lastIndex = -1;
    for (let i = 0; i < rows.length; i++) {
        if (rows[i] == "") continue;
        let col = rows[i].split(",");
        if (col[0] == shiftObj.driverID) {
            lastIndex = i;
        }
    }

    if (lastIndex == -1) {
        rows.push(newRow);
    } else {
        rows.splice(lastIndex + 1, 0, newRow);
    }

    fs.writeFileSync(textFile, rows.join("\n"), "utf-8");

    return {
        driverID: shiftObj.driverID,
        driverName: shiftObj.driverName,
        date: shiftObj.date,
        startTime: shiftObj.startTime,
        endTime: shiftObj.endTime,
        shiftDuration: shiftDuration,
        idleTime: idleTime,
        activeTime: activeTime,
        metQuota: quota,
        hasBonus: false
    };
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
    let fileContent = fs.readFileSync(textFile, "utf-8");
    let rows = fileContent.split("\n");

    for (let i = 0; i < rows.length; i++) {
        let col = rows[i].split(",");
        if (col[0] == driverID && col[2] == date) {
            col[9] = newValue.toString();
            rows[i] = col.join(",");
        }
    }

    fs.writeFileSync(textFile, rows.join("\n"), "utf-8");
}

// ============================================================
// Function 7: countBonusPerMonth(textFile, driverID, month)
// textFile: (typeof string) path to shifts text file
// driverID: (typeof string)
// month: (typeof string) formatted as mm or m
// Returns: number (-1 if driverID not found)
// ============================================================
function countBonusPerMonth(textFile, driverID, month) {
    let fileContent = fs.readFileSync(textFile, "utf-8");
    let rows = fileContent.split("\n");

    let driverFound = false;
    let bonusCount = 0;

    for (let row of rows) {
        if (row == "") continue;
        let col = row.split(",");
        if (col[0] == driverID) {
            driverFound = true;
            let rowMonth = parseInt(col[2].split("-")[1]);
            if (rowMonth == parseInt(month) && col[9].trim() == "true") {
                bonusCount++;
            }
        }
    }

    if (driverFound == false) return -1;
    return bonusCount;
}

// ============================================================
// Function 8: getTotalActiveHoursPerMonth(textFile, driverID, month)
// textFile: (typeof string) path to shifts text file
// driverID: (typeof string)
// month: (typeof number)
// Returns: string formatted as hhh:mm:ss
// ============================================================
function getTotalActiveHoursPerMonth(textFile, driverID, month) {
    let fileContent = fs.readFileSync(textFile, "utf-8");
    let rows = fileContent.split("\n");

    let totalSec = 0;

    for (let row of rows) {
        if (row == "") continue;
        let col = row.split(",");
        if (col[0] == driverID) {
            let rowMonth = parseInt(col[2].split("-")[1]);
            if (rowMonth == month) {
                totalSec = totalSec + toSec(col[7]);
            }
        }
    }

    return toTime(totalSec);
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
    let rateContent = fs.readFileSync(rateFile, "utf-8");
    let rateRows = rateContent.split("\n");

    let driverDayOff = "";
    for (let row of rateRows) {
        if (row == "") continue;
        let col = row.split(",");
        if (col[0] == driverID) {
            driverDayOff = col[1].trim();
        }
    }

    let fileContent = fs.readFileSync(textFile, "utf-8");
    let rows = fileContent.split("\n");

    let dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    let eidStart = new Date("2025-04-10");
    let eidEnd = new Date("2025-04-30");

    let totalRequiredSec = 0;

    for (let row of rows) {
        if (row == "") continue;
        let col = row.split(",");
        if (col[0] == driverID) {
            let rowMonth = parseInt(col[2].split("-")[1]);
            if (rowMonth == month) {
                let d = new Date(col[2]);
                let dayName = dayNames[d.getDay()];
                if (dayName == driverDayOff) continue;
                if (d >= eidStart && d <= eidEnd) {
                    totalRequiredSec = totalRequiredSec + toSec("6:00:00");
                } else {
                    totalRequiredSec = totalRequiredSec + toSec("8:24:00");
                }
            }
        }
    }

    let bonusDeduction = bonusCount * toSec("2:00:00");
    totalRequiredSec = totalRequiredSec - bonusDeduction;
    if (totalRequiredSec < 0) totalRequiredSec = 0;

    return toTime(totalRequiredSec);
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
    let rateContent = fs.readFileSync(rateFile, "utf-8");
    let rateRows = rateContent.split("\n");

    let basePay = 0;
    let tier = 0;

    for (let row of rateRows) {
        if (row == "") continue;
        let col = row.split(",");
        if (col[0] == driverID) {
            basePay = parseInt(col[2]);
            tier = parseInt(col[3]);
        }
    }

    let actualSec = toSec(actualHours);
    let requiredSec = toSec(requiredHours);

    if (actualSec >= requiredSec) return basePay;

    let missingSec = requiredSec - actualSec;
    let missingHours = Math.floor(missingSec / 3600);

    let allowedMissing = 0;
    if (tier == 1) allowedMissing = 50;
    if (tier == 2) allowedMissing = 20;
    if (tier == 3) allowedMissing = 10;
    if (tier == 4) allowedMissing = 3;

    let billableMissingHours = missingHours - allowedMissing;

    if (billableMissingHours <= 0) return basePay;

    let deductionRatePerHour = Math.floor(basePay / 185);
    let salaryDeduction = billableMissingHours * deductionRatePerHour;

    return basePay - salaryDeduction;
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
