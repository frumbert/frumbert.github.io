const App = {
    zip: undefined,
    filename: undefined,
    templateName: "src.zip" // matching output of compile.sh
};

function upload(event) {
    // if a file was uploaded, load it into memory (doesn't transfer to any server)
    if (event.target.files.length) {
        App.filename = event.target.files[0].name;
        var reader = new FileReader();
        reader.onload = function (e) {
            process(e.target.result);
        }
        reader.readAsArrayBuffer(event.target.files[0]);
    }
}

function process(ab) {

    // process is asynchronous 
    new Promise(function(finalResolve, finalReject) {
        new JSZip.external.Promise(function h5p_export_load_template(innerResolve, innerReject) {
            // load the source zip file
            JSZipUtils.getBinaryContent(location.origin + location.pathname + App.templateName, function(err, data) {
                if (err) {
                    innerReject(err);
                } else {
                    innerResolve(data);
                }
            });
        }).then(function h5p_export_load_zip(bin) {
            // load and decompress the source zip in memory
            return zip.loadAsync(bin);

        }).then(function h5p_export_read_index(h5pTemplate) {
            // load the index.html file as a string from the source zip
            return zip.file("index.html").async("string");

        }).then(function h5p_export_modify_index(content) {
            // put the name of the file into the index as its page title
            var html = content.split('{{name}}').join(App.filename);
            return Promise.resolve(html);

        }).then(function h5p_export_store_index(html) {
            // store the modified index file back into the zip object
            zip.file("index.html", html);
            return Promise.resolve();

        }).then(function h5p_export_load_content() {
            // load the h5p package (it's a zip file) into the zip object in memory
            return zip.loadAsync(ab);

        }).then(function h5p_export_resolve(result) {
            // finish the promise chain
            finalResolve();

        }).catch(function h5p_export_catch(message) {
            // catch and report any errors
            console.trace();
            finalReject(message);

        });
    })
    .then(download)
    .catch(function h5p_export_error(message) {
        console.warn(message);
        alert("An error occurred processing the file; see the console for details.");
    });

}

function download(package) {
    // compress the zip file
	zip.generateAsync({type:"blob"})
	.then(function (blob) {
        // tell the browser to download the file
	    saveAs(blob, App.filename + "-standalone.zip");
	});

}

function main() {
    // set up a new zip object and bind the upload action
    zip = new JSZip();
    document.querySelector('input[type="file"]').addEventListener('change', upload);
}

// start
document.addEventListener('DOMContentLoaded', main);
