export const mobileNumberRegex = /^\+[1-9]{1}[0-9]{3,14}$/;
export const phoneNumberRegex = /^0[0-9]{2,}[0-9]{7,}$/;
export const passwordRegex = /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$/;
export const jwtTokenRegex = /^[A-Za-z0-9-_=]+\.[A-Za-z0-9-_=]+\.?[A-Za-z0-9-_.+/=]*$/;
