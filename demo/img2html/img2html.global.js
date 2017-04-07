(function () {
var Imgtohtml = function Imgtohtml(elm, renderElm, step, byte) {
	this.elm = elm;
	this.renderElm = renderElm;
	this.step = step;
	this.byte = byte;
	this.canvas = document.createElement('canvas');
	this.ctx = this.canvas.getContext('2d');
	this.imgData = [];
	this.imgPixData = [];

	this.getImgSize();
};

Imgtohtml.prototype.getImgSize = function getImgSize () {
	this.imgData = {
		width: this.elm.width,
		height: this.elm.height,
	};

	this.render();
};

Imgtohtml.prototype.getImgData = function getImgData () {
	var imgPixData = this.ctx.getImageData(0, 0, this.imgData.width, this.imgData.height).data;
	this.imgPixData = Array.from(imgPixData);
};

Imgtohtml.prototype.getChunkedImageData = function getChunkedImageData () {
	var perChunk = 4;
	var pixChunk = 2;

        var chunked = this.imgPixData.reduce(function (ar, it, i) {
        // if(pixChunk < 0) 
            var ix = Math.floor(i / perChunk);
            if (!ar[ix]) {
                ar[ix] = [];
            }
            ar[ix].push(it);
            return ar
        }, []);


        this.imgPixData = chunked;
};

Imgtohtml.prototype.getStepImageData = function getStepImageData () {
	var data = [],
		imgPixData = this.imgPixData,
		width = this.imgData.width,
		height = this.imgData.height,
		len = imgPixData.length,
		step = this.step,
		j = 1,
		r = 0,
		g = 0,
		b = 0;

	for(var i = 0; i < len - width; i = i + step) {
		if(i >= j * width){
			i = (j + step - 1) * width;
			j = j + step;
		}
		if(i >= Math.floor(height / step) * width * step) { break; }
			
		for(var m = 0; m < step; m++){
			r +=  imgPixData[i + m][0];
			g +=  imgPixData[i + m][1];
			b +=  imgPixData[i + m][2];
			for(var n = 1; n < step; n++){
				r +=  imgPixData[i + n*width + m][0];
				g +=  imgPixData[i + n*width + m][1];
				b +=  imgPixData[i + n*width + m][2];
			}
		}
		r = Math.floor(r / (step * step));
		g = Math.floor(g / (step * step));
		b = Math.floor(b / (step * step));
		data.push([r, g, b]);
			

	}
	this.imgPixData = data;

};

Imgtohtml.prototype.render = function render () {
		var this$1 = this;

	this.canvas.width = this.imgData.width;
	this.canvas.height = this.imgData.height;
	this.ctx.drawImage(this.elm, 0, 0, this.imgData.width, this.imgData.height);

	this.getImgData();
	this.getChunkedImageData();
	this.step != 1 && this.getStepImageData();

	var htmlData = "";
	var count = 0;
	var i = 0;

	this.imgPixData.forEach(function (item) {
		count ++;
		i++;
		htmlData += "<span style=\"font-size: 1px; color: rgb(" + (item[0]) + "," + (item[1]) + "," + (item[2]) + ");\">" + (this$1.byte) + "</span>";
		if(count >= this$1.imgData.width / this$1.step){
			htmlData += "<br>";
			count = 0;
		}
	});

	this.renderElm.innerHTML = htmlData;


};

function img2html(elm, renderElm, step, byte) {
	if ( step === void 0 ) step = 2;
	if ( byte === void 0 ) byte = '微';

	var img2html = new Imgtohtml(elm, renderElm, step, byte);
}

// function img2html(elm, renderElm, step = 2, byte = '微') {
// 	let img2html = new Imgtohtml(elm, renderElm, step, byte);
// }
window.addEventListener('load', function() {
    img2html(document.querySelector('.covert-img'), document.querySelector('.covert-html'), 2, "微");
});

}());
//# sourceMappingURL=img2html.global.js.map
