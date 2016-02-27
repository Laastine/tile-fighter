function keyboard(keyCode) {
    var key = {
        code: keyCode,
        isDown: false,
        isUp: true,
        press: function () { },
        release: function () { },
        downHandler: function (event) {
            if (event.keyCode === key.code) {
                if (key.isUp && key.press)
                    key.press();
                key.isDown = true;
                key.isUp = false;
            }
        },
        upHandler: function (event) {
            if (event.keyCode === key.code) {
                if (key.isDown && key.release) {
                    key.release();
                }
                key.isDown = false;
                key.isUp = true;
            }
        }
    };
    window.addEventListener('keydown', key.downHandler.bind(key), false);
    window.addEventListener('keyup', key.upHandler.bind(key), false);
    return key;
}
exports.keyboard = keyboard;
//# sourceMappingURL=keyboard.js.map