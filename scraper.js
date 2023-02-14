const jsdom = require("jsdom");
const { JSDOM } = jsdom;
const fs = require('fs');
const https = require('https');
const seedFile = "https://ronnieroyston.com/sitemap.txt";

(async () => {
	try {
		//first let's read sitemap.txt and fetch all the sites in there to scrape
		let sitemapCall = await apiCall(seedFile);
		let urlArray = sitemapCall.split(/\r?\n/);
		let callArray = [];
		let index = [];
		for (let i = 0; i < urlArray.length; i++) {
			callArray.push(apiCall(urlArray[i]));
		}
		let responses = await Promise.allSettled(callArray);
		for (let i = 0; i < responses.length; i++) {
			if(responses[i].status === "fulfilled"){
			let document = new JSDOM(responses[i].value).window.document;
			//OK so start creating your JSON file for Lunr.
			let doc = {};
				if(document.title && document.querySelector('meta[name="description"]')){
					doc.link = urlArray[i];
					doc.title = document.title;
					doc.description = document.querySelector('meta[name="description"]').content;
					doc.body = document.body.textContent;
					index.push(doc);						
				}
			}
		}
		let serializedIndex = JSON.stringify(index, null, 2);
		fs.writeFileSync("index.json", serializedIndex);
	} catch (e) {
		console.error(e);
	} finally {
		console.log('Done.');
	}
})();

function apiCall(url){
	return new Promise(function (resolve, reject) {
    var data = '';
    https.get(url, res => {
        res.on('data', function (chunk){ data += chunk }) 
        res.on('end', function () {
           resolve(data);
        })
    }).on('error', function (e) {
      reject(e);
    });
});
}