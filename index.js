var through = require('through2');
var request = require('request');
var gutil = require('gulp-util');
var needle = require('needle');
var path = require('path');
var fs = require('fs');

function imageisux (argument) {
	var stream = through.obj(function(file,encoding,callback){
        var _that = this;
    	if (file.isNull()) {
            this.push(file);
            return callback();
        }

        if (file.isStream()) {
            throw PluginError(PLUGIN_NAME, "Stream is not supported");
            return callback();
        }

        if (file.isBuffer()) {
            var file_path = file.path;
            var file_dirname = path.dirname(file.path);
            var file_name = path.basename(file.path);
            var file_type = path.extname(file.path);
            file_type = file_type.slice(1,file_type.length);

            // surport jpg,png,gif
            if(file_type=='png'||file_type=='jpg'||file_type=='jpeg'||file_type=='gif'){
                var data = {
                    fileSelect: { file: file_path, content_type: 'image/'+file_type },
                    webp:true
                };

                needle.post('http://image.isux.us/index.php/preview/upload_file', data, {multipart:true}, function(err, resp ,body) {
                    if(err){
                        console.error('send post error:' + err);
                    }else{
                        console.log('photo receive...');
                        if(body.indexOf('{')!==-1){
                            // turn the data to json
                            var str = '({'+body.split('{')[1]+')';
                            var json_str = eval(str);

                            // 得到输出的图片
                            var output = json_str.output;
                            var output_png = json_str.output_png;
                            var output_webp = json_str.output_webp;
                            var size = json_str.size;

                            /*
                            * all the images return
                            * type=1：origin
                            * type=2：png
                            * type=3：webp
                            */
                            var output_ary = new Array();
                            output_ary.push({'type':1,'url':output});
                            if(output_png!==undefined){
                                output_ary.push({'type':2,'url':output_png});
                            }
                            if(output_webp!==undefined){
                                output_ary.push({'type':3,'url':output_webp});
                            }

                            var DEST_DIR = file_dirname+"/dest";
                            var FILE_CONTENT = file_name.split('.');
                            var FILENAME = FILE_CONTENT[0];
                            var FILETYPE = FILE_CONTENT[1];

                            // make dir
                            fs.exists(DEST_DIR,function(exists){
                                if(!exists){
                                    fs.mkdirSync(DEST_DIR,0777);
                                }
                            });
                            
                            // download the image from ZHITU
                            for(var i = 0; i < output_ary.length; i++){
                                (function(){
                                    var PREFIX = "";
                                    var TYPE = FILETYPE;
                                    switch(output_ary[i].type){
                                        case 1: PREFIX = "";TYPE = '.'+FILETYPE;break;
                                        case 2: PREFIX = "png_";TYPE = ".png";break;
                                        case 3: PREFIX = "webp_";TYPE = ".webp";break;
                                        default:PREFIX="";break;
                                    }
                                    
                                    needle.get(output_ary[i].url, function(err, resp, body) {
                                        if(body) {
                                            var fd = DEST_DIR + "/" + PREFIX + FILENAME + TYPE;
                                            fs.writeFile(fd, body, function(err, data){
                                                if (err) {
                                                  gutil.log('[error] :   ', err);
                                                }
                                            });
                                        } else {
                                            gutil.log('[error] : image does not exist!');
                                        }
                                    });
                                })(i);
                            }
                        }
                        else{
                            gutil.log('[error] : result can not be empty!');
                        }
                    }
                });
            }
        }
        _that.push(file);
        callback();
	});

	return stream;
}

module.exports = imageisux;