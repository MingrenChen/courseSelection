import html2canvas from "html2canvas";
import $ from "jquery";



let Snap = function(element){
    html2canvas(element).then(canvas => {
        //capture all div data as image
        let ctx = canvas.getContext("2d");
        let imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        return imageData
    });
};


export default Snap