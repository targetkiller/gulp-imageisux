var through = require('through2');
var request = require('request');
var gutil = require('gulp-util');
var needle = require('needle');
var path = require('path');
var fs = require('fs');

function imageisux (abspath,enableWebp) {
    var stream = through.obj(function(file,encoding,callback){
        abspath = abspath || "";
        enableWebp = enableWebp || false;
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
                    }
                    else{
                        console.log('photo receive...');
                        if(body.indexOf('{')>-1){
                            // turn the data to json
                            var str = '({'+body.split('{')[1]+')';
                            try{
                                var json_str = eval(str);

                                // get the url of image
                                var output = json_str.output;
                                var output_webp = json_str.output_webp;

                                // var output_png = json_str.output_png;
                                // var size = json_str.size;

                                /*
                                * all the images return
                                * type=1：origin
                                * type=2：webp
                                */
                                var output_ary = new Array();
                                // abspath is exist, so just give the webp.
                                if(abspath!==""&&enableWebp===true){
                                    if(output_webp!==undefined){
                                        output_ary.push({'type':2,'url':output_webp});
                                    }
                                    else{
                                        gutil.log('[error]','this webp is not exist!'+file_name);
                                    }
                                }
                                // abspath is exist and enableWebp is false,so give the origin.
                                else if(abspath!==""&&enableWebp===false){
                                    if(output!==undefined){
                                        output_ary.push({'type':1,'url':output});
                                    }
                                    else{ 
                                        gutil.log('[error]','this origin is not exist!'+file_name);
                                    }
                                }
                                // abspath is not exist, so init /dest/ and /webp/ and give the origin and webp types.
                                else if(abspath===""){
                                    if(output!==undefined){
                                        output_ary.push({'type':1,'url':output});
                                    }
                                    if(output_webp!==undefined){
                                        output_ary.push({'type':2,'url':output_webp});
                                    }
                                }

                                // console.log(output_ary);

                                var FILE_CONTENT = file_name.split('.');
                                var FILENAME = FILE_CONTENT[0];
                                var FILETYPE = FILE_CONTENT[1];

                                // download the image from server http://image.isux.us
                                for(var i = 0; i < output_ary.length; i++){
                                    (function(){
                                        var PREFIX = "";
                                        var APPENDFIX = "."+FILETYPE;
                                        var OUTPUT_TYPE = output_ary[i].type;
                                        switch(OUTPUT_TYPE){
                                            case 1: PREFIX = "";APPENDFIX = '.'+FILETYPE;break;
                                            case 2: PREFIX = "";APPENDFIX = ".webp";break;
                                            default:PREFIX="";break;
                                        }
                                        
                                        needle.get(output_ary[i].url, function(err, resp, body) {
                                            if(body) {
                                                if(abspath){
                                                    var DEST_DIR = file_dirname + "/" + abspath + "/";
                                                }
                                                else if(OUTPUT_TYPE==1){
                                                    var DEST_DIR = file_dirname + "/dest/";
                                                }
                                                else if(OUTPUT_TYPE==2){
                                                    var DEST_DIR = file_dirname + "/webp/";
                                                }

                                                var fd = DEST_DIR + PREFIX + FILENAME + APPENDFIX;

                                                // make dir
                                                fs.exists(DEST_DIR,function(exists){
                                                    if(!exists){
                                                        fs.mkdirSync(DEST_DIR);
                                                    }
                                                });

                                                fs.writeFile(fd, body, function(err, data){
                                                    if (err) {
                                                      gutil.log('[error] :   ', err);
                                                    }
                                                });
                                            } else {
                                                gutil.log('[error]','return data is not exist!'+FILENAME);
                                            }
                                        });
                                    })(i);
                                }
                            }
                            catch(err){
                                gutil.log('[error]',err+" filename:"+ file_name);
                            }

                        }
                        else{
                            gutil.log('[error]','result can not be empty!'+file_name);
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