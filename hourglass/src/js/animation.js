
let myEle = function (left, top, width, height) {
    if (typeof left === String) {
        left = parseInt(left.substring(0, left.length - 2));
        top = parseInt(top.substring(0, top.length - 2));
        width = parseInt(width.substring(0, width.length - 2));
        height = parseInt(height.substring(0, height.length - 2));
    }

    this.style = {
        "left": left,
        "top": top,
        "width": width,
        "height": height
    }

};

myEle.prototype.getStyle = function(){
    let outputStyle = JSON.parse(JSON.stringify(this.style));
    outputStyle.left += "px";
    outputStyle.top += "px";
    outputStyle.width += "px";
    outputStyle.height += "px";
    return outputStyle
};

myEle.prototype.styleMoveAndScaleFrom = function (left, top, width, height, duration=1) {
    let result = {};
    result.x = parseInt(left) - this.style.left;
    result.y = parseInt(top) - this.style.top;
    result.scaleY = parseInt(height) / this.style.height;
    // result.scaleX = parseInt(width) / this.style.width;
    result.opacity = 1;
    result.duration = duration;
    result.transformOrigin = 'left top';
    return result
};

myEle.prototype.styleMoveFrom = function (left, top, duration=1) {
    let result = {};
    result.x = parseInt(left) - this.style.left;
    result.y = parseInt(top) - this.style.top;
    result.opacity = 1;

    result.duration = duration;
    return result
};

export default myEle;