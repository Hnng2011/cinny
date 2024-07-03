/* eslint-disable no-unused-expressions */
/* eslint-disable no-plusplus */

function generateRandomString(length, number) {
    const characters = number ? '0123456789' : 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';

    let result = '';
    const charactersLength = characters.length;
    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}

export default generateRandomString