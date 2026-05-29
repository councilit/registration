"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.formattedEthiopianPhoneNumber = formattedEthiopianPhoneNumber;
function formattedEthiopianPhoneNumber(rawNumber) {
    // Remove all non-digit characters
    const digitsOnly = rawNumber.replace(/\D/g, "");
    // Remove leading zero if present
    const withoutLeadingZero = digitsOnly.replace(/^0/, "");
    // Check if the number already starts with 251 (country code)
    if (withoutLeadingZero.startsWith("251")) {
        return `+${withoutLeadingZero}`;
    }
    // Append +251 and return
    return `+251${withoutLeadingZero}`;
}
