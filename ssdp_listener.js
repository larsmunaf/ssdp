const udp = require('dgram');
const ip = require('ip');
var multicastAddress = '239.255.255.250';
var multicastPort = '1900';

var mySSDPServiceType = 'ST: fridge';

var ssdpListener = udp.createSocket('udp4');

function listen(port, host) {
    ssdpListener.bind(multicastPort, function () {
        ssdpListener.setBroadcast(true);
        ssdpListener.setMulticastTTL(1);
        ssdpListener.addMembership(multicastAddress); // only membership neeeded
    });

    ssdpListener.on('error', (res) => {
        console.error(res);
    });

    ssdpListener.on('listening', (res) => {
        console.log('listening...');
    });

    ssdpListener.on('message', (msg, rinfo) => {

        console.log('packet from: ' + rinfo.address + ':' + rinfo.port);
        console.log(msg.toLocaleString());

        // only respond to a restricted area of services and not the service itself on my device
        if ((msg.toLocaleString().trim().indexOf(mySSDPServiceType.trim())) == -1) {
            console.log('dont respond because we dont belong to the desired service type...');
        }

        else if (ip.address() == rinfo.address) {
            console.log('ignore message because it was sent by us...');
        }

        else {
            respond(rinfo.address, rinfo.port);
            console.log('response sent...');
        }
    });
}

function respond(remoteAddress, remotePort) {
    var responseHeader = Buffer.from(
        'HTTP/1.1 200 OK\n' +
        'S: uuid:anything\n' +
        'Ext:\n' +
        'Cache-Control: no-cache="Ext", max-age = 5000\n' +
        'ST: fridge' + // service type
        'USN: uuid:fridge1\n' + // unique service name, identifies particular instances of a serice type, eg: fridge 1 + fridge 2
        'AL: <blender:ixl><http://foo/bar>\n' + 
        '\n'
    );

    ssdpListener.send(responseHeader, remotePort, remoteAddress);
}

listen(multicastPort, multicastAddress);
