var through = require('through2');
var request = require('request');
var path = require('path');
var gutil = require('gulp-util');
var needle = require('needle');
var fs = require('fs');

function imageisux (argument) {
	var stream = through.obj(function(file,encoding,callback){
    	if (file.isNull()) {
              this.push(file);
              return callback();
            }

        if (file.isBuffer()) {
            var file_path = file.path;
            var file_str_ary = file.path.split('.');
            var file_type = file_str_ary[file_str_ary.length-1];

            // 支持jpg,png,gif
            if(file_type=='png'||file_type=='jpg'||file_type=='jpeg'||file_type=='gif'){
                var data = {
                    fileSelect: { file: file_path, content_type: 'image/'+file_type },
                    webp:true
                };

                imagemin(data,function(data){
                    stream.push(data);
                });
            }

        }

        if (file.isStream()) {
          throw PluginError(PLUGIN_NAME, "Stream is not supported");
          return callback();
        }

        callback();
	});

	return stream;
}

function imagemin(data, cb) {
    var options = {
      headers: {
      
      }
    }

    needle.post('http://image.isux.us/index.php/preview/upload_file', data, {multipart:true}, function(err, resp ,body) {
        if(err){
            console.error('send post error:' + err);
        }else{
            // console.log(body);
            // cb(body);
            var str = '({'+body.split('{')[1]+')';
            var json_str = eval(str);
            var output = json_str.output;
            var output_png = json_str.output_png;
            var output_webp = json_str.output_webp;
            var size = json_str.size;

            needle.get(output,function(err, resp, body){

                console.log(body);
                cb(body)
            });
        }
    });
};

module.exports = imageisux;