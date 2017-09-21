let request = require('request');
let axios = require('axios');
let fs = require('fs');
let _ = require('lodash');
const SqliteToJson = require('sqlite-to-json');
const sqlite3 = require('sqlite3');
let SZIP = require('node-stream-zip'); //use this

//the urls are hard coded for simplicity's sake
let man = 'https://www.bungie.net';
// let en = '/common/destiny2_content/sqlite/en/world_sql_content_281de46e3cd73e5747595936fd2dffa9.content'

//this is the entry name for the english manifest
//contained in the zip file that we need to extract
// let en_path = 'world_sql_content_281de46e3cd73e5747595936fd2dffa9.content';



const bungieRequest = axios.create({
	baseURL: 'https://www.bungie.net/Platform',
	headers: {
		'X-API-Key': '43e0503b64df4ebc98f1c986e73d92ac'
	},
	withCredentials: true
});


//makes a request to the destiny manifest endpoint and 
//extracts it to the current directory as 'manifest.content'
//@manifest.zip: this is the compressed manifest downloaded from the destiny man endpoint
//@manifest.content: uncompressed manifest sqlite file which can be queried
function getManifest(manifestVersion){

	let outStream = fs.createWriteStream('manifest.zip');

	return bungieRequest.get('/Destiny2/Manifest').then(({data}) => {
		let en = data.Response.mobileWorldContentPaths.en;
		let en_path = _.last(en.split('/'));
		let manifestVersion = data.Response.version;

		if (!data.Response.version) throw new Error('No Manifest Version');

		const newManifestVersion = `export const manifestVersion = '${manifestVersion}'`;

		return fs.writeFile('./src/manifestVersion.js', newManifestVersion, 'utf8', (err) => {
			if (err) throw err;
			console.log('Maniest Version Updated')
			let options = {
				url: man + en,
				port: 443,
				method: 'GET',
				encoding: null,
				headers: {
					'Content-Type': 'application/json',
					'X-API-Key': '43e0503b64df4ebc98f1c986e73d92ac'
				}
			};
	
			return request(options).on('response', (res, body) => {
				console.log(res.statusCode === 200 && 'Latest Manifest Fetched');
			}).pipe(outStream).on('finish', () => {
				let zip = new SZIP({
					file: './manifest.zip',
					storeEntries: true
				});
		
				zip.on('ready', function() {
					zip.extract(en_path, './manifest.content', function(err,count){
						if (err) console.log(err);
						
						const exporter = new SqliteToJson({
							client: new sqlite3.Database('./manifest.content')
						});
						
						exporter.tables(function (err, tables) {
							tables.forEach((table) => {
								exporter.save(table, `./public/manifest/${manifestVersion}/${table}.json`,(err) => console.error)
							});
						});
					});
				});
			});
		});
	});
}

return getManifest();

