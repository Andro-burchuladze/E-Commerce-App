import kavenegar from "kavenegar";
import config from "../config";


// Sms templates
const templates = {
    VERIFY_PHONE: "verifyPhone",
};

const api = kavenegar.KavenegarApi({ apikey: config.sms.kavenegar });

/**
 * send verification
 * @param {string} receptor
 * @param {string} token
 * @returns {Void}
 */
function sendMobileVerification(receptor: string, token: string) {
    api.VerifyLookup({
        receptor, token, template: templates.VERIFY_PHONE
    }, (res, status) => {
        //TODO:
    });

}

/**
 * send message
 * @param {string} receptor
 * @param {string} token
 * @returns {Void}
 */
function sendMessage(receptor: string, message: string) {
    api.Send({
        receptor, message
    }, (res, status) => {
        //TODO:
    });

}

export default {
    sendMobileVerification,
    sendMessage
}

