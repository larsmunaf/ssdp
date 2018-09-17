/* TODO
advertise each root device 3 times
advertise each embedded service 2 times
normal services only once
!! use random intervals to minimize network traffic
*/

'use strict'

const udp = require('dgram'); // UDP is required instead of HTTP methods via TCP
var client;

var multicastAddress = '239.255.255.250';
var multicastPort = 1900;
var expirationTime = 1800; // integer in seconds, must be greater or equal to 1800s

/* advertise a client */
function alive() {
    client = udp.createSocket('udp4');
    client.bind();
    var notifyHeaderAlive = Buffer.from(
        'NOTIFY * HTTP/1.1\n' +
        'Host:' + multicastAddress + ':' + multicastPort + '\n' +
        'NT:user/bob\n' +
        'NTS:ssdp:alive\n' +
        'USN:someunique:idscheme3\n' +
        'AL:<bob:ixl><http://foo/bar>\n' +
        'Cache-Control:max-age=' + expirationTime
    );

    client.on('listening', (res) => {

    })

    client.send(notifyHeaderAlive, multicastPort, multicastAddress, (err, res) => {
        if (err) {
            console.log('error: ' + err);
        }

        else {
            console.log('success: ' + res);
        }

        client.close();
    });
}

/* cease a client's presence */
function ssdpByebye() {
    client = udp.createSocket('udp4');
    client.bind();

    var notifyHeaderByebye = Buffer.from(
        'NOTIFY * HTTP/1.1\n' +
        'Host:' + multicastAddress + ':' + multicastPort + '\n' +
        'NT:user/bob\n' +
        'NTS:ssdp:byebye\n' +
        'USN:someunique:idscheme3\n'
    );

    client.send(notifyHeaderByebye, multicastPort, multicastAddress, (err, res) => {
        if (err) {
            console.log('error: ' + err);
        }

        else {
            console.log('success: ' + res);
        }

        client.close();
    });
}

/* do a search */
function search() {
    client = udp.createSocket('udp4');
    client.bind();

    client.on('message', (res) => {
        console.log(res.toLocaleString());
    });

    var searchHeader = Buffer.from(
        'M-SEARCH * HTTP/1.1\r\n' +
        'HOST:' + multicastAddress + ':' + multicastPort + '\r\n' +
        'MAN: \"ssdp:discover\"\r\n' +
        'MX: 5\r\n' +
        'ST: fridge\r\n' +
        '\r\n' // blank line is necessary
    );

    client.send(searchHeader, 0, searchHeader.length, multicastPort, multicastAddress, (err, res) => {
        if (err) {
            console.log('error: ' + err);
        }

        else {
            console.log('success: ' + res);
        }

        setTimeout(function () {
            client.close()
        }, 5000);
    });
}

search();