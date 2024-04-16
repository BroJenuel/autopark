export function isMobileNumberValid(number) {
    // Regular expression to match a valid mobile number
    const regex = /^[0-9]{11}$/;

    // Check if the number matches the regular expression
    return regex.test(number);
}