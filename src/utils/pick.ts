// TODO: change any types
// Create an object composed of the picked object properties
const pick = (object: any, keys: string[]) => {
    return keys.reduce((obj: any, key: any) => {
        if (object && Object.prototype.hasOwnProperty.call(object, key)) {
            obj[key] = object[key];
        }
        return obj;
    }, {});
};

export default pick;