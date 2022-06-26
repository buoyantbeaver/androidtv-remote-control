const express = require('express')
const tv = require('androidtv-remote')
const AndroidRemote = tv.AndroidRemote;
const RemoteKeyCode = tv.RemoteKeyCode;
const RemoteDirection = tv.RemoteDirection;
const app = express()
const port = 3000

function startRemote(device) {
	
	let devices = { "dagul":"192.168.0.22", "bentong":"192.168.0.28" };
	let host = devices[device];
	let options = {
	    pairing_port : 6467,
	    remote_port : 6466,
	    name : 'androidtv-remote',
	}

	let androidRemote = new AndroidRemote(host, options)

	androidRemote.on('secret', () => {
	    app.get('/connect/:code', async (req, res) => {
	        androidRemote.sendCode(req.params.code);
	        res.send("Connected");
		})
	});

	androidRemote.on('powered', (powered) => {
	    console.debug("Powered : " + powered)
	});

	androidRemote.on('volume', (volume) => {
	    console.debug("Volume : " + volume.level + '/' + volume.maximum + " | Muted : " + volume.muted);
	});

	androidRemote.on('current_app', (current_app) => {
	    console.debug("Current App : " + current_app);
	});

	androidRemote.on('error', (error) => {
	    //console.error("Error : " + error);
	});

	androidRemote.on('unpaired', () => {
	    console.error("Unpaired");
	});

	androidRemote.on('ready', async () => {
	    await new Promise(resolve => setTimeout(resolve, 2000));

	    let cert = androidRemote.getCertificate();

		app.get('/button/:id', (req, res) => {
			androidRemote.sendKey(parseInt(req.params.id), RemoteDirection.SHORT);
			res.send(req.params.id);
		})
	});

	let started = androidRemote.start();
};


app.get('/device/:device', (req, res) => {
	startRemote(req.params.device);
	res.send("Connection initiated.");
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})