(function(e) {
    if ("object" == typeof exports && "undefined" != typeof module) module.exports = e();
    else if ("function" == typeof define && define.amd) define([], e);
    else {
        var t;
        t = "undefined" == typeof window ? "undefined" == typeof global ? "undefined" == typeof self ? this : self : global : window, t.WebTorrent = e()
    }
})(function() {
    var t = Math.abs,
        n = Math.pow,
        r = Math.floor,
        e = String.fromCharCode,
        o = Math.ceil,
        s = Math.max,
        d = Math.min,
        i;
    return function d(c, e, t) {
        function r(i, o) {
            if (!e[i]) {
                if (!c[i]) {
                    var s = "function" == typeof require && require;
                    if (!o && s) return s(i, !0);
                    if (n) return n(i, !0);
                    var a = new Error("Cannot find module '" + i + "'");
                    throw a.code = "MODULE_NOT_FOUND", a
                }
                var p = e[i] = {
                    exports: {}
                };
                c[i][0].call(p.exports, function(t) {
                    var e = c[i][1][t];
                    return r(e ? e : t)
                }, p, p.exports, d, c, e, t)
            }
            return e[i].exports
        }
        for (var n = "function" == typeof require && require, i = 0; i < t.length; i++) r(t[i]);
        return r
    }({
        1: [function(e, t) {
            function n(e, t) {
                i.Readable.call(this, t), this.destroyed = !1, this._torrent = e._torrent;
                var n = t && t.start || 0,
                    r = t && t.end && t.end < e.length ? t.end : e.length - 1,
                    o = e._torrent.pieceLength;
                this._startPiece = 0 | (n + e.offset) / o, this._endPiece = 0 | (r + e.offset) / o, this._piece = this._startPiece, this._offset = n + e.offset - this._startPiece * o, this._missing = r - n + 1, this._reading = !1, this._notifying = !1, this._criticalLength = d(0 | 1048576 / o, 2)
            }
            t.exports = n;
            var r = e("debug")("webtorrent:file-stream"),
                o = e("inherits"),
                i = e("readable-stream");
            o(n, i.Readable), n.prototype._read = function() {
                this._reading || (this._reading = !0, this._notify())
            }, n.prototype._notify = function() {
                var e = this;
                if (e._reading && 0 !== e._missing) {
                    if (!e._torrent.bitfield.get(e._piece)) return e._torrent.critical(e._piece, e._piece + e._criticalLength);
                    if (!e._notifying) {
                        e._notifying = !0;
                        var t = e._piece;
                        e._torrent.store.get(t, function(n, o) {
                            return e._notifying = !1, e.destroyed ? void 0 : n ? e._destroy(n) : void(r("read %s (length %s) (err %s)", t, o.length, n && n.message), e._offset && (o = o.slice(e._offset), e._offset = 0), e._missing < o.length && (o = o.slice(0, e._missing)), e._missing -= o.length, r("pushing buffer of length %s", o.length), e._reading = !1, e.push(o), 0 === e._missing && e.push(null))
                        }), e._piece += 1
                    }
                }
            }, n.prototype.destroy = function(e) {
                this._destroy(null, e)
            }, n.prototype._destroy = function(e, t) {
                this.destroyed || (this.destroyed = !0, !this._torrent.destroyed && this._torrent.deselect(this._startPiece, this._endPiece, !0), e && this.emit("error", e), this.emit("close"), t && t())
            }
        }, {
            debug: 29,
            inherits: 40,
            "readable-stream": 82
        }],
        2: [function(e, t) {
            (function(n) {
                function r(e, t) {
                    i.call(this), this._torrent = e, this._destroyed = !1, this.name = t.name, this.path = t.path, this.length = t.length, this.offset = t.offset, this.done = !1;
                    var n = t.offset,
                        r = n + t.length - 1;
                    this._startPiece = 0 | n / this._torrent.pieceLength, this._endPiece = 0 | r / this._torrent.pieceLength, 0 === this.length && (this.done = !0, this.emit("done"))
                }
                t.exports = r;
                var o = e("end-of-stream"),
                    i = e("events").EventEmitter,
                    s = e("./file-stream"),
                    d = e("inherits"),
                    a = e("path"),
                    c = e("render-media"),
                    p = e("readable-stream"),
                    l = e("stream-to-blob"),
                    u = e("stream-to-blob-url"),
                    f = e("stream-with-known-length-to-buffer");
                d(r, i), Object.defineProperty(r.prototype, "downloaded", {
                    get: function() {
                        if (!this._torrent.bitfield) return 0;
                        for (var e = 0, t = this._startPiece; t <= this._endPiece; ++t)
                            if (this._torrent.bitfield.get(t)) e += this._torrent.pieceLength;
                            else {
                                var n = this._torrent.pieces[t];
                                e += n.length - n.missing
                            }
                        return e
                    }
                }), Object.defineProperty(r.prototype, "progress", {
                    get: function() {
                        return this.length ? this.downloaded / this.length : 0
                    }
                }), r.prototype.select = function(e) {
                    0 === this.length || this._torrent.select(this._startPiece, this._endPiece, e)
                }, r.prototype.deselect = function() {
                    0 === this.length || this._torrent.deselect(this._startPiece, this._endPiece, !1)
                }, r.prototype.createReadStream = function(e) {
                    var t = this;
                    if (0 === this.length) {
                        var r = new p.PassThrough;
                        return n.nextTick(function() {
                            r.end()
                        }), r
                    }
                    var i = new s(t, e);
                    return t._torrent.select(i._startPiece, i._endPiece, !0, function() {
                        i._notify()
                    }), o(i, function() {
                        t._destroyed || !t._torrent.destroyed && t._torrent.deselect(i._startPiece, i._endPiece, !0)
                    }), i
                }, r.prototype.getBuffer = function(e) {
                    f(this.createReadStream(), this.length, e)
                }, r.prototype.getBlob = function(e) {
                    if ("undefined" == typeof window) throw new Error("browser-only method");
                    l(this.createReadStream(), this._getMimeType(), e)
                }, r.prototype.getBlobURL = function(e) {
                    if ("undefined" == typeof window) throw new Error("browser-only method");
                    u(this.createReadStream(), this._getMimeType(), e)
                }, r.prototype.appendTo = function(e, t, n) {
                    if ("undefined" == typeof window) throw new Error("browser-only method");
                    c.append(this, e, t, n)
                }, r.prototype.renderTo = function(e, t, n) {
                    if ("undefined" == typeof window) throw new Error("browser-only method");
                    c.render(this, e, t, n)
                }, r.prototype._getMimeType = function() {
                    return c.mime[a.extname(this.name).toLowerCase()]
                }, r.prototype._destroy = function() {
                    this._destroyed = !0, this._torrent = null
                }
            }).call(this, e("_process"))
        }, {
            "./file-stream": 1,
            _process: 65,
            "end-of-stream": 32,
            events: 33,
            inherits: 40,
            path: 62,
            "readable-stream": 82,
            "render-media": 83,
            "stream-to-blob": 100,
            "stream-to-blob-url": 99,
            "stream-with-known-length-to-buffer": 101
        }],
        3: [function(e, t, n) {
            function r(e, t) {
                var n = this;
                n.id = e, n.type = t, s("new Peer %s", e), n.addr = null, n.conn = null, n.swarm = null, n.wire = null, n.connected = !1, n.destroyed = !1, n.timeout = null, n.retries = 0, n.sentHandshake = !1
            }

            function o() {}
            var i = e("unordered-array-remove"),
                s = e("debug")("webtorrent:peer"),
                d = e("bittorrent-protocol"),
                a = e("./webconn");
            n.createWebRTCPeer = function(e, t) {
                var n = new r(e.id, "webrtc");
                return n.conn = e, n.swarm = t, n.conn.connected ? n.onConnect() : (n.conn.once("connect", function() {
                    n.onConnect()
                }), n.conn.once("error", function(e) {
                    n.destroy(e)
                }), n.startConnectTimeout()), n
            }, n.createTCPIncomingPeer = function(e) {
                var t = e.remoteAddress + ":" + e.remotePort,
                    n = new r(t, "tcpIncoming");
                return n.conn = e, n.addr = t, n.onConnect(), n
            }, n.createTCPOutgoingPeer = function(e, t) {
                var n = new r(e, "tcpOutgoing");
                return n.addr = e, n.swarm = t, n
            }, n.createWebSeedPeer = function(e, t) {
                var n = new r(e, "webSeed");
                return n.swarm = t, n.conn = new a(e, t), n.onConnect(), n
            }, r.prototype.onConnect = function() {
                var e = this;
                if (!e.destroyed) {
                    e.connected = !0, s("Peer %s connected", e.id), clearTimeout(e.connectTimeout);
                    var t = e.conn;
                    t.once("end", function() {
                        e.destroy()
                    }), t.once("close", function() {
                        e.destroy()
                    }), t.once("finish", function() {
                        e.destroy()
                    }), t.once("error", function(t) {
                        e.destroy(t)
                    });
                    var n = e.wire = new d;
                    n.type = e.type, n.once("end", function() {
                        e.destroy()
                    }), n.once("close", function() {
                        e.destroy()
                    }), n.once("finish", function() {
                        e.destroy()
                    }), n.once("error", function(t) {
                        e.destroy(t)
                    }), n.once("handshake", function(t, n) {
                        e.onHandshake(t, n)
                    }), e.startHandshakeTimeout(), t.pipe(n).pipe(t), e.swarm && !e.sentHandshake && e.handshake()
                }
            }, r.prototype.onHandshake = function(e, t) {
                var n = this;
                if (n.swarm && !n.destroyed) {
                    if (n.swarm.destroyed) return n.destroy(new Error("swarm already destroyed"));
                    if (e !== n.swarm.infoHash) return n.destroy(new Error("unexpected handshake info hash for this swarm"));
                    if (t === n.swarm.peerId) return n.destroy(new Error("refusing to connect to ourselves"));
                    s("Peer %s got handshake %s", n.id, e), clearTimeout(n.handshakeTimeout), n.retries = 0;
                    var r = n.addr;
                    !r && n.conn.remoteAddress && (r = n.conn.remoteAddress + ":" + n.conn.remotePort), n.swarm._onWire(n.wire, r), n.swarm && !n.swarm.destroyed && (n.sentHandshake || n.handshake())
                }
            }, r.prototype.handshake = function() {
                var e = this,
                    t = {
                        dht: !e.swarm.private && !!e.swarm.client.dht
                    };
                e.wire.handshake(e.swarm.infoHash, e.swarm.client.peerId, t), e.sentHandshake = !0
            }, r.prototype.startConnectTimeout = function() {
                var e = this;
                clearTimeout(e.connectTimeout), e.connectTimeout = setTimeout(function() {
                    e.destroy(new Error("connect timeout"))
                }, "webrtc" === e.type ? 25000 : 5e3), e.connectTimeout.unref && e.connectTimeout.unref()
            }, r.prototype.startHandshakeTimeout = function() {
                var e = this;
                clearTimeout(e.handshakeTimeout), e.handshakeTimeout = setTimeout(function() {
                    e.destroy(new Error("handshake timeout"))
                }, 25000), e.handshakeTimeout.unref && e.handshakeTimeout.unref()
            }, r.prototype.destroy = function(e) {
                var t = this;
                if (!t.destroyed) {
                    t.destroyed = !0, t.connected = !1, s("destroy %s (error: %s)", t.id, e && (e.message || e)), clearTimeout(t.connectTimeout), clearTimeout(t.handshakeTimeout);
                    var n = t.swarm,
                        r = t.conn,
                        d = t.wire;
                    t.swarm = null, t.conn = null, t.wire = null, n && d && i(n.wires, n.wires.indexOf(d)), r && (r.on("error", o), r.destroy()), d && d.destroy(), n && n.removePeer(t.id)
                }
            }
        }, {
            "./webconn": 6,
            "bittorrent-protocol": 14,
            debug: 29,
            "unordered-array-remove": 111
        }],
        4: [function(e, t) {
            function n(e) {
                var t = this;
                t._torrent = e, t._numPieces = e.pieces.length, t._pieces = [], t._onWire = function(e) {
                    t.recalculate(), t._initWire(e)
                }, t._onWireHave = function(e) {
                    t._pieces[e] += 1
                }, t._onWireBitfield = function() {
                    t.recalculate()
                }, t._torrent.wires.forEach(function(e) {
                    t._initWire(e)
                }), t._torrent.on("wire", t._onWire), t.recalculate()
            }

            function r() {
                return !0
            }
            t.exports = n, n.prototype.getRarestPiece = function(e) {
                e || (e = r);
                for (var t = [], n = Infinity, o = 0; o < this._numPieces; ++o)
                    if (e(o)) {
                        var i = this._pieces[o];
                        i === n ? t.push(o) : i < n && (t = [o], n = i)
                    }
                return 0 < t.length ? t[0 | Math.random() * t.length] : -1
            }, n.prototype.destroy = function() {
                var e = this;
                e._torrent.removeListener("wire", e._onWire), e._torrent.wires.forEach(function(t) {
                    e._cleanupWireEvents(t)
                }), e._torrent = null, e._pieces = null, e._onWire = null, e._onWireHave = null, e._onWireBitfield = null
            }, n.prototype._initWire = function(e) {
                var t = this;
                e._onClose = function() {
                    t._cleanupWireEvents(e);
                    for (var n = 0; n < this._numPieces; ++n) t._pieces[n] -= e.peerPieces.get(n)
                }, e.on("have", t._onWireHave), e.on("bitfield", t._onWireBitfield), e.once("close", e._onClose)
            }, n.prototype.recalculate = function() {
                var e;
                for (e = 0; e < this._numPieces; ++e) this._pieces[e] = 0;
                var t = this._torrent.wires.length;
                for (e = 0; e < t; ++e)
                    for (var n = this._torrent.wires[e], r = 0; r < this._numPieces; ++r) this._pieces[r] += n.peerPieces.get(r)
            }, n.prototype._cleanupWireEvents = function(e) {
                e.removeListener("have", this._onWireHave), e.removeListener("bitfield", this._onWireBitfield), e._onClose && e.removeListener("close", e._onClose), e._onClose = null
            }
        }, {}],
        5: [function(e, t) {
            (function(n, r) {
                function i(e, t, n) {
                    _.call(this), this._debugId = "unknown infohash", this.client = t, this.announce = n.announce, this.urlList = n.urlList, this.path = n.path, this._store = n.store || k, this._getAnnounceOpts = n.getAnnounceOpts, this.strategy = n.strategy || "sequential", this.maxWebConns = n.maxWebConns || 4, this._rechokeNumSlots = !1 === n.uploads || 0 === n.uploads ? 0 : +n.uploads || 10, this._rechokeOptimisticWire = null, this._rechokeOptimisticTime = 0, this._rechokeIntervalId = null, this.ready = !1, this.destroyed = !1, this.paused = !1, this.done = !1, this.metadata = null, this.store = null, this.files = [], this.pieces = [], this._amInterested = !1, this._selections = [], this._critical = [], this.wires = [], this._queue = [], this._peers = {}, this._peersLength = 0, this.received = 0, this.uploaded = 0, this._downloadSpeed = H(), this._uploadSpeed = H(), this._servers = [], this._xsRequests = [], this._fileModtimes = n.fileModtimes, null !== e && this._onTorrentId(e), this._debug("new torrent")
                }

                function a(e, t) {
                    return 2 + o(t * e.downloadSpeed() / U.BLOCK_LENGTH)
                }

                function c(e, t, n) {
                    return 1 + o(t * e.downloadSpeed() / n)
                }

                function p(e) {
                    return 0 | Math.random() * e
                }

                function l() {}
                t.exports = i;
                var u = e("addr-to-ip-port"),
                    f = e("bitfield"),
                    h = e("chunk-store-stream/write"),
                    m = e("debug")("webtorrent:torrent"),
                    g = e("torrent-discovery"),
                    _ = e("events").EventEmitter,
                    y = e("xtend"),
                    b = e("xtend/mutable"),
                    w = e("fs"),
                    k = e("fs-chunk-store"),
                    x = e("simple-get"),
                    v = e("immediate-chunk-store"),
                    S = e("inherits"),
                    E = e("multistream"),
                    B = e("net"),
                    I = e("os"),
                    C = e("run-parallel"),
                    L = e("run-parallel-limit"),
                    T = e("parse-torrent"),
                    A = e("path"),
                    U = e("torrent-piece"),
                    R = e("pump"),
                    P = e("random-iterate"),
                    O = e("simple-sha1"),
                    H = e("speedometer"),
                    M = e("uniq"),
                    q = e("ut_metadata"),
                    j = e("ut_pex"),
                    N = e("./file"),
                    D = e("./peer"),
                    W = e("./rarity-map"),
                    z = e("./server"),
                    F = 5e3,
                    V = 3 * U.BLOCK_LENGTH,
                    G = 1,
                    K = 2,
                    X = [1000, 5000, 15000],
                    Y = e("../package.json").version,
                    $ = "WebTorrent/" + Y + " (https://webtorrent.io)",
                    Q;
                try {
                    Q = A.join(w.statSync("/tmp") && "/tmp", "webtorrent")
                } catch (e) {
                    Q = A.join("function" == typeof I.tmpdir ? I.tmpdir() : "/", "webtorrent")
                }
                S(i, _), Object.defineProperty(i.prototype, "timeRemaining", {
                    get: function() {
                        return this.done ? 0 : 0 === this.downloadSpeed ? Infinity : 1e3 * ((this.length - this.downloaded) / this.downloadSpeed)
                    }
                }), Object.defineProperty(i.prototype, "downloaded", {
                    get: function() {
                        if (!this.bitfield) return 0;
                        for (var e = 0, t = 0, n = this.pieces.length; t < n; ++t)
                            if (this.bitfield.get(t)) e += t === n - 1 ? this.lastPieceLength : this.pieceLength;
                            else {
                                var r = this.pieces[t];
                                e += r.length - r.missing
                            }
                        return e
                    }
                }), Object.defineProperty(i.prototype, "downloadSpeed", {
                    get: function() {
                        return this._downloadSpeed()
                    }
                }), Object.defineProperty(i.prototype, "uploadSpeed", {
                    get: function() {
                        return this._uploadSpeed()
                    }
                }), Object.defineProperty(i.prototype, "progress", {
                    get: function() {
                        return this.length ? this.downloaded / this.length : 0
                    }
                }), Object.defineProperty(i.prototype, "ratio", {
                    get: function() {
                        return this.uploaded / (this.received || 1)
                    }
                }), Object.defineProperty(i.prototype, "numPeers", {
                    get: function() {
                        return this.wires.length
                    }
                }), Object.defineProperty(i.prototype, "torrentFileBlobURL", {
                    get: function() {
                        if ("undefined" == typeof window) throw new Error("browser-only property");
                        return this.torrentFile ? URL.createObjectURL(new Blob([this.torrentFile], {
                            type: "application/x-bittorrent"
                        })) : null
                    }
                }), Object.defineProperty(i.prototype, "_numQueued", {
                    get: function() {
                        return this._queue.length + (this._peersLength - this._numConns)
                    }
                }), Object.defineProperty(i.prototype, "_numConns", {
                    get: function() {
                        var e = this,
                            t = 0;
                        for (var n in e._peers) e._peers[n].connected && (t += 1);
                        return t
                    }
                }), Object.defineProperty(i.prototype, "swarm", {
                    get: function() {
                        return console.warn("WebTorrent: `torrent.swarm` is deprecated. Use `torrent` directly instead."), this
                    }
                }), i.prototype._onTorrentId = function(e) {
                    var t = this;
                    if (!t.destroyed) {
                        var r;
                        try {
                            r = T(e)
                        } catch (e) {}
                        r ? (t.infoHash = r.infoHash, t._debugId = r.infoHash.toString("hex").substring(0, 7), n.nextTick(function() {
                            t.destroyed || t._onParsedTorrent(r)
                        })) : T.remote(e, function(e, n) {
                            return t.destroyed ? void 0 : e ? t._destroy(e) : void t._onParsedTorrent(n)
                        })
                    }
                }, i.prototype._onParsedTorrent = function(e) {
                    var t = this;
                    if (!t.destroyed) {
                        if (t._processParsedTorrent(e), !t.infoHash) return t._destroy(new Error("Malformed torrent data: No info hash"));
                        (t.path || (t.path = A.join(Q, t.infoHash)), t._rechokeIntervalId = setInterval(function() {
                            t._rechoke()
                        }, 1e4), t._rechokeIntervalId.unref && t._rechokeIntervalId.unref(), t.emit("_infoHash", t.infoHash), !t.destroyed) && (t.emit("infoHash", t.infoHash), t.destroyed || (t.client.listening ? t._onListening() : t.client.once("listening", function() {
                            t._onListening()
                        })))
                    }
                }, i.prototype._processParsedTorrent = function(e) {
                    this._debugId = e.infoHash.toString("hex").substring(0, 7), this.announce && (e.announce = e.announce.concat(this.announce)), this.client.tracker && r.WEBTORRENT_ANNOUNCE && !this.private && (e.announce = e.announce.concat(r.WEBTORRENT_ANNOUNCE)), this.urlList && (e.urlList = e.urlList.concat(this.urlList)), M(e.announce), M(e.urlList), b(this, e), this.magnetURI = T.toMagnetURI(e), this.torrentFile = T.toTorrentFile(e)
                }, i.prototype._onListening = function() {
                    function e(e) {
                        i._destroy(e)
                    }

                    function t(e) {
                        "string" == typeof e && i.done || i.addPeer(e)
                    }

                    function n() {
                        i.emit("trackerAnnounce"), 0 === i.numPeers && i.emit("noPeers", "tracker")
                    }

                    function r() {
                        i.emit("dhtAnnounce"), 0 === i.numPeers && i.emit("noPeers", "dht")
                    }

                    function o(e) {
                        i.emit("warning", e)
                    }
                    var i = this;
                    if (!(i.discovery || i.destroyed)) {
                        var d = i.client.tracker;
                        d && (d = y(i.client.tracker, {
                            getAnnounceOpts: function() {
                                var e = {
                                    uploaded: i.uploaded,
                                    downloaded: i.downloaded,
                                    left: s(i.length - i.downloaded, 0)
                                };
                                return i.client.tracker.getAnnounceOpts && b(e, i.client.tracker.getAnnounceOpts()), i._getAnnounceOpts && b(e, i._getAnnounceOpts()), e
                            }
                        })), i.discovery = new g({
                            infoHash: i.infoHash,
                            announce: i.announce,
                            peerId: i.client.peerId,
                            dht: !i.private && i.client.dht,
                            tracker: d,
                            port: i.client.torrentPort,
                            userAgent: $
                        }), i.discovery.on("error", e), i.discovery.on("peer", t), i.discovery.on("trackerAnnounce", n), i.discovery.on("dhtAnnounce", r), i.discovery.on("warning", o), i.info ? i._onMetadata(i) : i.xs && i._getMetadataFromServer()
                    }
                }, i.prototype._getMetadataFromServer = function() {
                    function e(e, n) {
                        function r(r, o, i) {
                            if (t.destroyed) return n(null);
                            if (t.metadata) return n(null);
                            if (r) return t.emit("warning", new Error("http error from xs param: " + e)), n(null);
                            if (200 !== o.statusCode) return t.emit("warning", new Error("non-200 status code " + o.statusCode + " from xs param: " + e)), n(null);
                            var s;
                            try {
                                s = T(i)
                            } catch (e) {}
                            return s ? s.infoHash === t.infoHash ? void(t._onMetadata(s), n(null)) : (t.emit("warning", new Error("got torrent file with incorrect info hash from xs param: " + e)), n(null)) : (t.emit("warning", new Error("got invalid torrent file from xs param: " + e)), n(null))
                        }
                        if (0 !== e.indexOf("http://") && 0 !== e.indexOf("https://")) return t.emit("warning", new Error("skipping non-http xs param: " + e)), n(null);
                        var o;
                        try {
                            o = x.concat({
                                url: e,
                                method: "GET",
                                headers: {
                                    "user-agent": $
                                }
                            }, r)
                        } catch (r) {
                            return t.emit("warning", new Error("skipping invalid url xs param: " + e)), n(null)
                        }
                        t._xsRequests.push(o)
                    }
                    var t = this,
                        n = Array.isArray(t.xs) ? t.xs : [t.xs],
                        r = n.map(function(t) {
                            return function(n) {
                                e(t, n)
                            }
                        });
                    C(r)
                }, i.prototype._onMetadata = function(e) {
                    var t = this;
                    if (!(t.metadata || t.destroyed)) {
                        t._debug("got metadata"), t._xsRequests.forEach(function(e) {
                            e.abort()
                        }), t._xsRequests = [];
                        var n;
                        if (e && e.infoHash) n = e;
                        else try {
                            n = T(e)
                        } catch (e) {
                            return t._destroy(e)
                        }
                        t._processParsedTorrent(n), t.metadata = t.torrentFile, t.client.enableWebSeeds && t.urlList.forEach(function(e) {
                            t.addWebSeed(e)
                        }), 0 !== t.pieces.length && t.select(0, t.pieces.length - 1, !1), t._rarityMap = new W(t), t.store = new v(new t._store(t.pieceLength, {
                            torrent: {
                                infoHash: t.infoHash
                            },
                            files: t.files.map(function(e) {
                                return {
                                    path: A.join(t.path, e.path),
                                    length: e.length,
                                    offset: e.offset
                                }
                            }),
                            length: t.length
                        })), t.files = t.files.map(function(e) {
                            return new N(t, e)
                        }), t._hashes = t.pieces, t.pieces = t.pieces.map(function(e, n) {
                            var r = n === t.pieces.length - 1 ? t.lastPieceLength : t.pieceLength;
                            return new U(r)
                        }), t._reservations = t.pieces.map(function() {
                            return []
                        }), t.bitfield = new f(t.pieces.length), t.wires.forEach(function(e) {
                            e.ut_metadata && e.ut_metadata.setMetadata(t.metadata), t._onWireWithMetadata(e)
                        }), t._debug("verifying existing torrent data"), t._fileModtimes && t._store === k ? t.getFileModtimes(function(e, n) {
                            if (e) return t._destroy(e);
                            var r = t.files.map(function(e, r) {
                                return n[r] === t._fileModtimes[r]
                            }).every(function(e) {
                                return e
                            });
                            if (r) {
                                for (var o = 0; o < t.pieces.length; o++) t._markVerified(o);
                                t._onStore()
                            } else t._verifyPieces()
                        }) : t._verifyPieces(), t.emit("metadata")
                    }
                }, i.prototype.getFileModtimes = function(e) {
                    var t = this,
                        n = [];
                    L(t.files.map(function(e, r) {
                        return function(o) {
                            w.stat(A.join(t.path, e.path), function(e, t) {
                                return e && "ENOENT" !== e.code ? o(e) : void(n[r] = t && t.mtime.getTime(), o(null))
                            })
                        }
                    }), K, function(r) {
                        t._debug("done getting file modtimes"), e(r, n)
                    })
                }, i.prototype._verifyPieces = function() {
                    var e = this;
                    L(e.pieces.map(function(t, r) {
                        return function(t) {
                            return e.destroyed ? t(new Error("torrent is destroyed")) : void e.store.get(r, function(o, i) {
                                return e.destroyed ? t(new Error("torrent is destroyed")) : o ? n.nextTick(t, null) : void O(i, function(n) {
                                    if (e.destroyed) return t(new Error("torrent is destroyed"));
                                    if (n === e._hashes[r]) {
                                        if (!e.pieces[r]) return;
                                        e._debug("piece verified %s", r), e._markVerified(r)
                                    } else e._debug("piece invalid %s", r);
                                    t(null)
                                })
                            })
                        }
                    }), K, function(t) {
                        return t ? e._destroy(t) : void(e._debug("done verifying"), e._onStore())
                    })
                }, i.prototype._markVerified = function(e) {
                    this.pieces[e] = null, this._reservations[e] = null, this.bitfield.set(e, !0)
                }, i.prototype._onStore = function() {
                    var e = this;
                    e.destroyed || (e._debug("on store"), e.ready = !0, e.emit("ready"), e._checkDone(), e._updateSelections())
                }, i.prototype.destroy = function(e) {
                    var t = this;
                    t._destroy(null, e)
                }, i.prototype._destroy = function(e, t) {
                    var n = this;
                    if (!n.destroyed) {
                        for (var r in n.destroyed = !0, n._debug("destroy"), n.client._remove(n), clearInterval(n._rechokeIntervalId), n._xsRequests.forEach(function(e) {
                                e.abort()
                            }), n._rarityMap && n._rarityMap.destroy(), n._peers) n.removePeer(r);
                        n.files.forEach(function(e) {
                            e instanceof N && e._destroy()
                        });
                        var o = n._servers.map(function(e) {
                            return function(t) {
                                e.destroy(t)
                            }
                        });
                        n.discovery && o.push(function(e) {
                            n.discovery.destroy(e)
                        }), n.store && o.push(function(e) {
                            n.store.close(e)
                        }), C(o, t), e && (0 === n.listenerCount("error") ? n.client.emit("error", e) : n.emit("error", e)), n.emit("close"), n.client = null, n.files = [], n.discovery = null, n.store = null, n._rarityMap = null, n._peers = null, n._servers = null, n._xsRequests = null
                    }
                }, i.prototype.addPeer = function(e) {
                    var t = this;
                    if (t.destroyed) throw new Error("torrent is destroyed");
                    if (!t.infoHash) throw new Error("addPeer() must not be called before the `infoHash` event");
                    if (t.client.blocked) {
                        var n;
                        if ("string" == typeof e) {
                            var r;
                            try {
                                r = u(e)
                            } catch (n) {
                                return t._debug("ignoring peer: invalid %s", e), t.emit("invalidPeer", e), !1
                            }
                            n = r[0]
                        } else "string" == typeof e.remoteAddress && (n = e.remoteAddress);
                        if (n && t.client.blocked.contains(n)) return t._debug("ignoring peer: blocked %s", e), "string" != typeof e && e.destroy(), t.emit("blockedPeer", e), !1
                    }
                    var o = !!t._addPeer(e);
                    return o ? t.emit("peer", e) : t.emit("invalidPeer", e), o
                }, i.prototype._addPeer = function(e) {
                    var t = this;
                    if (t.destroyed) return "string" != typeof e && e.destroy(), null;
                    if ("string" == typeof e && !t._validAddr(e)) return t._debug("ignoring peer: invalid %s", e), null;
                    var n = e && e.id || e;
                    if (t._peers[n]) return t._debug("ignoring peer: duplicate (%s)", n), "string" != typeof e && e.destroy(), null;
                    if (t.paused) return t._debug("ignoring peer: torrent is paused"), "string" != typeof e && e.destroy(), null;
                    t._debug("add peer %s", n);
                    var r;
                    return r = "string" == typeof e ? D.createTCPOutgoingPeer(e, t) : D.createWebRTCPeer(e, t), t._peers[r.id] = r, t._peersLength += 1, "string" == typeof e && (t._queue.push(r), t._drain()), r
                }, i.prototype.addWebSeed = function(e) {
                    if (this.destroyed) throw new Error("torrent is destroyed");
                    if (!/^https?:\/\/.+/.test(e)) return this.emit("warning", new Error("ignoring invalid web seed: " + e)), void this.emit("invalidPeer", e);
                    if (this._peers[e]) return this.emit("warning", new Error("ignoring duplicate web seed: " + e)), void this.emit("invalidPeer", e);
                    this._debug("add web seed %s", e);
                    var t = D.createWebSeedPeer(e, this);
                    this._peers[t.id] = t, this._peersLength += 1, this.emit("peer", e)
                }, i.prototype._addIncomingPeer = function(e) {
                    var t = this;
                    return t.destroyed ? e.destroy(new Error("torrent is destroyed")) : t.paused ? e.destroy(new Error("torrent is paused")) : void(this._debug("add incoming peer %s", e.id), t._peers[e.id] = e, t._peersLength += 1)
                }, i.prototype.removePeer = function(e) {
                    var t = this,
                        n = e && e.id || e;
                    e = t._peers[n];
                    e && (this._debug("removePeer %s", n), delete t._peers[n], t._peersLength -= 1, e.destroy(), t._drain())
                }, i.prototype.select = function(e, t, n, r) {
                    var o = this;
                    if (o.destroyed) throw new Error("torrent is destroyed");
                    if (0 > e || t < e || o.pieces.length <= t) throw new Error("invalid selection ", e, ":", t);
                    n = +n || 0, o._debug("select %s-%s (priority %s)", e, t, n), o._selections.push({
                        from: e,
                        to: t,
                        offset: 0,
                        priority: n,
                        notify: r || l
                    }), o._selections.sort(function(e, t) {
                        return t.priority - e.priority
                    }), o._updateSelections()
                }, i.prototype.deselect = function(e, t, n) {
                    var r = this;
                    if (r.destroyed) throw new Error("torrent is destroyed");
                    n = +n || 0, r._debug("deselect %s-%s (priority %s)", e, t, n);
                    for (var o = 0, i; o < r._selections.length; ++o)
                        if (i = r._selections[o], i.from === e && i.to === t && i.priority === n) {
                            r._selections.splice(o, 1);
                            break
                        }
                    r._updateSelections()
                }, i.prototype.critical = function(e, t) {
                    var n = this;
                    if (n.destroyed) throw new Error("torrent is destroyed");
                    n._debug("critical %s-%s", e, t);
                    for (var r = e; r <= t; ++r) n._critical[r] = !0;
                    n._updateSelections()
                }, i.prototype._onWire = function(e, t) {
                    var r = this;
                    if (r._debug("got wire %s (%s)", e._debugId, t || "Unknown"), e.on("download", function(e) {
                            r.destroyed || (r.received += e, r._downloadSpeed(e), r.client._downloadSpeed(e), r.emit("download", e), r.client.emit("download", e))
                        }), e.on("upload", function(e) {
                            r.destroyed || (r.uploaded += e, r._uploadSpeed(e), r.client._uploadSpeed(e), r.emit("upload", e), r.client.emit("upload", e))
                        }), r.wires.push(e), t) {
                        var o = u(t);
                        e.remoteAddress = o[0], e.remotePort = o[1]
                    }
                    r.client.dht && r.client.dht.listening && e.on("port", function(n) {
                        return r.destroyed || r.client.dht.destroyed ? void 0 : e.remoteAddress ? 0 === n || 65536 < n ? r._debug("ignoring invalid PORT from peer") : void(r._debug("port: %s (from %s)", n, t), r.client.dht.addNode({
                            host: e.remoteAddress,
                            port: n
                        })) : r._debug("ignoring PORT from peer with no address")
                    }), e.on("timeout", function() {
                        r._debug("wire timeout (%s)", t), e.destroy()
                    }), e.setTimeout(3e4, !0), e.setKeepAlive(!0), e.use(q(r.metadata)), e.ut_metadata.on("warning", function(e) {
                        r._debug("ut_metadata warning: %s", e.message)
                    }), r.metadata || (e.ut_metadata.on("metadata", function(e) {
                        r._debug("got metadata via ut_metadata"), r._onMetadata(e)
                    }), e.ut_metadata.fetch()), "function" != typeof j || r.private || (e.use(j()), e.ut_pex.on("peer", function(e) {
                        r.done || (r._debug("ut_pex: got peer: %s (from %s)", e, t), r.addPeer(e))
                    }), e.ut_pex.on("dropped", function(e) {
                        var n = r._peers[e];
                        n && !n.connected && (r._debug("ut_pex: dropped peer: %s (from %s)", e, t), r.removePeer(e))
                    }), e.once("close", function() {
                        e.ut_pex.reset()
                    })), r.emit("wire", e, t), r.metadata && n.nextTick(function() {
                        r._onWireWithMetadata(e)
                    })
                }, i.prototype._onWireWithMetadata = function(e) {
                    function t() {
                        r.destroyed || e.destroyed || (r._numQueued > 2 * (r._numConns - r.numPeers) && e.amInterested ? e.destroy() : (o = setTimeout(t, F), o.unref && o.unref()))
                    }

                    function n() {
                        if (e.peerPieces.buffer.length === r.bitfield.buffer.length) {
                            for (s = 0; s < r.pieces.length; ++s)
                                if (!e.peerPieces.get(s)) return;
                            e.isSeeder = !0, e.choke()
                        }
                    }
                    var r = this,
                        o = null,
                        s;
                    e.on("bitfield", function() {
                        n(), r._update()
                    }), e.on("have", function() {
                        n(), r._update()
                    }), e.once("interested", function() {
                        e.unchoke()
                    }), e.once("close", function() {
                        clearTimeout(o)
                    }), e.on("choke", function() {
                        clearTimeout(o), o = setTimeout(t, F), o.unref && o.unref()
                    }), e.on("unchoke", function() {
                        clearTimeout(o), r._update()
                    }), e.on("request", function(t, n, o, i) {
                        return o > 131072 ? e.destroy() : void(r.pieces[t] || r.store.get(t, {
                            offset: n,
                            length: o
                        }, i))
                    }), e.bitfield(r.bitfield), e.interested(), e.peerExtensions.dht && r.client.dht && r.client.dht.listening && e.port(r.client.dht.address().port), "webSeed" !== e.type && (o = setTimeout(t, F), o.unref && o.unref()), e.isSeeder = !1, n()
                }, i.prototype._updateSelections = function() {
                    var e = this;
                    !e.ready || e.destroyed || (n.nextTick(function() {
                        e._gcSelections()
                    }), e._updateInterest(), e._update())
                }, i.prototype._gcSelections = function() {
                    for (var e = this, t = 0; t < e._selections.length; ++t) {
                        for (var n = e._selections[t], r = n.offset; e.bitfield.get(n.from + n.offset) && n.from + n.offset < n.to;) n.offset += 1;
                        r !== n.offset && n.notify(), n.to === n.from + n.offset && e.bitfield.get(n.from + n.offset) && (e._selections.splice(t, 1), t -= 1, n.notify(), e._updateInterest())
                    }
                    e._selections.length || e.emit("idle")
                }, i.prototype._updateInterest = function() {
                    var e = this,
                        t = e._amInterested;
                    e._amInterested = !!e._selections.length, e.wires.forEach(function(t) {
                        e._amInterested ? t.interested() : t.uninterested()
                    });
                    t === e._amInterested || (e._amInterested ? e.emit("interested") : e.emit("uninterested"))
                }, i.prototype._update = function() {
                    var e = this;
                    if (!e.destroyed)
                        for (var t = P(e.wires), n; n = t();) e._updateWire(n)
                }, i.prototype._updateWire = function(e) {
                    function t(t, n, r, o) {
                        return function(s) {
                            return s >= t && s <= n && !(s in r) && e.peerPieces.get(s) && (!o || o(s))
                        }
                    }

                    function n() {
                        if (!e.requests.length)
                            for (var n = d._selections.length; n--;) {
                                var r = d._selections[n],
                                    o;
                                if ("rarest" === d.strategy)
                                    for (var i = r.from + r.offset, s = r.to, a = {}, c = 0, p = t(i, s, a); c < s - i + 1 && (o = d._rarityMap.getRarestPiece(p), !(0 > o));) {
                                        if (d._request(e, o, !1)) return;
                                        a[o] = !0, c += 1
                                    } else
                                        for (o = r.to; o >= r.from + r.offset; --o)
                                            if (e.peerPieces.get(o) && d._request(e, o, !1)) return
                            }
                    }

                    function r() {
                        var t = e.downloadSpeed() || 1;
                        if (t > V) return function() {
                            return !0
                        };
                        var n = s(1, e.requests.length) * U.BLOCK_LENGTH / t,
                            r = 10,
                            o = 0;
                        return function(e) {
                            if (!r || d.bitfield.get(e)) return !0;
                            for (var i = d.pieces[e].missing; o < d.wires.length; o++) {
                                var s = d.wires[o],
                                    a = s.downloadSpeed();
                                if (!(a < V) && !(a <= t) && s.peerPieces.get(e) && !(0 < (i -= a * n))) return r--, !1
                            }
                            return !0
                        }
                    }

                    function o(e) {
                        for (var t = e, n = e; n < d._selections.length && d._selections[n].priority; n++) t = n;
                        var r = d._selections[e];
                        d._selections[e] = d._selections[t], d._selections[t] = r
                    }

                    function i(n) {
                        if (e.requests.length >= p) return !0;
                        for (var s = r(), a = 0; a < d._selections.length; a++) {
                            var i = d._selections[a],
                                c;
                            if ("rarest" === d.strategy)
                                for (var l = i.from + i.offset, u = i.to, f = {}, h = 0, m = t(l, u, f, s); h < u - l + 1 && (c = d._rarityMap.getRarestPiece(m), !(0 > c));) {
                                    for (; d._request(e, c, d._critical[c] || n););
                                    if (e.requests.length < p) {
                                        f[c] = !0, h++;
                                        continue
                                    }
                                    return i.priority && o(a), !0
                                } else
                                    for (c = i.from + i.offset; c <= i.to; c++)
                                        if (e.peerPieces.get(c) && s(c)) {
                                            for (; d._request(e, c, d._critical[c] || n););
                                            if (!(e.requests.length < p)) return i.priority && o(a), !0
                                        }
                        }
                        return !1
                    }
                    var d = this;
                    if (!e.peerChoking) {
                        if (!e.downloaded) return n();
                        var c = a(e, 0.5);
                        if (!(e.requests.length >= c)) {
                            var p = a(e, G);
                            i(!1) || i(!0)
                        }
                    }
                }, i.prototype._rechoke = function() {
                    function e(e, t) {
                        return e.downloadSpeed === t.downloadSpeed ? e.uploadSpeed === t.uploadSpeed ? e.wire.amChoking === t.wire.amChoking ? e.salt - t.salt : e.wire.amChoking ? 1 : -1 : t.uploadSpeed - e.uploadSpeed : t.downloadSpeed - e.downloadSpeed
                    }
                    var t = this;
                    if (t.ready) {
                        0 < t._rechokeOptimisticTime ? t._rechokeOptimisticTime -= 1 : t._rechokeOptimisticWire = null;
                        var n = [];
                        t.wires.forEach(function(e) {
                            e.isSeeder || e === t._rechokeOptimisticWire || n.push({
                                wire: e,
                                downloadSpeed: e.downloadSpeed(),
                                uploadSpeed: e.uploadSpeed(),
                                salt: Math.random(),
                                isChoked: !0
                            })
                        }), n.sort(e);
                        for (var r = 0, o = 0; o < n.length && r < t._rechokeNumSlots; ++o) n[o].isChoked = !1, n[o].wire.peerInterested && (r += 1);
                        if (!t._rechokeOptimisticWire && o < n.length && t._rechokeNumSlots) {
                            var i = n.slice(o).filter(function(e) {
                                    return e.wire.peerInterested
                                }),
                                s = i[p(i.length)];
                            s && (s.isChoked = !1, t._rechokeOptimisticWire = s.wire, t._rechokeOptimisticTime = 2)
                        }
                        n.forEach(function(e) {
                            e.wire.amChoking !== e.isChoked && (e.isChoked ? e.wire.choke() : e.wire.unchoke())
                        })
                    }
                }, i.prototype._hotswap = function(e, t) {
                    var n = this,
                        o = e.downloadSpeed();
                    if (o < U.BLOCK_LENGTH) return !1;
                    if (!n._reservations[t]) return !1;
                    var s = n._reservations[t];
                    if (!s) return !1;
                    var d = Infinity,
                        a, c;
                    for (c = 0; c < s.length; c++) {
                        var i = s[c];
                        if (i && i !== e) {
                            var p = i.downloadSpeed();
                            p >= V || 2 * p > o || p > d || (a = i, d = p)
                        }
                    }
                    if (!a) return !1;
                    for (c = 0; c < s.length; c++) s[c] === a && (s[c] = null);
                    for (c = 0; c < a.requests.length; c++) {
                        var l = a.requests[c];
                        l.piece === t && n.pieces[t].cancel(0 | l.offset / U.BLOCK_LENGTH)
                    }
                    return n.emit("hotswap", a, e, t), !0
                }, i.prototype._request = function(e, t, o) {
                    function s() {
                        n.nextTick(function() {
                            p._update()
                        })
                    }
                    var p = this,
                        l = e.requests.length,
                        u = "webSeed" === e.type;
                    if (p.bitfield.get(t)) return !1;
                    var f = u ? d(c(e, G, p.pieceLength), p.maxWebConns) : a(e, G);
                    if (l >= f) return !1;
                    var h = p.pieces[t],
                        m = u ? h.reserveRemaining() : h.reserve();
                    if (-1 === m && o && p._hotswap(e, t) && (m = u ? h.reserveRemaining() : h.reserve()), -1 === m) return !1;
                    var g = p._reservations[t];
                    g || (g = p._reservations[t] = []);
                    var r = g.indexOf(null); - 1 === r && (r = g.length), g[r] = e;
                    var i = h.chunkOffset(m),
                        _ = u ? h.chunkLengthRemaining(m) : h.chunkLength(m);
                    return e.request(t, i, _, function n(o, d) {
                        if (!p.destroyed) {
                            if (!p.ready) return p.once("ready", function() {
                                n(o, d)
                            });
                            if (g[r] === e && (g[r] = null), h !== p.pieces[t]) return s();
                            if (o) return p._debug("error getting piece %s (offset: %s length: %s) from %s: %s", t, i, _, e.remoteAddress + ":" + e.remotePort, o.message), u ? h.cancelRemaining(m) : h.cancel(m), void s();
                            if (p._debug("got piece %s (offset: %s length: %s) from %s", t, i, _, e.remoteAddress + ":" + e.remotePort), !h.set(m, d, e)) return s();
                            var a = h.flush();
                            O(a, function(e) {
                                if (!p.destroyed) {
                                    if (e === p._hashes[t]) {
                                        if (!p.pieces[t]) return;
                                        p._debug("piece verified %s", t), p.pieces[t] = null, p._reservations[t] = null, p.bitfield.set(t, !0), p.store.put(t, a), p.wires.forEach(function(e) {
                                            e.have(t)
                                        }), p._checkDone() && !p.destroyed && p.discovery.complete()
                                    } else p.pieces[t] = new U(h.length), p.emit("warning", new Error("Piece " + t + " failed verification"));
                                    s()
                                }
                            })
                        }
                    }), !0
                }, i.prototype._checkDone = function() {
                    var e = this;
                    if (!e.destroyed) {
                        e.files.forEach(function(t) {
                            if (!t.done) {
                                for (var n = t._startPiece; n <= t._endPiece; ++n)
                                    if (!e.bitfield.get(n)) return;
                                t.done = !0, t.emit("done"), e._debug("file done: " + t.name)
                            }
                        });
                        for (var t = !0, n = 0, r; n < e._selections.length; n++) {
                            r = e._selections[n];
                            for (var o = r.from; o <= r.to; o++)
                                if (!e.bitfield.get(o)) {
                                    t = !1;
                                    break
                                }
                            if (!t) break
                        }
                        return !e.done && t && (e.done = !0, e._debug("torrent done: " + e.infoHash), e.emit("done")), e._gcSelections(), t
                    }
                }, i.prototype.load = function(e, t) {
                    var n = this;
                    if (n.destroyed) throw new Error("torrent is destroyed");
                    if (!n.ready) return n.once("ready", function() {
                        n.load(e, t)
                    });
                    Array.isArray(e) || (e = [e]), t || (t = l);
                    var r = new E(e),
                        o = new h(n.store, n.pieceLength);
                    R(r, o, function(e) {
                        return e ? t(e) : void(n.pieces.forEach(function(e, t) {
                            n.pieces[t] = null, n._reservations[t] = null, n.bitfield.set(t, !0)
                        }), n._checkDone(), t(null))
                    })
                }, i.prototype.createServer = function(e) {
                    if ("function" != typeof z) throw new Error("node.js-only method");
                    if (this.destroyed) throw new Error("torrent is destroyed");
                    var t = new z(this, e);
                    return this._servers.push(t), t
                }, i.prototype.pause = function() {
                    this.destroyed || (this._debug("pause"), this.paused = !0)
                }, i.prototype.resume = function() {
                    this.destroyed || (this._debug("resume"), this.paused = !1, this._drain())
                }, i.prototype._debug = function() {
                    var e = [].slice.call(arguments);
                    e[0] = "[" + this.client._debugId + "] [" + this._debugId + "] " + e[0], m.apply(null, e)
                }, i.prototype._drain = function() {
                    var e = this;
                    if (this._debug("_drain numConns %s maxConns %s", e._numConns, e.client.maxConns), !("function" != typeof B.connect || e.destroyed || e.paused || e._numConns >= e.client.maxConns)) {
                        this._debug("drain (%s queued, %s/%s peers)", e._numQueued, e.numPeers, e.client.maxConns);
                        var t = e._queue.shift();
                        if (t) {
                            this._debug("tcp connect attempt to %s", t.addr);
                            var n = u(t.addr),
                                r = {
                                    host: n[0],
                                    port: n[1]
                                },
                                o = t.conn = B.connect(r);
                            o.once("connect", function() {
                                t.onConnect()
                            }), o.once("error", function(e) {
                                t.destroy(e)
                            }), t.startConnectTimeout(), o.on("close", function() {
                                if (!e.destroyed) {
                                    if (t.retries >= X.length) return void e._debug("conn %s closed: will not re-add (max %s attempts)", t.addr, X.length);
                                    var n = X[t.retries];
                                    e._debug("conn %s closed: will re-add to queue in %sms (attempt %s)", t.addr, n, t.retries + 1);
                                    var r = setTimeout(function() {
                                        var n = e._addPeer(t.addr);
                                        n && (n.retries = t.retries + 1)
                                    }, n);
                                    r.unref && r.unref()
                                }
                            })
                        }
                    }
                }, i.prototype._validAddr = function(e) {
                    var t;
                    try {
                        t = u(e)
                    } catch (t) {
                        return !1
                    }
                    var n = t[0],
                        r = t[1];
                    return 0 < r && 65535 > r && ("127.0.0.1" !== n || r !== this.client.torrentPort)
                }
            }).call(this, e("_process"), "undefined" == typeof global ? "undefined" == typeof self ? "undefined" == typeof window ? {} : window : self : global)
        }, {
            "../package.json": 122,
            "./file": 2,
            "./peer": 3,
            "./rarity-map": 4,
            "./server": 21,
            _process: 65,
            "addr-to-ip-port": 7,
            bitfield: 13,
            "chunk-store-stream/write": 25,
            debug: 29,
            events: 33,
            fs: 22,
            "fs-chunk-store": 49,
            "immediate-chunk-store": 39,
            inherits: 40,
            multistream: 57,
            net: 21,
            os: 21,
            "parse-torrent": 61,
            path: 62,
            pump: 66,
            "random-iterate": 71,
            "run-parallel": 86,
            "run-parallel-limit": 85,
            "simple-get": 90,
            "simple-sha1": 92,
            speedometer: 94,
            "torrent-discovery": 106,
            "torrent-piece": 107,
            uniq: 110,
            ut_metadata: 114,
            ut_pex: 21,
            xtend: 119,
            "xtend/mutable": 120
        }],
        6: [function(e, t) {
            function n(e, t) {
                l.call(this), this.url = e, this.webPeerId = p.sync(e), this._torrent = t, this._init()
            }
            t.exports = n;
            var r = e("bitfield"),
                o = e("safe-buffer").Buffer,
                i = e("debug")("webtorrent:webconn"),
                a = e("simple-get"),
                c = e("inherits"),
                p = e("simple-sha1"),
                l = e("bittorrent-protocol"),
                u = e("../package.json").version;
            c(n, l), n.prototype._init = function() {
                var e = this;
                e.setKeepAlive(!0), e.once("handshake", function(t) {
                    if (!e.destroyed) {
                        e.handshake(t, e.webPeerId);
                        for (var n = e._torrent.pieces.length, o = new r(n), s = 0; s <= n; s++) o.set(s, !0);
                        e.bitfield(o)
                    }
                }), e.once("interested", function() {
                    i("interested"), e.unchoke()
                }), e.on("uninterested", function() {
                    i("uninterested")
                }), e.on("choke", function() {
                    i("choke")
                }), e.on("unchoke", function() {
                    i("unchoke")
                }), e.on("bitfield", function() {
                    i("bitfield")
                }), e.on("request", function(t, n, r, o) {
                    i("request pieceIndex=%d offset=%d length=%d", t, n, r), e.httpRequest(t, n, r, o)
                })
            }, n.prototype.httpRequest = function(e, t, n, r) {
                var c = this,
                    p = e * c._torrent.pieceLength,
                    l = p + t,
                    f = l + n - 1,
                    h = c._torrent.files,
                    m;
                if (1 >= h.length) m = [{
                    url: c.url,
                    start: l,
                    end: f
                }];
                else {
                    var g = h.filter(function(e) {
                        return e.offset <= f && e.offset + e.length > l
                    });
                    if (1 > g.length) return r(new Error("Could not find file corresponnding to web seed range request"));
                    m = g.map(function(e) {
                        var t = e.offset + e.length - 1,
                            n = c.url + ("/" === c.url[c.url.length - 1] ? "" : "/") + e.path;
                        return {
                            url: n,
                            fileOffsetInRange: s(e.offset - l, 0),
                            start: s(l - e.offset, 0),
                            end: d(t, f - e.offset)
                        }
                    })
                }
                var _ = 0,
                    y = !1,
                    b;
                1 < m.length && (b = o.alloc(n)), m.forEach(function(o) {
                    function s(e, t) {
                        return 200 > e.statusCode || 300 <= e.statusCode ? (y = !0, r(new Error("Unexpected HTTP status code " + e.statusCode))) : void(i("Got data of length %d", t.length), 1 === m.length ? r(null, t) : (t.copy(b, o.fileOffsetInRange), ++_ === m.length && r(null, b)))
                    }
                    var d = o.url,
                        c = o.start,
                        p = o.end;
                    i("Requesting url=%s pieceIndex=%d offset=%d length=%d start=%d end=%d", d, e, t, n, c, p);
                    var l = {
                        url: d,
                        method: "GET",
                        headers: {
                            "user-agent": "WebTorrent/" + u + " (https://webtorrent.io)",
                            range: "bytes=" + c + "-" + p
                        }
                    };
                    a.concat(l, function(e, t, n) {
                        return y ? void 0 : e ? "undefined" == typeof window || d.startsWith(window.location.origin + "/") ? (y = !0, r(e)) : a.head(d, function(t, n) {
                            return y ? void 0 : t ? (y = !0, r(t)) : 200 > n.statusCode || 300 <= n.statusCode ? (y = !0, r(new Error("Unexpected HTTP status code " + n.statusCode))) : n.url === d ? (y = !0, r(e)) : void(l.url = n.url, a.concat(l, function(e, t, n) {
                                return y ? void 0 : e ? (y = !0, r(e)) : void s(t, n)
                            }))
                        }) : void s(t, n)
                    })
                })
            }, n.prototype.destroy = function() {
                l.prototype.destroy.call(this), this._torrent = null
            }
        }, {
            "../package.json": 122,
            bitfield: 13,
            "bittorrent-protocol": 14,
            debug: 29,
            inherits: 40,
            "safe-buffer": 88,
            "simple-get": 90,
            "simple-sha1": 92
        }],
        7: [function(e, t) {
            var n = /^\[?([^\]]+)\]?:(\d+)$/,
                r = {},
                o = 0;
            t.exports = function(e) {
                if (1e5 == o && t.exports.reset(), !r[e]) {
                    var i = n.exec(e);
                    if (!i) throw new Error("invalid addr: " + e);
                    r[e] = [i[1], +i[2]], o += 1
                }
                return r[e]
            }, t.exports.reset = function() {
                r = {}, o = 0
            }
        }, {}],
        8: [function(e, t, n) {
            "use strict";

            function r(e) {
                var t = e.length;
                if (0 < t % 4) throw new Error("Invalid string. Length must be a multiple of 4");
                return "=" === e[t - 2] ? 2 : "=" === e[t - 1] ? 1 : 0
            }

            function o(e) {
                return d[63 & e >> 18] + d[63 & e >> 12] + d[63 & e >> 6] + d[63 & e]
            }

            function s(e, t, n) {
                for (var r = [], s = t, i; s < n; s += 3) i = (e[s] << 16) + (e[s + 1] << 8) + e[s + 2], r.push(o(i));
                return r.join("")
            }
            n.byteLength = function(e) {
                return 3 * e.length / 4 - r(e)
            }, n.toByteArray = function(e) {
                var t = e.length,
                    n, o, i, s, d;
                s = r(e), d = new c(3 * t / 4 - s), o = 0 < s ? t - 4 : t;
                var p = 0;
                for (n = 0; n < o; n += 4) i = a[e.charCodeAt(n)] << 18 | a[e.charCodeAt(n + 1)] << 12 | a[e.charCodeAt(n + 2)] << 6 | a[e.charCodeAt(n + 3)], d[p++] = 255 & i >> 16, d[p++] = 255 & i >> 8, d[p++] = 255 & i;
                return 2 === s ? (i = a[e.charCodeAt(n)] << 2 | a[e.charCodeAt(n + 1)] >> 4, d[p++] = 255 & i) : 1 === s && (i = a[e.charCodeAt(n)] << 10 | a[e.charCodeAt(n + 1)] << 4 | a[e.charCodeAt(n + 2)] >> 2, d[p++] = 255 & i >> 8, d[p++] = 255 & i), d
            }, n.fromByteArray = function(e) {
                for (var t = e.length, n = t % 3, r = "", o = [], a = 16383, c = 0, i = t - n, p; c < i; c += a) o.push(s(e, c, c + a > i ? i : c + a));
                return 1 == n ? (p = e[t - 1], r += d[p >> 2], r += d[63 & p << 4], r += "==") : 2 == n && (p = (e[t - 2] << 8) + e[t - 1], r += d[p >> 10], r += d[63 & p >> 4], r += d[63 & p << 2], r += "="), o.push(r), o.join("")
            };
            for (var d = [], a = [], c = "undefined" == typeof Uint8Array ? Array : Uint8Array, p = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/", l = 0, i = p.length; l < i; ++l) d[l] = p[l], a[p.charCodeAt(l)] = l;
            a[45] = 62, a[95] = 63
        }, {}],
        9: [function(t, n) {
            (function(t) {
                function r(e, t, n) {
                    for (var r = 0, o = 1, s = t, i; s < n; s++) {
                        if (i = e[s], 58 > i && 48 <= i) {
                            r = 10 * r + (i - 48);
                            continue
                        }
                        if (s !== t || 43 !== i) {
                            if (s === t && 45 === i) {
                                o = -1;
                                continue
                            }
                            if (46 === i) break;
                            throw new Error("not a number: buffer[" + s + "] = " + i)
                        }
                    }
                    return r * o
                }

                function o(e, n, r, i) {
                    return null == e || 0 === e.length ? null : ("number" != typeof n && null == i && (i = n, n = void 0), "number" != typeof r && null == i && (i = r, r = void 0), o.position = 0, o.encoding = i || null, o.data = t.isBuffer(e) ? e.slice(n, r) : new t(e), o.bytes = o.data.length, o.next())
                }
                const i = 101;
                o.bytes = 0, o.position = 0, o.data = null, o.encoding = null, o.next = function() {
                    switch (o.data[o.position]) {
                        case 100:
                            return o.dictionary();
                        case 108:
                            return o.list();
                        case 105:
                            return o.integer();
                        default:
                            return o.buffer();
                    }
                }, o.find = function(t) {
                    for (var n = o.position, r = o.data.length, i = o.data; n < r;) {
                        if (i[n] === t) return n;
                        n++
                    }
                    throw new Error("Invalid data: Missing delimiter \"" + e(t) + "\" [0x" + t.toString(16) + "]")
                }, o.dictionary = function() {
                    o.position++;
                    for (var e = {}; o.data[o.position] !== i;) e[o.buffer()] = o.next();
                    return o.position++, e
                }, o.list = function() {
                    o.position++;
                    for (var e = []; o.data[o.position] !== i;) e.push(o.next());
                    return o.position++, e
                }, o.integer = function() {
                    var e = o.find(i),
                        t = r(o.data, o.position + 1, e);
                    return o.position += e + 1 - o.position, t
                }, o.buffer = function() {
                    var e = o.find(58),
                        t = r(o.data, o.position, e),
                        n = ++e + t;
                    return o.position = n, o.encoding ? o.data.toString(o.encoding, e, n) : o.data.slice(e, n)
                }, n.exports = o
            }).call(this, t("buffer").Buffer)
        }, {
            buffer: 23
        }],
        10: [function(e, t) {
            function n(e, t, o) {
                var i = [],
                    s = null;
                return n._encode(i, e), s = r.concat(i), n.bytes = s.length, r.isBuffer(t) ? (s.copy(t, o), t) : s
            }
            var r = e("safe-buffer").Buffer;
            n.bytes = -1, n._floatConversionDetected = !1, n._encode = function(e, t) {
                if (r.isBuffer(t)) return e.push(r.from(t.length + ":")), void e.push(t);
                if (null != t) switch (typeof t) {
                    case "string":
                        n.buffer(e, t);
                        break;
                    case "number":
                        n.number(e, t);
                        break;
                    case "object":
                        t.constructor === Array ? n.list(e, t) : n.dict(e, t);
                        break;
                    case "boolean":
                        n.number(e, t ? 1 : 0);
                }
            };
            var o = r.from("e"),
                i = r.from("d"),
                s = r.from("l");
            n.buffer = function(e, t) {
                e.push(r.from(r.byteLength(t) + ":" + t))
            }, n.number = function(e, t) {
                var o = 2147483648,
                    i = (t / o << 0) * o + (t % o << 0);
                e.push(r.from("i" + i + "e")), i === t || n._floatConversionDetected || (n._floatConversionDetected = !0, console.warn("WARNING: Possible data corruption detected with value \"" + t + "\":", "Bencoding only defines support for integers, value was converted to \"" + i + "\""), console.trace())
            }, n.dict = function(e, t) {
                e.push(i);
                for (var r = 0, s = Object.keys(t).sort(), d = s.length, a; r < d; r++) a = s[r], null == t[a] || (n.buffer(e, a), n._encode(e, t[a]));
                e.push(o)
            }, n.list = function(e, t) {
                var r = 0,
                    i = t.length;
                for (e.push(s); r < i; r++) null != t[r] && n._encode(e, t[r]);
                e.push(o)
            }, t.exports = n
        }, {
            "safe-buffer": 88
        }],
        11: [function(e, t) {
            var n = t.exports;
            n.encode = e("./encode"), n.decode = e("./decode"), n.byteLength = n.encodingLength = function(e) {
                return n.encode(e).length
            }
        }, {
            "./decode": 9,
            "./encode": 10
        }],
        12: [function(e, t) {
            t.exports = function(e, t, n, r, o) {
                var i, s;
                if (void 0 === r) r = 0;
                else if (r |= 0, 0 > r || r >= e.length) throw new RangeError("invalid lower bound");
                if (void 0 === o) o = e.length - 1;
                else if (o |= 0, o < r || o >= e.length) throw new RangeError("invalid upper bound");
                for (; r <= o;)
                    if (i = r + (o - r >> 1), s = +n(e[i], t, i, e), 0 > s) r = i + 1;
                    else if (0 < s) o = i - 1;
                else return i;
                return ~r
            }
        }, {}],
        13: [function(e, t) {
            (function(e) {
                function n(e, t) {
                    return this instanceof n ? void(0 === arguments.length && (e = 0), this.grow = t && (isFinite(t.grow) && r(t.grow) || t.grow) || 0, ("number" == typeof e || e === void 0) && (e = new o(r(e)), e.fill && !e._isBuffer && e.fill(0)), this.buffer = e) : new n(e, t)
                }

                function r(e) {
                    var t = e >> 3;
                    return 0 != e % 8 && t++, t
                }
                var o = "undefined" == typeof e ? "undefined" == typeof Int8Array ? function(e) {
                    for (var t = Array(e), n = 0; n < e; n++) t[n] = 0
                } : Int8Array : e;
                n.prototype.get = function(e) {
                    var t = e >> 3;
                    return t < this.buffer.length && !!(this.buffer[t] & 128 >> e % 8)
                }, n.prototype.set = function(e, t) {
                    var n = e >> 3;
                    t || 1 === arguments.length ? (this.buffer.length < n + 1 && this._grow(s(n + 1, d(2 * this.buffer.length, this.grow))), this.buffer[n] |= 128 >> e % 8) : n < this.buffer.length && (this.buffer[n] &= ~(128 >> e % 8))
                }, n.prototype._grow = function(e) {
                    if (this.buffer.length < e && e <= this.grow) {
                        var t = new o(e);
                        if (t.fill && t.fill(0), this.buffer.copy) this.buffer.copy(t, 0);
                        else
                            for (var n = 0; n < this.buffer.length; n++) t[n] = this.buffer[n];
                        this.buffer = t
                    }
                }, "undefined" != typeof t && (t.exports = n)
            }).call(this, e("buffer").Buffer)
        }, {
            buffer: 23
        }],
        14: [function(e, t) {
            function n(e, t, n, r) {
                this.piece = e, this.offset = t, this.length = n, this.callback = r
            }

            function r() {
                return this instanceof r ? void(h.Duplex.call(this), this._debugId = u(4).toString("hex"), this._debug("new wire"), this.peerId = null, this.peerIdBuffer = null, this.type = null, this.amChoking = !0, this.amInterested = !1, this.peerChoking = !0, this.peerInterested = !1, this.peerPieces = new d(0, {
                    grow: m
                }), this.peerExtensions = {}, this.requests = [], this.peerRequests = [], this.extendedMapping = {}, this.peerExtendedMapping = {}, this.extendedHandshake = {}, this.peerExtendedHandshake = {}, this._ext = {}, this._nextExt = 1, this.uploaded = 0, this.downloaded = 0, this.uploadSpeed = f(), this.downloadSpeed = f(), this._keepAliveInterval = null, this._timeout = null, this._timeoutMs = 0, this.destroyed = !1, this._finished = !1, this._parserSize = 0, this._parser = null, this._buffer = [], this._bufferSize = 0, this.on("finish", this._onFinish), this._parseHandshake()) : new r
            }

            function o(e, t, n, r) {
                for (var o = 0, i; o < e.length; o++)
                    if (i = e[o], i.piece === t && i.offset === n && i.length === r) return s(e, o), i;
                return null
            }
            t.exports = r;
            var s = e("unordered-array-remove"),
                i = e("bencode"),
                d = e("bitfield"),
                a = e("safe-buffer").Buffer,
                c = e("debug")("bittorrent-protocol"),
                p = e("xtend"),
                l = e("inherits"),
                u = e("randombytes"),
                f = e("speedometer"),
                h = e("readable-stream"),
                m = 4e5,
                g = a.from("\x13BitTorrent protocol"),
                _ = a.from([0, 0, 0, 0]),
                y = a.from([0, 0, 0, 1, 0]),
                b = a.from([0, 0, 0, 1, 1]),
                w = a.from([0, 0, 0, 1, 2]),
                k = a.from([0, 0, 0, 1, 3]),
                x = [0, 0, 0, 0, 0, 0, 0, 0],
                v = [0, 0, 0, 3, 9, 0, 0];
            l(r, h.Duplex), r.prototype.setKeepAlive = function(e) {
                var t = this;
                t._debug("setKeepAlive %s", e), clearInterval(t._keepAliveInterval);
                !1 === e || (t._keepAliveInterval = setInterval(function() {
                    t.keepAlive()
                }, 55000))
            }, r.prototype.setTimeout = function(e, t) {
                this._debug("setTimeout ms=%d unref=%s", e, t), this._clearTimeout(), this._timeoutMs = e, this._timeoutUnref = !!t, this._updateTimeout()
            }, r.prototype.destroy = function() {
                this.destroyed || (this.destroyed = !0, this._debug("destroy"), this.emit("close"), this.end())
            }, r.prototype.end = function() {
                this._debug("end"), this._onUninterested(), this._onChoke(), h.Duplex.prototype.end.apply(this, arguments)
            }, r.prototype.use = function(e) {
                function t() {}
                var n = e.prototype.name;
                if (!n) throw new Error("Extension class requires a \"name\" property on the prototype");
                this._debug("use extension.name=%s", n);
                var r = this._nextExt,
                    o = new e(this);
                "function" != typeof o.onHandshake && (o.onHandshake = t), "function" != typeof o.onExtendedHandshake && (o.onExtendedHandshake = t), "function" != typeof o.onMessage && (o.onMessage = t), this.extendedMapping[r] = n, this._ext[n] = o, this[n] = o, this._nextExt += 1
            }, r.prototype.keepAlive = function() {
                this._debug("keep-alive"), this._push(_)
            }, r.prototype.handshake = function(e, t, n) {
                var r, o;
                if ("string" == typeof e ? r = a.from(e, "hex") : (r = e, e = r.toString("hex")), "string" == typeof t ? o = a.from(t, "hex") : (o = t, t = o.toString("hex")), 20 !== r.length || 20 !== o.length) throw new Error("infoHash and peerId MUST have length 20");
                this._debug("handshake i=%s p=%s exts=%o", e, t, n);
                var i = a.from(x);
                i[5] |= 16, n && n.dht && (i[7] |= 1), this._push(a.concat([g, i, r, o])), this._handshakeSent = !0, this.peerExtensions.extended && !this._extendedHandshakeSent && this._sendExtendedHandshake()
            }, r.prototype._sendExtendedHandshake = function() {
                var e = p(this.extendedHandshake);
                for (var t in e.m = {}, this.extendedMapping) {
                    var n = this.extendedMapping[t];
                    e.m[n] = +t
                }
                this.extended(0, i.encode(e)), this._extendedHandshakeSent = !0
            }, r.prototype.choke = function() {
                if (!this.amChoking) {
                    for (this.amChoking = !0, this._debug("choke"); this.peerRequests.length;) this.peerRequests.pop();
                    this._push(y)
                }
            }, r.prototype.unchoke = function() {
                this.amChoking && (this.amChoking = !1, this._debug("unchoke"), this._push(b))
            }, r.prototype.interested = function() {
                this.amInterested || (this.amInterested = !0, this._debug("interested"), this._push(w))
            }, r.prototype.uninterested = function() {
                this.amInterested && (this.amInterested = !1, this._debug("uninterested"), this._push(k))
            }, r.prototype.have = function(e) {
                this._debug("have %d", e), this._message(4, [e], null)
            }, r.prototype.bitfield = function(e) {
                this._debug("bitfield"), a.isBuffer(e) || (e = e.buffer), this._message(5, [], e)
            }, r.prototype.request = function(e, t, r, o) {
                return o || (o = function() {}), this._finished ? o(new Error("wire is closed")) : this.peerChoking ? o(new Error("peer is choking")) : void(this._debug("request index=%d offset=%d length=%d", e, t, r), this.requests.push(new n(e, t, r, o)), this._updateTimeout(), this._message(6, [e, t, r], null))
            }, r.prototype.piece = function(e, t, n) {
                this._debug("piece index=%d offset=%d", e, t), this.uploaded += n.length, this.uploadSpeed(n.length), this.emit("upload", n.length), this._message(7, [e, t], n)
            }, r.prototype.cancel = function(e, t, n) {
                this._debug("cancel index=%d offset=%d length=%d", e, t, n), this._callback(o(this.requests, e, t, n), new Error("request was cancelled"), null), this._message(8, [e, t, n], null)
            }, r.prototype.port = function(e) {
                this._debug("port %d", e);
                var t = a.from(v);
                t.writeUInt16BE(e, 5), this._push(t)
            }, r.prototype.extended = function(e, t) {
                if (this._debug("extended ext=%s", e), "string" == typeof e && this.peerExtendedMapping[e] && (e = this.peerExtendedMapping[e]), "number" == typeof e) {
                    var n = a.from([e]),
                        r = a.isBuffer(t) ? t : i.encode(t);
                    this._message(20, [], a.concat([n, r]))
                } else throw new Error("Unrecognized extension: " + e)
            }, r.prototype._read = function() {}, r.prototype._message = function(e, t, n) {
                var r = n ? n.length : 0,
                    o = a.allocUnsafe(5 + 4 * t.length);
                o.writeUInt32BE(o.length + r - 4, 0), o[4] = e;
                for (var s = 0; s < t.length; s++) o.writeUInt32BE(t[s], 5 + 4 * s);
                this._push(o), n && this._push(n)
            }, r.prototype._push = function(e) {
                return this._finished ? void 0 : this.push(e)
            }, r.prototype._onKeepAlive = function() {
                this._debug("got keep-alive"), this.emit("keep-alive")
            }, r.prototype._onHandshake = function(e, t, n) {
                var r = e.toString("hex"),
                    o = t.toString("hex");
                this._debug("got handshake i=%s p=%s exts=%o", r, o, n), this.peerId = o, this.peerIdBuffer = t, this.peerExtensions = n, this.emit("handshake", r, o, n);
                for (var i in this._ext) this._ext[i].onHandshake(r, o, n);
                n.extended && this._handshakeSent && !this._extendedHandshakeSent && this._sendExtendedHandshake()
            }, r.prototype._onChoke = function() {
                for (this.peerChoking = !0, this._debug("got choke"), this.emit("choke"); this.requests.length;) this._callback(this.requests.pop(), new Error("peer is choking"), null)
            }, r.prototype._onUnchoke = function() {
                this.peerChoking = !1, this._debug("got unchoke"), this.emit("unchoke")
            }, r.prototype._onInterested = function() {
                this.peerInterested = !0, this._debug("got interested"), this.emit("interested")
            }, r.prototype._onUninterested = function() {
                this.peerInterested = !1, this._debug("got uninterested"), this.emit("uninterested")
            }, r.prototype._onHave = function(e) {
                this.peerPieces.get(e) || (this._debug("got have %d", e), this.peerPieces.set(e, !0), this.emit("have", e))
            }, r.prototype._onBitField = function(e) {
                this.peerPieces = new d(e), this._debug("got bitfield"), this.emit("bitfield", this.peerPieces)
            }, r.prototype._onRequest = function(e, t, r) {
                var i = this;
                if (!i.amChoking) {
                    i._debug("got request index=%d offset=%d length=%d", e, t, r);
                    var s = function(n, s) {
                            return d === o(i.peerRequests, e, t, r) ? n ? i._debug("error satisfying request index=%d offset=%d length=%d (%s)", e, t, r, n.message) : void i.piece(e, t, s) : void 0
                        },
                        d = new n(e, t, r, s);
                    i.peerRequests.push(d), i.emit("request", e, t, r, s)
                }
            }, r.prototype._onPiece = function(e, t, n) {
                this._debug("got piece index=%d offset=%d", e, t), this._callback(o(this.requests, e, t, n.length), null, n), this.downloaded += n.length, this.downloadSpeed(n.length), this.emit("download", n.length), this.emit("piece", e, t, n)
            }, r.prototype._onCancel = function(e, t, n) {
                this._debug("got cancel index=%d offset=%d length=%d", e, t, n), o(this.peerRequests, e, t, n), this.emit("cancel", e, t, n)
            }, r.prototype._onPort = function(e) {
                this._debug("got port %d", e), this.emit("port", e)
            }, r.prototype._onExtended = function(e, t) {
                if (0 === e) {
                    var n;
                    try {
                        n = i.decode(t)
                    } catch (e) {
                        this._debug("ignoring invalid extended handshake: %s", e.message || e)
                    }
                    if (!n) return;
                    this.peerExtendedHandshake = n;
                    if ("object" == typeof n.m)
                        for (var r in n.m) this.peerExtendedMapping[r] = +n.m[r].toString();
                    for (r in this._ext) this.peerExtendedMapping[r] && this._ext[r].onExtendedHandshake(this.peerExtendedHandshake);
                    this._debug("got extended handshake"), this.emit("extended", "handshake", this.peerExtendedHandshake)
                } else this.extendedMapping[e] && (e = this.extendedMapping[e], this._ext[e] && this._ext[e].onMessage(t)), this._debug("got extended message ext=%s", e), this.emit("extended", e, t)
            }, r.prototype._onTimeout = function() {
                this._debug("request timed out"), this._callback(this.requests.shift(), new Error("request has timed out"), null), this.emit("timeout")
            }, r.prototype._write = function(e, t, n) {
                for (this._bufferSize += e.length, this._buffer.push(e); this._bufferSize >= this._parserSize;) {
                    var r = 1 === this._buffer.length ? this._buffer[0] : a.concat(this._buffer);
                    this._bufferSize -= this._parserSize, this._buffer = this._bufferSize ? [r.slice(this._parserSize)] : [], this._parser(r.slice(0, this._parserSize))
                }
                n(null)
            }, r.prototype._callback = function(e, t, n) {
                e && (this._clearTimeout(), !this.peerChoking && !this._finished && this._updateTimeout(), e.callback(t, n))
            }, r.prototype._clearTimeout = function() {
                this._timeout && (clearTimeout(this._timeout), this._timeout = null)
            }, r.prototype._updateTimeout = function() {
                var e = this;
                e._timeoutMs && e.requests.length && !e._timeout && (e._timeout = setTimeout(function() {
                    e._onTimeout()
                }, e._timeoutMs), e._timeoutUnref && e._timeout.unref && e._timeout.unref())
            }, r.prototype._parse = function(e, t) {
                this._parserSize = e, this._parser = t
            }, r.prototype._onMessageLength = function(e) {
                var t = e.readUInt32BE(0);
                0 < t ? this._parse(t, this._onMessage) : (this._onKeepAlive(), this._parse(4, this._onMessageLength))
            }, r.prototype._onMessage = function(e) {
                switch (this._parse(4, this._onMessageLength), e[0]) {
                    case 0:
                        return this._onChoke();
                    case 1:
                        return this._onUnchoke();
                    case 2:
                        return this._onInterested();
                    case 3:
                        return this._onUninterested();
                    case 4:
                        return this._onHave(e.readUInt32BE(1));
                    case 5:
                        return this._onBitField(e.slice(1));
                    case 6:
                        return this._onRequest(e.readUInt32BE(1), e.readUInt32BE(5), e.readUInt32BE(9));
                    case 7:
                        return this._onPiece(e.readUInt32BE(1), e.readUInt32BE(5), e.slice(9));
                    case 8:
                        return this._onCancel(e.readUInt32BE(1), e.readUInt32BE(5), e.readUInt32BE(9));
                    case 9:
                        return this._onPort(e.readUInt16BE(1));
                    case 20:
                        return this._onExtended(e.readUInt8(1), e.slice(2));
                    default:
                        return this._debug("got unknown message"), this.emit("unknownmessage", e);
                }
            }, r.prototype._parseHandshake = function() {
                var e = this;
                e._parse(1, function(t) {
                    var n = t.readUInt8(0);
                    e._parse(n + 48, function(t) {
                        var r = t.slice(0, n);
                        return "BitTorrent protocol" === r.toString() ? void(t = t.slice(n), e._onHandshake(t.slice(8, 28), t.slice(28, 48), {
                            dht: !!(1 & t[7]),
                            extended: !!(16 & t[5])
                        }), e._parse(4, e._onMessageLength)) : (e._debug("Error: wire not speaking BitTorrent protocol (%s)", r.toString()), void e.end())
                    })
                })
            }, r.prototype._onFinish = function() {
                for (this._finished = !0, this.push(null); this.read(););
                for (clearInterval(this._keepAliveInterval), this._parse(Number.MAX_VALUE, function() {}); this.peerRequests.length;) this.peerRequests.pop();
                for (; this.requests.length;) this._callback(this.requests.pop(), new Error("wire was closed"), null)
            }, r.prototype._debug = function() {
                var e = [].slice.call(arguments);
                e[0] = "[" + this._debugId + "] " + e[0], c.apply(null, e)
            }
        }, {
            bencode: 11,
            bitfield: 13,
            debug: 29,
            inherits: 40,
            randombytes: 72,
            "readable-stream": 82,
            "safe-buffer": 88,
            speedometer: 94,
            "unordered-array-remove": 111,
            xtend: 119
        }],
        15: [function(e, t) {
            (function(n) {
                function r(e) {
                    function t(e) {
                        n.nextTick(function() {
                            d.emit("warning", e)
                        })
                    }
                    var d = this;
                    if (!(d instanceof r)) return new r(e);
                    if (s.call(d), e || (e = {}), !e.peerId) throw new Error("Option `peerId` is required");
                    if (!e.infoHash) throw new Error("Option `infoHash` is required");
                    if (!e.announce) throw new Error("Option `announce` is required");
                    if (!n.browser && !e.port) throw new Error("Option `port` is required");
                    d.peerId = "string" == typeof e.peerId ? e.peerId : e.peerId.toString("hex"), d._peerIdBuffer = o.from(d.peerId, "hex"), d._peerIdBinary = d._peerIdBuffer.toString("binary"), d.infoHash = "string" == typeof e.infoHash ? e.infoHash : e.infoHash.toString("hex"), d._infoHashBuffer = o.from(d.infoHash, "hex"), d._infoHashBinary = d._infoHashBuffer.toString("binary"), i("new client %s", d.infoHash), d.destroyed = !1, d._port = e.port, d._getAnnounceOpts = e.getAnnounceOpts, d._rtcConfig = e.rtcConfig, d._userAgent = e.userAgent, d._wrtc = "function" == typeof e.wrtc ? e.wrtc() : e.wrtc;
                    var a = "string" == typeof e.announce ? [e.announce] : null == e.announce ? [] : e.announce;
                    a = a.map(function(e) {
                        return e = e.toString(), "/" === e[e.length - 1] && (e = e.substring(0, e.length - 1)), e
                    }), a = u(a);
                    var c = !1 !== d._wrtc && (!!d._wrtc || l.WEBRTC_SUPPORT);
                    d._trackers = a.map(function(e) {
                        var n = f.parse(e).protocol;
                        return ("http:" === n || "https:" === n) && "function" == typeof m ? new m(d, e) : "udp:" === n && "function" == typeof g ? new g(d, e) : ("ws:" === n || "wss:" === n) && c ? "ws:" === n && "undefined" != typeof window && "https:" === window.location.protocol ? (t(new Error("Unsupported tracker protocol: " + e)), null) : new _(d, e) : (t(new Error("Unsupported tracker protocol: " + e)), null)
                    }).filter(Boolean)
                }
                t.exports = r;
                var o = e("safe-buffer").Buffer,
                    i = e("debug")("bittorrent-tracker:client"),
                    s = e("events").EventEmitter,
                    d = e("xtend"),
                    a = e("inherits"),
                    c = e("once"),
                    p = e("run-parallel"),
                    l = e("simple-peer"),
                    u = e("uniq"),
                    f = e("url"),
                    h = e("./lib/common"),
                    m = e("./lib/client/http-tracker"),
                    g = e("./lib/client/udp-tracker"),
                    _ = e("./lib/client/websocket-tracker");
                a(r, s), r.scrape = function(e, t) {
                    if (t = c(t), !e.infoHash) throw new Error("Option `infoHash` is required");
                    if (!e.announce) throw new Error("Option `announce` is required");
                    var n = d(e, {
                            infoHash: Array.isArray(e.infoHash) ? e.infoHash[0] : e.infoHash,
                            peerId: o.from("01234567890123456789"),
                            port: 6881
                        }),
                        i = new r(n);
                    i.once("error", t), i.once("warning", t);
                    var s = Array.isArray(e.infoHash) ? e.infoHash.length : 1,
                        a = {};
                    return i.on("scrape", function(e) {
                        if (s -= 1, a[e.infoHash] = e, 0 === s) {
                            i.destroy();
                            var n = Object.keys(a);
                            1 === n.length ? t(null, a[n[0]]) : t(null, a)
                        }
                    }), e.infoHash = Array.isArray(e.infoHash) ? e.infoHash.map(function(e) {
                        return o.from(e, "hex")
                    }) : o.from(e.infoHash, "hex"), i.scrape({
                        infoHash: e.infoHash
                    }), i
                }, r.prototype.start = function(e) {
                    var t = this;
                    i("send `start`"), e = t._defaultAnnounceOpts(e), e.event = "started", t._announce(e), t._trackers.forEach(function(e) {
                        e.setInterval()
                    })
                }, r.prototype.stop = function(e) {
                    var t = this;
                    i("send `stop`"), e = t._defaultAnnounceOpts(e), e.event = "stopped", t._announce(e)
                }, r.prototype.complete = function(e) {
                    var t = this;
                    i("send `complete`"), e || (e = {}), e = t._defaultAnnounceOpts(e), e.event = "completed", t._announce(e)
                }, r.prototype.update = function(e) {
                    var t = this;
                    i("send `update`"), e = t._defaultAnnounceOpts(e), e.event && delete e.event, t._announce(e)
                }, r.prototype._announce = function(e) {
                    var t = this;
                    t._trackers.forEach(function(t) {
                        t.announce(e)
                    })
                }, r.prototype.scrape = function(e) {
                    var t = this;
                    i("send `scrape`"), e || (e = {}), t._trackers.forEach(function(t) {
                        t.scrape(e)
                    })
                }, r.prototype.setInterval = function(e) {
                    var t = this;
                    i("setInterval %d", e), t._trackers.forEach(function(t) {
                        t.setInterval(e)
                    })
                }, r.prototype.destroy = function(e) {
                    var t = this;
                    if (!t.destroyed) {
                        t.destroyed = !0, i("destroy");
                        var n = t._trackers.map(function(e) {
                            return function(t) {
                                e.destroy(t)
                            }
                        });
                        p(n, e), t._trackers = [], t._getAnnounceOpts = null
                    }
                }, r.prototype._defaultAnnounceOpts = function(e) {
                    var t = this;
                    return e || (e = {}), null == e.numwant && (e.numwant = h.DEFAULT_ANNOUNCE_PEERS), null == e.uploaded && (e.uploaded = 0), null == e.downloaded && (e.downloaded = 0), t._getAnnounceOpts && (e = d(e, t._getAnnounceOpts())), e
                }
            }).call(this, e("_process"))
        }, {
            "./lib/client/http-tracker": 21,
            "./lib/client/udp-tracker": 21,
            "./lib/client/websocket-tracker": 17,
            "./lib/common": 18,
            _process: 65,
            debug: 29,
            events: 33,
            inherits: 40,
            once: 59,
            "run-parallel": 86,
            "safe-buffer": 88,
            "simple-peer": 91,
            uniq: 110,
            url: 112,
            xtend: 119
        }],
        16: [function(e, t) {
            function n(e, t) {
                var n = this;
                r.call(n), n.client = e, n.announceUrl = t, n.interval = null, n.destroyed = !1
            }
            t.exports = n;
            var r = e("events").EventEmitter,
                o = e("inherits");
            o(n, r), n.prototype.setInterval = function(e) {
                var t = this;
                null == e && (e = t.DEFAULT_ANNOUNCE_INTERVAL), clearInterval(t.interval), e && (t.interval = setInterval(function() {
                    t.announce(t.client._defaultAnnounceOpts())
                }, e), t.interval.unref && t.interval.unref())
            }
        }, {
            events: 33,
            inherits: 40
        }],
        17: [function(e, t) {
            function o(e, t) {
                var n = this;
                h.call(n, e, t), s("new websocket tracker %s", t), n.peers = {}, n.socket = null, n.reconnecting = !1, n.retries = 0, n.reconnectTimer = null, n.expectingResponse = !1, n._openSocket()
            }

            function i() {}
            t.exports = o;
            var s = e("debug")("bittorrent-tracker:websocket-tracker"),
                a = e("xtend"),
                c = e("inherits"),
                p = e("simple-peer"),
                l = e("randombytes"),
                u = e("simple-websocket"),
                f = e("../common"),
                h = e("./tracker"),
                m = {};
            c(o, h), o.prototype.DEFAULT_ANNOUNCE_INTERVAL = 30000, o.prototype.announce = function(e) {
                var t = this;
                if (!(t.destroyed || t.reconnecting)) {
                    if (!t.socket.connected) return void t.socket.once("connect", function() {
                        t.announce(e)
                    });
                    var n = a(e, {
                        action: "announce",
                        info_hash: t.client._infoHashBinary,
                        peer_id: t.client._peerIdBinary
                    });
                    if (t._trackerId && (n.trackerid = t._trackerId), "stopped" === e.event || "completed" === e.event) t._send(n);
                    else {
                        var r = d(e.numwant, 10);
                        t._generateOffers(r, function(e) {
                            n.numwant = r, n.offers = e, t._send(n)
                        })
                    }
                }
            }, o.prototype.scrape = function(e) {
                var t = this;
                if (!(t.destroyed || t.reconnecting)) {
                    if (!t.socket.connected) return void t.socket.once("connect", function() {
                        t.scrape(e)
                    });
                    var n = Array.isArray(e.infoHash) && 0 < e.infoHash.length ? e.infoHash.map(function(e) {
                        return e.toString("binary")
                    }) : e.infoHash && e.infoHash.toString("binary") || t.client._infoHashBinary;
                    t._send({
                        action: "scrape",
                        info_hash: n
                    })
                }
            }, o.prototype.destroy = function(e) {
                function t() {
                    d && (clearTimeout(d), d = null), s.removeListener("data", t), s.destroy(), s = null
                }
                var n = this;
                if (e || (e = i), n.destroyed) return e(null);
                for (var r in n.destroyed = !0, clearInterval(n.interval), clearTimeout(n.reconnectTimer), n.peers) {
                    var o = n.peers[r];
                    clearTimeout(o.trackerTimeout), o.destroy()
                }
                if (n.peers = null, n.socket && (n.socket.removeListener("connect", n._onSocketConnectBound), n.socket.removeListener("data", n._onSocketDataBound), n.socket.removeListener("close", n._onSocketCloseBound), n.socket.removeListener("error", n._onSocketErrorBound), n.socket = null), n._onSocketConnectBound = null, n._onSocketErrorBound = null, n._onSocketDataBound = null, n._onSocketCloseBound = null, m[n.announceUrl] && (m[n.announceUrl].consumers -= 1), 0 < m[n.announceUrl].consumers) return e();
                var s = m[n.announceUrl];
                if (delete m[n.announceUrl], s.on("error", i), s.once("close", e), !n.expectingResponse) return t();
                var d = setTimeout(t, f.DESTROY_TIMEOUT);
                s.once("data", t)
            }, o.prototype._openSocket = function() {
                var e = this;
                e.destroyed = !1, e.peers || (e.peers = {}), e._onSocketConnectBound = function() {
                    e._onSocketConnect()
                }, e._onSocketErrorBound = function(t) {
                    e._onSocketError(t)
                }, e._onSocketDataBound = function(t) {
                    e._onSocketData(t)
                }, e._onSocketCloseBound = function() {
                    e._onSocketClose()
                }, e.socket = m[e.announceUrl], e.socket ? m[e.announceUrl].consumers += 1 : (e.socket = m[e.announceUrl] = new u(e.announceUrl), e.socket.consumers = 1, e.socket.once("connect", e._onSocketConnectBound)), e.socket.on("data", e._onSocketDataBound), e.socket.once("close", e._onSocketCloseBound), e.socket.once("error", e._onSocketErrorBound)
            }, o.prototype._onSocketConnect = function() {
                var e = this;
                e.destroyed || e.reconnecting && (e.reconnecting = !1, e.retries = 0, e.announce(e.client._defaultAnnounceOpts()))
            }, o.prototype._onSocketData = function(e) {
                var t = this;
                if (!t.destroyed) {
                    t.expectingResponse = !1;
                    try {
                        e = JSON.parse(e)
                    } catch (e) {
                        return void t.client.emit("warning", new Error("Invalid tracker response"))
                    }
                    "announce" === e.action ? t._onAnnounceResponse(e) : "scrape" === e.action ? t._onScrapeResponse(e) : t._onSocketError(new Error("invalid action in WS response: " + e.action))
                }
            }, o.prototype._onAnnounceResponse = function(e) {
                var t = this;
                if (e.info_hash !== t.client._infoHashBinary) return void s("ignoring websocket data from %s for %s (looking for %s: reused socket)", t.announceUrl, f.binaryToHex(e.info_hash), t.client.infoHash);
                if (!(e.peer_id && e.peer_id === t.client._peerIdBinary)) {
                    s("received %s from %s for %s", JSON.stringify(e), t.announceUrl, t.client.infoHash);
                    var n = e["failure reason"];
                    if (n) return t.client.emit("warning", new Error(n));
                    var r = e["warning message"];
                    r && t.client.emit("warning", new Error(r));
                    var o = e.interval || e["min interval"];
                    o && t.setInterval(1e3 * o);
                    var i = e["tracker id"];
                    if (i && (t._trackerId = i), null != e.complete) {
                        var d = Object.assign({}, e, {
                            announce: t.announceUrl,
                            infoHash: f.binaryToHex(e.info_hash)
                        });
                        t.client.emit("update", d)
                    }
                    var a;
                    if (e.offer && e.peer_id && (s("creating peer (from remote offer)"), a = t._createPeer(), a.id = f.binaryToHex(e.peer_id), a.once("signal", function(n) {
                            var r = {
                                action: "announce",
                                info_hash: t.client._infoHashBinary,
                                peer_id: t.client._peerIdBinary,
                                to_peer_id: e.peer_id,
                                answer: n,
                                offer_id: e.offer_id
                            };
                            t._trackerId && (r.trackerid = t._trackerId), t._send(r)
                        }), a.signal(e.offer), t.client.emit("peer", a)), e.answer && e.peer_id) {
                        var c = f.binaryToHex(e.offer_id);
                        a = t.peers[c], a ? (a.id = f.binaryToHex(e.peer_id), a.signal(e.answer), t.client.emit("peer", a), clearTimeout(a.trackerTimeout), a.trackerTimeout = null, delete t.peers[c]) : s("got unexpected answer: " + JSON.stringify(e.answer))
                    }
                }
            }, o.prototype._onScrapeResponse = function(e) {
                var t = this;
                e = e.files || {};
                var n = Object.keys(e);
                return 0 === n.length ? void t.client.emit("warning", new Error("invalid scrape response")) : void n.forEach(function(n) {
                    var r = Object.assign(e[n], {
                        announce: t.announceUrl,
                        infoHash: f.binaryToHex(n)
                    });
                    t.client.emit("scrape", r)
                })
            }, o.prototype._onSocketClose = function() {
                var e = this;
                e.destroyed || (e.destroy(), e._startReconnectTimer())
            }, o.prototype._onSocketError = function(e) {
                var t = this;
                t.destroyed || (t.destroy(), t.client.emit("warning", e), t._startReconnectTimer())
            }, o.prototype._startReconnectTimer = function() {
                var e = this,
                    t = r(Math.random() * 30000) + d(n(2, e.retries) * 15000, 1800000);
                e.reconnecting = !0, clearTimeout(e.reconnectTimer), e.reconnectTimer = setTimeout(function() {
                    e.retries++, e._openSocket()
                }, t), e.reconnectTimer.unref && e.reconnectTimer.unref(), s("reconnecting socket in %s ms", t)
            }, o.prototype._send = function(e) {
                var t = this;
                if (!t.destroyed) {
                    t.expectingResponse = !0;
                    var n = JSON.stringify(e);
                    s("send %s", n), t.socket.send(n)
                }
            }, o.prototype._generateOffers = function(e, t) {
                function n() {
                    var e = l(20).toString("hex");
                    s("creating peer (from _generateOffers)");
                    var t = o.peers[e] = o._createPeer({
                        initiator: !0
                    });
                    t.once("signal", function(t) {
                        d.push({
                            offer: t,
                            offer_id: f.hexToBinary(e)
                        }), r()
                    }), t.trackerTimeout = setTimeout(function() {
                        s("tracker timeout: destroying peer"), t.trackerTimeout = null, delete o.peers[e], t.destroy()
                    }, 50000), t.trackerTimeout.unref && t.trackerTimeout.unref()
                }

                function r() {
                    d.length === e && (s("generated %s offers", e), t(d))
                }
                var o = this,
                    d = [];
                s("generating %s offers", e);
                for (var a = 0; a < e; ++a) n();
                r()
            }, o.prototype._createPeer = function(e) {
                function t(e) {
                    r.client.emit("warning", new Error("Connection error: " + e.message)), o.destroy()
                }

                function n() {
                    o.removeListener("error", t), o.removeListener("connect", n)
                }
                var r = this;
                e = Object.assign({
                    trickle: !1,
                    config: r.client._rtcConfig,
                    wrtc: r.client._wrtc
                }, e);
                var o = new p(e);
                return o.once("error", t), o.once("connect", n), o
            }
        }, {
            "../common": 18,
            "./tracker": 16,
            debug: 29,
            inherits: 40,
            randombytes: 72,
            "simple-peer": 91,
            "simple-websocket": 93,
            xtend: 119
        }],
        18: [function(e, t, n) {
            var r = e("safe-buffer").Buffer,
                o = e("xtend/mutable");
            n.DEFAULT_ANNOUNCE_PEERS = 50, n.MAX_ANNOUNCE_PEERS = 82, n.binaryToHex = function(e) {
                return "string" != typeof e && (e += ""), r.from(e, "binary").toString("hex")
            }, n.hexToBinary = function(e) {
                return "string" != typeof e && (e += ""), r.from(e, "hex").toString("binary")
            };
            var i = e("./common-node");
            o(n, i)
        }, {
            "./common-node": 21,
            "safe-buffer": 88,
            "xtend/mutable": 120
        }],
        19: [function(e, t) {
            (function(n) {
                t.exports = function(e, t) {
                    function r(i) {
                        o.removeEventListener("loadend", r, !1), i.error ? t(i.error) : t(null, new n(o.result))
                    }
                    if ("undefined" == typeof Blob || !(e instanceof Blob)) throw new Error("first argument must be a Blob");
                    if ("function" != typeof t) throw new Error("second argument must be a function");
                    var o = new FileReader;
                    o.addEventListener("loadend", r, !1), o.readAsArrayBuffer(e)
                }
            }).call(this, e("buffer").Buffer)
        }, {
            buffer: 23
        }],
        20: [function(e, t) {
            (function(n) {
                function r(e, t) {
                    return this instanceof r ? void(i.call(this), !t && (t = {}), "object" == typeof e && (t = e, e = t.size), this.size = e || 512, this._zeroPadding = !t.nopad && s(t.zeroPadding, !0), this._buffered = [], this._bufferedBytes = 0) : new r(e, t)
                }
                var o = e("inherits"),
                    i = e("readable-stream").Transform,
                    s = e("defined");
                t.exports = r, o(r, i), r.prototype._transform = function(e, t, r) {
                    for (this._bufferedBytes += e.length, this._buffered.push(e); this._bufferedBytes >= this.size;) {
                        var o = n.concat(this._buffered);
                        this._bufferedBytes -= this.size, this.push(o.slice(0, this.size)), this._buffered = [o.slice(this.size, o.length)]
                    }
                    r()
                }, r.prototype._flush = function() {
                    if (this._bufferedBytes && this._zeroPadding) {
                        var e = new n(this.size - this._bufferedBytes);
                        e.fill(0), this._buffered.push(e), this.push(n.concat(this._buffered)), this._buffered = null
                    } else this._bufferedBytes && (this.push(n.concat(this._buffered)), this._buffered = null);
                    this.push(null)
                }
            }).call(this, e("buffer").Buffer)
        }, {
            buffer: 23,
            defined: 31,
            inherits: 40,
            "readable-stream": 82
        }],
        21: [function() {}, {}],
        22: [function(e, t, n) {
            arguments[4][21][0].apply(n, arguments)
        }, {
            dup: 21
        }],
        23: [function(t, r, o) {
            "use strict";

            function s(e) {
                if (e > Q) throw new RangeError("Invalid typed array length");
                var t = new Uint8Array(e);
                return t.__proto__ = c.prototype, t
            }

            function c(e, t, n) {
                if ("number" == typeof e) {
                    if ("string" == typeof t) throw new Error("If encoding is specified then the first argument must be a string");
                    return l(e)
                }
                return i(e, t, n)
            }

            function i(e, t, n) {
                if ("number" == typeof e) throw new TypeError("\"value\" argument must not be a number");
                return e instanceof ArrayBuffer ? h(e, t, n) : "string" == typeof e ? u(e, t) : m(e)
            }

            function a(e) {
                if ("number" != typeof e) throw new TypeError("\"size\" argument must be a number");
                else if (0 > e) throw new RangeError("\"size\" argument must not be negative")
            }

            function p(e, t, n) {
                return a(e), 0 >= e ? s(e) : void 0 === t ? s(e) : "string" == typeof n ? s(e).fill(t, n) : s(e).fill(t)
            }

            function l(e) {
                return a(e), s(0 > e ? 0 : 0 | g(e))
            }

            function u(e, t) {
                if (("string" != typeof t || "" === t) && (t = "utf8"), !c.isEncoding(t)) throw new TypeError("\"encoding\" must be a valid string encoding");
                var n = 0 | _(e, t),
                    r = s(n),
                    o = r.write(e, t);
                return o !== n && (r = r.slice(0, o)), r
            }

            function f(e) {
                for (var t = 0 > e.length ? 0 : 0 | g(e.length), n = s(t), r = 0; r < t; r += 1) n[r] = 255 & e[r];
                return n
            }

            function h(e, t, n) {
                if (0 > t || e.byteLength < t) throw new RangeError("'offset' is out of bounds");
                if (e.byteLength < t + (n || 0)) throw new RangeError("'length' is out of bounds");
                var r;
                return r = void 0 === t && void 0 === n ? new Uint8Array(e) : void 0 === n ? new Uint8Array(e, t) : new Uint8Array(e, t, n), r.__proto__ = c.prototype, r
            }

            function m(e) {
                if (c.isBuffer(e)) {
                    var t = 0 | g(e.length),
                        n = s(t);
                    return 0 === n.length ? n : (e.copy(n, 0, 0, t), n)
                }
                if (e) {
                    if (K(e) || "length" in e) return "number" != typeof e.length || X(e.length) ? s(0) : f(e);
                    if ("Buffer" === e.type && Array.isArray(e.data)) return f(e.data)
                }
                throw new TypeError("First argument must be a string, Buffer, ArrayBuffer, Array, or array-like object.")
            }

            function g(e) {
                if (e >= Q) throw new RangeError("Attempt to allocate Buffer larger than maximum size: 0x" + Q.toString(16) + " bytes");
                return 0 | e
            }

            function _(e, t) {
                if (c.isBuffer(e)) return e.length;
                if (K(e) || e instanceof ArrayBuffer) return e.byteLength;
                "string" != typeof e && (e = "" + e);
                var n = e.length;
                if (0 === n) return 0;
                for (var r = !1;;) switch (t) {
                    case "ascii":
                    case "latin1":
                    case "binary":
                        return n;
                    case "utf8":
                    case "utf-8":
                    case void 0:
                        return W(e).length;
                    case "ucs2":
                    case "ucs-2":
                    case "utf16le":
                    case "utf-16le":
                        return 2 * n;
                    case "hex":
                        return n >>> 1;
                    case "base64":
                        return V(e).length;
                    default:
                        if (r) return W(e).length;
                        t = ("" + t).toLowerCase(), r = !0;
                }
            }

            function y(e, t, n) {
                var r = !1;
                if ((void 0 === t || 0 > t) && (t = 0), t > this.length) return "";
                if ((void 0 === n || n > this.length) && (n = this.length), 0 >= n) return "";
                if (n >>>= 0, t >>>= 0, n <= t) return "";
                for (e || (e = "utf8");;) switch (e) {
                    case "hex":
                        return R(this, t, n);
                    case "utf8":
                    case "utf-8":
                        return L(this, t, n);
                    case "ascii":
                        return A(this, t, n);
                    case "latin1":
                    case "binary":
                        return U(this, t, n);
                    case "base64":
                        return C(this, t, n);
                    case "ucs2":
                    case "ucs-2":
                    case "utf16le":
                    case "utf-16le":
                        return P(this, t, n);
                    default:
                        if (r) throw new TypeError("Unknown encoding: " + e);
                        e = (e + "").toLowerCase(), r = !0;
                }
            }

            function b(e, t, n) {
                var r = e[t];
                e[t] = e[n], e[n] = r
            }

            function w(e, t, n, r, o) {
                if (0 === e.length) return -1;
                if ("string" == typeof n ? (r = n, n = 0) : 2147483647 < n ? n = 2147483647 : -2147483648 > n && (n = -2147483648), n = +n, X(n) && (n = o ? 0 : e.length - 1), 0 > n && (n = e.length + n), n >= e.length) {
                    if (o) return -1;
                    n = e.length - 1
                } else if (0 > n)
                    if (o) n = 0;
                    else return -1;
                if ("string" == typeof t && (t = c.from(t, r)), c.isBuffer(t)) return 0 === t.length ? -1 : k(e, t, n, r, o);
                if ("number" == typeof t) return t &= 255, "function" == typeof Uint8Array.prototype.indexOf ? o ? Uint8Array.prototype.indexOf.call(e, t, n) : Uint8Array.prototype.lastIndexOf.call(e, t, n) : k(e, [t], n, r, o);
                throw new TypeError("val must be string, number or Buffer")
            }

            function k(e, t, n, r, o) {
                function s(e, t) {
                    return 1 == d ? e[t] : e.readUInt16BE(t * d)
                }
                var d = 1,
                    a = e.length,
                    c = t.length;
                if (void 0 !== r && (r = (r + "").toLowerCase(), "ucs2" === r || "ucs-2" === r || "utf16le" === r || "utf-16le" === r)) {
                    if (2 > e.length || 2 > t.length) return -1;
                    d = 2, a /= 2, c /= 2, n /= 2
                }
                var p;
                if (o) {
                    var i = -1;
                    for (p = n; p < a; p++)
                        if (s(e, p) !== s(t, -1 == i ? 0 : p - i)) - 1 != i && (p -= p - i), i = -1;
                        else if (-1 == i && (i = p), p - i + 1 === c) return i * d
                } else
                    for (n + c > a && (n = a - c), p = n; 0 <= p; p--) {
                        for (var l = !0, u = 0; u < c; u++)
                            if (s(e, p + u) !== s(t, u)) {
                                l = !1;
                                break
                            }
                        if (l) return p
                    }
                return -1
            }

            function x(e, t, n, r) {
                n = +n || 0;
                var o = e.length - n;
                r ? (r = +r, r > o && (r = o)) : r = o;
                var s = t.length;
                if (0 != s % 2) throw new TypeError("Invalid hex string");
                r > s / 2 && (r = s / 2);
                for (var d = 0, i; d < r; ++d) {
                    if (i = parseInt(t.substr(2 * d, 2), 16), X(i)) return d;
                    e[n + d] = i
                }
                return d
            }

            function v(e, t, n, r) {
                return G(W(t, e.length - n), e, n, r)
            }

            function S(e, t, n, r) {
                return G(z(t), e, n, r)
            }

            function E(e, t, n, r) {
                return S(e, t, n, r)
            }

            function B(e, t, n, r) {
                return G(V(t), e, n, r)
            }

            function I(e, t, n, r) {
                return G(F(t, e.length - n), e, n, r)
            }

            function C(e, t, n) {
                return 0 === t && n === e.length ? Y.fromByteArray(e) : Y.fromByteArray(e.slice(t, n))
            }

            function L(e, t, n) {
                n = d(e.length, n);
                for (var r = [], o = t; o < n;) {
                    var i = e[o],
                        s = null,
                        a = 239 < i ? 4 : 223 < i ? 3 : 191 < i ? 2 : 1;
                    if (o + a <= n) {
                        var c, p, l, u;
                        1 == a ? 128 > i && (s = i) : 2 == a ? (c = e[o + 1], 128 == (192 & c) && (u = (31 & i) << 6 | 63 & c, 127 < u && (s = u))) : 3 == a ? (c = e[o + 1], p = e[o + 2], 128 == (192 & c) && 128 == (192 & p) && (u = (15 & i) << 12 | (63 & c) << 6 | 63 & p, 2047 < u && (55296 > u || 57343 < u) && (s = u))) : 4 == a ? (c = e[o + 1], p = e[o + 2], l = e[o + 3], 128 == (192 & c) && 128 == (192 & p) && 128 == (192 & l) && (u = (15 & i) << 18 | (63 & c) << 12 | (63 & p) << 6 | 63 & l, 65535 < u && 1114112 > u && (s = u))) : void 0
                    }
                    null === s ? (s = 65533, a = 1) : 65535 < s && (s -= 65536, r.push(55296 | 1023 & s >>> 10), s = 56320 | 1023 & s), r.push(s), o += a
                }
                return T(r)
            }

            function T(t) {
                var n = t.length;
                if (n <= J) return e.apply(String, t);
                for (var r = "", o = 0; o < n;) r += e.apply(String, t.slice(o, o += J));
                return r
            }

            function A(t, n, r) {
                var o = "";
                r = d(t.length, r);
                for (var s = n; s < r; ++s) o += e(127 & t[s]);
                return o
            }

            function U(t, n, r) {
                var o = "";
                r = d(t.length, r);
                for (var s = n; s < r; ++s) o += e(t[s]);
                return o
            }

            function R(e, t, n) {
                var r = e.length;
                (!t || 0 > t) && (t = 0), (!n || 0 > n || n > r) && (n = r);
                for (var o = "", s = t; s < n; ++s) o += D(e[s]);
                return o
            }

            function P(t, n, r) {
                for (var o = t.slice(n, r), s = "", d = 0; d < o.length; d += 2) s += e(o[d] + 256 * o[d + 1]);
                return s
            }

            function O(e, t, n) {
                if (0 != e % 1 || 0 > e) throw new RangeError("offset is not uint");
                if (e + t > n) throw new RangeError("Trying to access beyond buffer length")
            }

            function H(e, t, n, r, o, i) {
                if (!c.isBuffer(e)) throw new TypeError("\"buffer\" argument must be a Buffer instance");
                if (t > o || t < i) throw new RangeError("\"value\" argument is out of bounds");
                if (n + r > e.length) throw new RangeError("Index out of range")
            }

            function M(e, t, n, r) {
                if (n + r > e.length) throw new RangeError("Index out of range");
                if (0 > n) throw new RangeError("Index out of range")
            }

            function q(e, t, n, r, o) {
                return t = +t, n >>>= 0, o || M(e, t, n, 4, 3.4028234663852886e38, -3.4028234663852886e38), $.write(e, t, n, r, 23, 4), n + 4
            }

            function j(e, t, n, r, o) {
                return t = +t, n >>>= 0, o || M(e, t, n, 8, 1.7976931348623157e308, -1.7976931348623157e308), $.write(e, t, n, r, 52, 8), n + 8
            }

            function N(e) {
                if (e = e.trim().replace(Z, ""), 2 > e.length) return "";
                for (; 0 != e.length % 4;) e += "=";
                return e
            }

            function D(e) {
                return 16 > e ? "0" + e.toString(16) : e.toString(16)
            }

            function W(e, t) {
                t = t || Infinity;
                for (var n = e.length, r = null, o = [], s = 0, i; s < n; ++s) {
                    if (i = e.charCodeAt(s), 55295 < i && 57344 > i) {
                        if (!r) {
                            if (56319 < i) {
                                -1 < (t -= 3) && o.push(239, 191, 189);
                                continue
                            } else if (s + 1 === n) {
                                -1 < (t -= 3) && o.push(239, 191, 189);
                                continue
                            }
                            r = i;
                            continue
                        }
                        if (56320 > i) {
                            -1 < (t -= 3) && o.push(239, 191, 189), r = i;
                            continue
                        }
                        i = (r - 55296 << 10 | i - 56320) + 65536
                    } else r && -1 < (t -= 3) && o.push(239, 191, 189);
                    if (r = null, 128 > i) {
                        if (0 > (t -= 1)) break;
                        o.push(i)
                    } else if (2048 > i) {
                        if (0 > (t -= 2)) break;
                        o.push(192 | i >> 6, 128 | 63 & i)
                    } else if (65536 > i) {
                        if (0 > (t -= 3)) break;
                        o.push(224 | i >> 12, 128 | 63 & i >> 6, 128 | 63 & i)
                    } else if (1114112 > i) {
                        if (0 > (t -= 4)) break;
                        o.push(240 | i >> 18, 128 | 63 & i >> 12, 128 | 63 & i >> 6, 128 | 63 & i)
                    } else throw new Error("Invalid code point")
                }
                return o
            }

            function z(e) {
                for (var t = [], n = 0; n < e.length; ++n) t.push(255 & e.charCodeAt(n));
                return t
            }

            function F(e, t) {
                for (var n = [], r = 0, o, i, s; r < e.length && !(0 > (t -= 2)); ++r) o = e.charCodeAt(r), i = o >> 8, s = o % 256, n.push(s), n.push(i);
                return n
            }

            function V(e) {
                return Y.toByteArray(N(e))
            }

            function G(e, t, n, r) {
                for (var o = 0; o < r && !(o + n >= t.length || o >= e.length); ++o) t[o + n] = e[o];
                return o
            }

            function K(e) {
                return "function" == typeof ArrayBuffer.isView && ArrayBuffer.isView(e)
            }

            function X(e) {
                return e !== e
            }
            var Y = t("base64-js"),
                $ = t("ieee754");
            o.Buffer = c, o.SlowBuffer = function(e) {
                return +e != e && (e = 0), c.alloc(+e)
            }, o.INSPECT_MAX_BYTES = 50;
            var Q = 2147483647;
            o.kMaxLength = Q, c.TYPED_ARRAY_SUPPORT = function() {
                try {
                    var e = new Uint8Array(1);
                    return e.__proto__ = {
                        __proto__: Uint8Array.prototype,
                        foo: function() {
                            return 42
                        }
                    }, 42 === e.foo()
                } catch (t) {
                    return !1
                }
            }(), c.TYPED_ARRAY_SUPPORT || "undefined" == typeof console || "function" != typeof console.error || console.error("This browser lacks typed array (Uint8Array) support which is required by `buffer` v5.x. Use `buffer` v4.x if you require old browser support."), "undefined" != typeof Symbol && Symbol.species && c[Symbol.species] === c && Object.defineProperty(c, Symbol.species, {
                value: null,
                configurable: !0,
                enumerable: !1,
                writable: !1
            }), c.poolSize = 8192, c.from = function(e, t, n) {
                return i(e, t, n)
            }, c.prototype.__proto__ = Uint8Array.prototype, c.__proto__ = Uint8Array, c.alloc = function(e, t, n) {
                return p(e, t, n)
            }, c.allocUnsafe = function(e) {
                return l(e)
            }, c.allocUnsafeSlow = function(e) {
                return l(e)
            }, c.isBuffer = function(e) {
                return null != e && !0 === e._isBuffer
            }, c.compare = function(e, t) {
                if (!c.isBuffer(e) || !c.isBuffer(t)) throw new TypeError("Arguments must be Buffers");
                if (e === t) return 0;
                for (var n = e.length, r = t.length, o = 0, i = d(n, r); o < i; ++o)
                    if (e[o] !== t[o]) {
                        n = e[o], r = t[o];
                        break
                    }
                return n < r ? -1 : r < n ? 1 : 0
            }, c.isEncoding = function(e) {
                switch ((e + "").toLowerCase()) {
                    case "hex":
                    case "utf8":
                    case "utf-8":
                    case "ascii":
                    case "latin1":
                    case "binary":
                    case "base64":
                    case "ucs2":
                    case "ucs-2":
                    case "utf16le":
                    case "utf-16le":
                        return !0;
                    default:
                        return !1;
                }
            }, c.concat = function(e, t) {
                if (!Array.isArray(e)) throw new TypeError("\"list\" argument must be an Array of Buffers");
                if (0 === e.length) return c.alloc(0);
                var n;
                if (t === void 0)
                    for (t = 0, n = 0; n < e.length; ++n) t += e[n].length;
                var r = c.allocUnsafe(t),
                    o = 0;
                for (n = 0; n < e.length; ++n) {
                    var i = e[n];
                    if (!c.isBuffer(i)) throw new TypeError("\"list\" argument must be an Array of Buffers");
                    i.copy(r, o), o += i.length
                }
                return r
            }, c.byteLength = _, c.prototype._isBuffer = !0, c.prototype.swap16 = function() {
                var e = this.length;
                if (0 != e % 2) throw new RangeError("Buffer size must be a multiple of 16-bits");
                for (var t = 0; t < e; t += 2) b(this, t, t + 1);
                return this
            }, c.prototype.swap32 = function() {
                var e = this.length;
                if (0 != e % 4) throw new RangeError("Buffer size must be a multiple of 32-bits");
                for (var t = 0; t < e; t += 4) b(this, t, t + 3), b(this, t + 1, t + 2);
                return this
            }, c.prototype.swap64 = function() {
                var e = this.length;
                if (0 != e % 8) throw new RangeError("Buffer size must be a multiple of 64-bits");
                for (var t = 0; t < e; t += 8) b(this, t, t + 7), b(this, t + 1, t + 6), b(this, t + 2, t + 5), b(this, t + 3, t + 4);
                return this
            }, c.prototype.toString = function() {
                var e = this.length;
                return 0 === e ? "" : 0 === arguments.length ? L(this, 0, e) : y.apply(this, arguments)
            }, c.prototype.equals = function(e) {
                if (!c.isBuffer(e)) throw new TypeError("Argument must be a Buffer");
                return this === e || 0 === c.compare(this, e)
            }, c.prototype.inspect = function() {
                var e = "",
                    t = o.INSPECT_MAX_BYTES;
                return 0 < this.length && (e = this.toString("hex", 0, t).match(/.{2}/g).join(" "), this.length > t && (e += " ... ")), "<Buffer " + e + ">"
            }, c.prototype.compare = function(e, t, n, r, o) {
                if (!c.isBuffer(e)) throw new TypeError("Argument must be a Buffer");
                if (void 0 === t && (t = 0), void 0 === n && (n = e ? e.length : 0), void 0 === r && (r = 0), void 0 === o && (o = this.length), 0 > t || n > e.length || 0 > r || o > this.length) throw new RangeError("out of range index");
                if (r >= o && t >= n) return 0;
                if (r >= o) return -1;
                if (t >= n) return 1;
                if (t >>>= 0, n >>>= 0, r >>>= 0, o >>>= 0, this === e) return 0;
                for (var s = o - r, a = n - t, p = d(s, a), l = this.slice(r, o), u = e.slice(t, n), f = 0; f < p; ++f)
                    if (l[f] !== u[f]) {
                        s = l[f], a = u[f];
                        break
                    }
                return s < a ? -1 : a < s ? 1 : 0
            }, c.prototype.includes = function(e, t, n) {
                return -1 !== this.indexOf(e, t, n)
            }, c.prototype.indexOf = function(e, t, n) {
                return w(this, e, t, n, !0)
            }, c.prototype.lastIndexOf = function(e, t, n) {
                return w(this, e, t, n, !1)
            }, c.prototype.write = function(e, t, n, r) {
                if (void 0 === t) r = "utf8", n = this.length, t = 0;
                else if (void 0 === n && "string" == typeof t) r = t, n = this.length, t = 0;
                else if (isFinite(t)) t >>>= 0, isFinite(n) ? (n >>>= 0, void 0 === r && (r = "utf8")) : (r = n, n = void 0);
                else throw new Error("Buffer.write(string, encoding, offset[, length]) is no longer supported");
                var o = this.length - t;
                if ((void 0 === n || n > o) && (n = o), 0 < e.length && (0 > n || 0 > t) || t > this.length) throw new RangeError("Attempt to write outside buffer bounds");
                r || (r = "utf8");
                for (var i = !1;;) switch (r) {
                    case "hex":
                        return x(this, e, t, n);
                    case "utf8":
                    case "utf-8":
                        return v(this, e, t, n);
                    case "ascii":
                        return S(this, e, t, n);
                    case "latin1":
                    case "binary":
                        return E(this, e, t, n);
                    case "base64":
                        return B(this, e, t, n);
                    case "ucs2":
                    case "ucs-2":
                    case "utf16le":
                    case "utf-16le":
                        return I(this, e, t, n);
                    default:
                        if (i) throw new TypeError("Unknown encoding: " + r);
                        r = ("" + r).toLowerCase(), i = !0;
                }
            }, c.prototype.toJSON = function() {
                return {
                    type: "Buffer",
                    data: Array.prototype.slice.call(this._arr || this, 0)
                }
            };
            var J = 4096;
            c.prototype.slice = function(e, t) {
                var n = this.length;
                e = ~~e, t = void 0 === t ? n : ~~t, 0 > e ? (e += n, 0 > e && (e = 0)) : e > n && (e = n), 0 > t ? (t += n, 0 > t && (t = 0)) : t > n && (t = n), t < e && (t = e);
                var r = this.subarray(e, t);
                return r.__proto__ = c.prototype, r
            }, c.prototype.readUIntLE = function(e, t, n) {
                e >>>= 0, t >>>= 0, n || O(e, t, this.length);
                for (var r = this[e], o = 1, s = 0; ++s < t && (o *= 256);) r += this[e + s] * o;
                return r
            }, c.prototype.readUIntBE = function(e, t, n) {
                e >>>= 0, t >>>= 0, n || O(e, t, this.length);
                for (var r = this[e + --t], o = 1; 0 < t && (o *= 256);) r += this[e + --t] * o;
                return r
            }, c.prototype.readUInt8 = function(e, t) {
                return e >>>= 0, t || O(e, 1, this.length), this[e]
            }, c.prototype.readUInt16LE = function(e, t) {
                return e >>>= 0, t || O(e, 2, this.length), this[e] | this[e + 1] << 8
            }, c.prototype.readUInt16BE = function(e, t) {
                return e >>>= 0, t || O(e, 2, this.length), this[e] << 8 | this[e + 1]
            }, c.prototype.readUInt32LE = function(e, t) {
                return e >>>= 0, t || O(e, 4, this.length), (this[e] | this[e + 1] << 8 | this[e + 2] << 16) + 16777216 * this[e + 3]
            }, c.prototype.readUInt32BE = function(e, t) {
                return e >>>= 0, t || O(e, 4, this.length), 16777216 * this[e] + (this[e + 1] << 16 | this[e + 2] << 8 | this[e + 3])
            }, c.prototype.readIntLE = function(e, t, r) {
                e >>>= 0, t >>>= 0, r || O(e, t, this.length);
                for (var o = this[e], s = 1, d = 0; ++d < t && (s *= 256);) o += this[e + d] * s;
                return s *= 128, o >= s && (o -= n(2, 8 * t)), o
            }, c.prototype.readIntBE = function(e, t, r) {
                e >>>= 0, t >>>= 0, r || O(e, t, this.length);
                for (var o = t, i = 1, s = this[e + --o]; 0 < o && (i *= 256);) s += this[e + --o] * i;
                return i *= 128, s >= i && (s -= n(2, 8 * t)), s
            }, c.prototype.readInt8 = function(e, t) {
                return e >>>= 0, t || O(e, 1, this.length), 128 & this[e] ? -1 * (255 - this[e] + 1) : this[e]
            }, c.prototype.readInt16LE = function(e, t) {
                e >>>= 0, t || O(e, 2, this.length);
                var n = this[e] | this[e + 1] << 8;
                return 32768 & n ? 4294901760 | n : n
            }, c.prototype.readInt16BE = function(e, t) {
                e >>>= 0, t || O(e, 2, this.length);
                var n = this[e + 1] | this[e] << 8;
                return 32768 & n ? 4294901760 | n : n
            }, c.prototype.readInt32LE = function(e, t) {
                return e >>>= 0, t || O(e, 4, this.length), this[e] | this[e + 1] << 8 | this[e + 2] << 16 | this[e + 3] << 24
            }, c.prototype.readInt32BE = function(e, t) {
                return e >>>= 0, t || O(e, 4, this.length), this[e] << 24 | this[e + 1] << 16 | this[e + 2] << 8 | this[e + 3]
            }, c.prototype.readFloatLE = function(e, t) {
                return e >>>= 0, t || O(e, 4, this.length), $.read(this, e, !0, 23, 4)
            }, c.prototype.readFloatBE = function(e, t) {
                return e >>>= 0, t || O(e, 4, this.length), $.read(this, e, !1, 23, 4)
            }, c.prototype.readDoubleLE = function(e, t) {
                return e >>>= 0, t || O(e, 8, this.length), $.read(this, e, !0, 52, 8)
            }, c.prototype.readDoubleBE = function(e, t) {
                return e >>>= 0, t || O(e, 8, this.length), $.read(this, e, !1, 52, 8)
            }, c.prototype.writeUIntLE = function(e, t, r, o) {
                if (e = +e, t >>>= 0, r >>>= 0, !o) {
                    var s = n(2, 8 * r) - 1;
                    H(this, e, t, r, s, 0)
                }
                var d = 1,
                    a = 0;
                for (this[t] = 255 & e; ++a < r && (d *= 256);) this[t + a] = 255 & e / d;
                return t + r
            }, c.prototype.writeUIntBE = function(e, t, r, o) {
                if (e = +e, t >>>= 0, r >>>= 0, !o) {
                    var s = n(2, 8 * r) - 1;
                    H(this, e, t, r, s, 0)
                }
                var d = r - 1,
                    i = 1;
                for (this[t + d] = 255 & e; 0 <= --d && (i *= 256);) this[t + d] = 255 & e / i;
                return t + r
            }, c.prototype.writeUInt8 = function(e, t, n) {
                return e = +e, t >>>= 0, n || H(this, e, t, 1, 255, 0), this[t] = 255 & e, t + 1
            }, c.prototype.writeUInt16LE = function(e, t, n) {
                return e = +e, t >>>= 0, n || H(this, e, t, 2, 65535, 0), this[t] = 255 & e, this[t + 1] = e >>> 8, t + 2
            }, c.prototype.writeUInt16BE = function(e, t, n) {
                return e = +e, t >>>= 0, n || H(this, e, t, 2, 65535, 0), this[t] = e >>> 8, this[t + 1] = 255 & e, t + 2
            }, c.prototype.writeUInt32LE = function(e, t, n) {
                return e = +e, t >>>= 0, n || H(this, e, t, 4, 4294967295, 0), this[t + 3] = e >>> 24, this[t + 2] = e >>> 16, this[t + 1] = e >>> 8, this[t] = 255 & e, t + 4
            }, c.prototype.writeUInt32BE = function(e, t, n) {
                return e = +e, t >>>= 0, n || H(this, e, t, 4, 4294967295, 0), this[t] = e >>> 24, this[t + 1] = e >>> 16, this[t + 2] = e >>> 8, this[t + 3] = 255 & e, t + 4
            }, c.prototype.writeIntLE = function(e, t, r, o) {
                if (e = +e, t >>>= 0, !o) {
                    var s = n(2, 8 * r - 1);
                    H(this, e, t, r, s - 1, -s)
                }
                var d = 0,
                    i = 1,
                    a = 0;
                for (this[t] = 255 & e; ++d < r && (i *= 256);) 0 > e && 0 == a && 0 !== this[t + d - 1] && (a = 1), this[t + d] = 255 & (e / i >> 0) - a;
                return t + r
            }, c.prototype.writeIntBE = function(e, t, r, o) {
                if (e = +e, t >>>= 0, !o) {
                    var s = n(2, 8 * r - 1);
                    H(this, e, t, r, s - 1, -s)
                }
                var d = r - 1,
                    i = 1,
                    a = 0;
                for (this[t + d] = 255 & e; 0 <= --d && (i *= 256);) 0 > e && 0 == a && 0 !== this[t + d + 1] && (a = 1), this[t + d] = 255 & (e / i >> 0) - a;
                return t + r
            }, c.prototype.writeInt8 = function(e, t, n) {
                return e = +e, t >>>= 0, n || H(this, e, t, 1, 127, -128), 0 > e && (e = 255 + e + 1), this[t] = 255 & e, t + 1
            }, c.prototype.writeInt16LE = function(e, t, n) {
                return e = +e, t >>>= 0, n || H(this, e, t, 2, 32767, -32768), this[t] = 255 & e, this[t + 1] = e >>> 8, t + 2
            }, c.prototype.writeInt16BE = function(e, t, n) {
                return e = +e, t >>>= 0, n || H(this, e, t, 2, 32767, -32768), this[t] = e >>> 8, this[t + 1] = 255 & e, t + 2
            }, c.prototype.writeInt32LE = function(e, t, n) {
                return e = +e, t >>>= 0, n || H(this, e, t, 4, 2147483647, -2147483648), this[t] = 255 & e, this[t + 1] = e >>> 8, this[t + 2] = e >>> 16, this[t + 3] = e >>> 24, t + 4
            }, c.prototype.writeInt32BE = function(e, t, n) {
                return e = +e, t >>>= 0, n || H(this, e, t, 4, 2147483647, -2147483648), 0 > e && (e = 4294967295 + e + 1), this[t] = e >>> 24, this[t + 1] = e >>> 16, this[t + 2] = e >>> 8, this[t + 3] = 255 & e, t + 4
            }, c.prototype.writeFloatLE = function(e, t, n) {
                return q(this, e, t, !0, n)
            }, c.prototype.writeFloatBE = function(e, t, n) {
                return q(this, e, t, !1, n)
            }, c.prototype.writeDoubleLE = function(e, t, n) {
                return j(this, e, t, !0, n)
            }, c.prototype.writeDoubleBE = function(e, t, n) {
                return j(this, e, t, !1, n)
            }, c.prototype.copy = function(e, t, n, r) {
                if (n || (n = 0), r || 0 === r || (r = this.length), t >= e.length && (t = e.length), t || (t = 0), 0 < r && r < n && (r = n), r === n) return 0;
                if (0 === e.length || 0 === this.length) return 0;
                if (0 > t) throw new RangeError("targetStart out of bounds");
                if (0 > n || n >= this.length) throw new RangeError("sourceStart out of bounds");
                if (0 > r) throw new RangeError("sourceEnd out of bounds");
                r > this.length && (r = this.length), e.length - t < r - n && (r = e.length - t + n);
                var o = r - n,
                    s;
                if (this === e && n < t && t < r)
                    for (s = o - 1; 0 <= s; --s) e[s + t] = this[s + n];
                else if (1e3 > o)
                    for (s = 0; s < o; ++s) e[s + t] = this[s + n];
                else Uint8Array.prototype.set.call(e, this.subarray(n, n + o), t);
                return o
            }, c.prototype.fill = function(e, t, n, r) {
                if ("string" == typeof e) {
                    if ("string" == typeof t ? (r = t, t = 0, n = this.length) : "string" == typeof n && (r = n, n = this.length), 1 === e.length) {
                        var o = e.charCodeAt(0);
                        256 > o && (e = o)
                    }
                    if (void 0 !== r && "string" != typeof r) throw new TypeError("encoding must be a string");
                    if ("string" == typeof r && !c.isEncoding(r)) throw new TypeError("Unknown encoding: " + r)
                } else "number" == typeof e && (e &= 255);
                if (0 > t || this.length < t || this.length < n) throw new RangeError("Out of range index");
                if (n <= t) return this;
                t >>>= 0, n = n === void 0 ? this.length : n >>> 0, e || (e = 0);
                var s;
                if ("number" == typeof e)
                    for (s = t; s < n; ++s) this[s] = e;
                else {
                    var i = c.isBuffer(e) ? e : new c(e, r),
                        d = i.length;
                    for (s = 0; s < n - t; ++s) this[s + t] = i[s % d]
                }
                return this
            };
            var Z = /[^+/0-9A-Za-z-_]/g
        }, {
            "base64-js": 8,
            ieee754: 38
        }],
        24: [function(e, t) {
            t.exports = {
                100: "Continue",
                101: "Switching Protocols",
                102: "Processing",
                200: "OK",
                201: "Created",
                202: "Accepted",
                203: "Non-Authoritative Information",
                204: "No Content",
                205: "Reset Content",
                206: "Partial Content",
                207: "Multi-Status",
                208: "Already Reported",
                226: "IM Used",
                300: "Multiple Choices",
                301: "Moved Permanently",
                302: "Found",
                303: "See Other",
                304: "Not Modified",
                305: "Use Proxy",
                307: "Temporary Redirect",
                308: "Permanent Redirect",
                400: "Bad Request",
                401: "Unauthorized",
                402: "Payment Required",
                403: "Forbidden",
                404: "Not Found",
                405: "Method Not Allowed",
                406: "Not Acceptable",
                407: "Proxy Authentication Required",
                408: "Request Timeout",
                409: "Conflict",
                410: "Gone",
                411: "Length Required",
                412: "Precondition Failed",
                413: "Payload Too Large",
                414: "URI Too Long",
                415: "Unsupported Media Type",
                416: "Range Not Satisfiable",
                417: "Expectation Failed",
                418: "I'm a teapot",
                421: "Misdirected Request",
                422: "Unprocessable Entity",
                423: "Locked",
                424: "Failed Dependency",
                425: "Unordered Collection",
                426: "Upgrade Required",
                428: "Precondition Required",
                429: "Too Many Requests",
                431: "Request Header Fields Too Large",
                451: "Unavailable For Legal Reasons",
                500: "Internal Server Error",
                501: "Not Implemented",
                502: "Bad Gateway",
                503: "Service Unavailable",
                504: "Gateway Timeout",
                505: "HTTP Version Not Supported",
                506: "Variant Also Negotiates",
                507: "Insufficient Storage",
                508: "Loop Detected",
                509: "Bandwidth Limit Exceeded",
                510: "Not Extended",
                511: "Network Authentication Required"
            }
        }, {}],
        25: [function(e, t) {
            function n(e, t, o) {
                var s = this;
                if (!(s instanceof n)) return new n(e, t, o);
                if (i.Writable.call(s, o), o || (o = {}), !e || !e.put || !e.get) throw new Error("First argument must be an abstract-chunk-store compliant store");
                if (t = +t, !t) throw new Error("Second argument must be a chunk length");
                s._blockstream = new r(t, {
                    zeroPadding: !1
                }), s._blockstream.on("data", function(t) {
                    s.destroyed || (e.put(d, t), d += 1)
                }).on("error", function(e) {
                    s.destroy(e)
                });
                var d = 0;
                s.on("finish", function() {
                    this._blockstream.end()
                })
            }
            t.exports = n;
            var r = e("block-stream2"),
                o = e("inherits"),
                i = e("readable-stream");
            o(n, i.Writable), n.prototype._write = function(e, t, n) {
                this._blockstream.write(e, t, n)
            }, n.prototype.destroy = function(e) {
                this.destroyed || (this.destroyed = !0, e && this.emit("error", e), this.emit("close"))
            }
        }, {
            "block-stream2": 20,
            inherits: 40,
            "readable-stream": 82
        }],
        26: [function(e, n) {
            n.exports = function(e, n, r) {
                for (var o = Infinity, s = 0, d = n.length - 1, a, i, c; s <= d && (a = s + (d - s >> 1), c = n[a] - e, 0 > c ? s = a + 1 : 0 < c ? d = a - 1 : void 0, c = t(c), c < o && (o = c, i = a), n[a] !== e););
                return r ? i : n[i]
            }
        }, {}],
        27: [function(e, t, n) {
            (function(e) {
                function t(e) {
                    return Object.prototype.toString.call(e)
                }
                n.isArray = function(e) {
                    return Array.isArray ? Array.isArray(e) : "[object Array]" === t(e)
                }, n.isBoolean = function(e) {
                    return "boolean" == typeof e
                }, n.isNull = function(e) {
                    return null === e
                }, n.isNullOrUndefined = function(e) {
                    return null == e
                }, n.isNumber = function(e) {
                    return "number" == typeof e
                }, n.isString = function(e) {
                    return "string" == typeof e
                }, n.isSymbol = function(e) {
                    return "symbol" == typeof e
                }, n.isUndefined = function(e) {
                    return void 0 === e
                }, n.isRegExp = function(e) {
                    return "[object RegExp]" === t(e)
                }, n.isObject = function(e) {
                    return "object" == typeof e && null !== e
                }, n.isDate = function(e) {
                    return "[object Date]" === t(e)
                }, n.isError = function(n) {
                    return "[object Error]" === t(n) || n instanceof Error
                }, n.isFunction = function(e) {
                    return "function" == typeof e
                }, n.isPrimitive = function(e) {
                    return null === e || "boolean" == typeof e || "number" == typeof e || "string" == typeof e || "symbol" == typeof e || "undefined" == typeof e
                }, n.isBuffer = e.isBuffer
            }).call(this, {
                isBuffer: e("../../is-buffer/index.js")
            })
        }, {
            "../../is-buffer/index.js": 42
        }],
        28: [function(e, t) {
            (function(n, r, i) {
                function s(e, t, n) {
                    return "function" == typeof t ? s(e, null, t) : void(t = t ? I(t) : {}, a(e, t, function(e, r, o) {
                        return e ? n(e) : void(t.singleFileTorrent = o, h(r, t, n))
                    }))
                }

                function d(e, t, n) {
                    return "function" == typeof t ? d(e, null, t) : void(t = t ? I(t) : {}, a(e, t, n))
                }

                function a(e, t, r) {
                    function o() {
                        O(e.map(function(e) {
                            return function(t) {
                                var n = {};
                                if (g(e)) n.getStream = b(e), n.length = e.size;
                                else if (i.isBuffer(e)) n.getStream = w(e), n.length = e.length;
                                else if (y(e)) n.getStream = x(e, n), n.length = 0;
                                else {
                                    if ("string" == typeof e) {
                                        if ("function" != typeof T.stat) throw new Error("filesystem paths do not work in the browser");
                                        var r = 1 < d || a;
                                        return void c(e, r, t)
                                    }
                                    throw new Error("invalid input type")
                                }
                                n.path = e.path, t(null, n)
                            }
                        }), function(e, t) {
                            return e ? r(e) : void(t = L(t), r(null, t, a))
                        })
                    }
                    if (Array.isArray(e) && 0 === e.length) throw new Error("invalid input type");
                    _(e) && (e = Array.prototype.slice.call(e)), Array.isArray(e) || (e = [e]), e = e.map(function(e) {
                        return g(e) && "string" == typeof e.path && "function" == typeof T.stat ? e.path : e
                    }), 1 !== e.length || "string" == typeof e[0] || e[0].name || (e[0].name = t.name);
                    var s = null;
                    e.forEach(function(t, n) {
                        if ("string" != typeof t) {
                            var r = t.fullPath || t.name;
                            r || (r = "Unknown File " + (n + 1), t.unknownName = !0), t.path = r.split("/"), t.path[0] || t.path.shift(), 2 > t.path.length ? s = null : 0 === n && 1 < e.length ? s = t.path[0] : t.path[0] !== s && (s = null)
                        }
                    }), e = e.filter(function(e) {
                        if ("string" == typeof e) return !0;
                        var t = e.path[e.path.length - 1];
                        return u(t) && U.not(t)
                    }), s && e.forEach(function(e) {
                        var t = (i.isBuffer(e) || y(e)) && !e.path;
                        "string" == typeof e || t || e.path.shift()
                    }), !t.name && s && (t.name = s), t.name || e.some(function(e) {
                        return "string" == typeof e ? (t.name = B.basename(e), !0) : e.unknownName ? void 0 : (t.name = e.path[e.path.length - 1], !0)
                    }), t.name || (t.name = "Unnamed Torrent " + Date.now());
                    var d = e.reduce(function(e, t) {
                            return e + +("string" == typeof t)
                        }, 0),
                        a = 1 === e.length;
                    if (1 === e.length && "string" == typeof e[0]) {
                        if ("function" != typeof T.stat) throw new Error("filesystem paths do not work in the browser");
                        A(e[0], function(e, t) {
                            return e ? r(e) : void(a = t, o())
                        })
                    } else n.nextTick(function() {
                        o()
                    })
                }

                function c(e, t, n) {
                    l(e, p, function(r, o) {
                        return r ? n(r) : void(o = Array.isArray(o) ? L(o) : [o], e = B.normalize(e), t && (e = e.slice(0, e.lastIndexOf(B.sep) + 1)), e[e.length - 1] !== B.sep && (e += B.sep), o.forEach(function(t) {
                            t.getStream = k(t.path), t.path = t.path.replace(e, "").split(B.sep)
                        }), n(null, o))
                    })
                }

                function p(e, t) {
                    t = P(t), T.stat(e, function(n, r) {
                        if (n) return t(n);
                        var o = {
                            length: r.size,
                            path: e
                        };
                        t(null, o)
                    })
                }

                function l(e, t, n) {
                    T.stat(e, function(r, o) {
                        return r ? n(r) : void(o.isDirectory() ? T.readdir(e, function(r, o) {
                            return r ? n(r) : void O(o.filter(u).filter(U.not).map(function(n) {
                                return function(r) {
                                    l(B.join(e, n), t, r)
                                }
                            }), n)
                        }) : o.isFile() && t(e, n))
                    })
                }

                function u(e) {
                    return "." !== e[0]
                }

                function f(e, t, n) {
                    function r(e) {
                        p += e.length;
                        var t = f;
                        H(e, function(e) {
                            c[t] = e, u -= 1, a()
                        }), u += 1, f += 1
                    }

                    function o() {
                        h = !0, a()
                    }

                    function s(e) {
                        d(), n(e)
                    }

                    function d() {
                        m.removeListener("error", s), g.removeListener("data", r), g.removeListener("end", o), g.removeListener("error", s)
                    }

                    function a() {
                        h && 0 == u && (d(), n(null, i.from(c.join(""), "hex"), p))
                    }
                    n = P(n);
                    var c = [],
                        p = 0,
                        l = e.map(function(e) {
                            return e.getStream
                        }),
                        u = 0,
                        f = 0,
                        h = !1,
                        m = new R(l),
                        g = new S(t, {
                            zeroPadding: !1
                        });
                    m.on("error", s), m.pipe(g).on("data", r).on("end", o).on("error", s)
                }

                function h(e, n, i) {
                    var s = n.announceList;
                    s || ("string" == typeof n.announce ? s = [
                        [n.announce]
                    ] : Array.isArray(n.announce) && (s = n.announce.map(function(e) {
                        return [e]
                    }))), s || (s = []), r.WEBTORRENT_ANNOUNCE && ("string" == typeof r.WEBTORRENT_ANNOUNCE ? s.push([
                        [r.WEBTORRENT_ANNOUNCE]
                    ]) : Array.isArray(r.WEBTORRENT_ANNOUNCE) && (s = s.concat(r.WEBTORRENT_ANNOUNCE.map(function(e) {
                        return [e]
                    })))), n.announce === void 0 && n.announceList === void 0 && (s = s.concat(t.exports.announceList)), "string" == typeof n.urlList && (n.urlList = [n.urlList]);
                    var d = {
                        info: {
                            name: n.name
                        },
                        "creation date": o((+n.creationDate || Date.now()) / 1e3),
                        encoding: "UTF-8"
                    };
                    0 !== s.length && (d.announce = s[0][0], d["announce-list"] = s), n.comment !== void 0 && (d.comment = n.comment), n.createdBy !== void 0 && (d["created by"] = n.createdBy), n.private !== void 0 && (d.info.private = +n.private), n.sslCert !== void 0 && (d.info["ssl-cert"] = n.sslCert), n.urlList !== void 0 && (d["url-list"] = n.urlList);
                    var a = n.pieceLength || E(e.reduce(m, 0));
                    d.info["piece length"] = a, f(e, a, function(t, r, o) {
                        return t ? i(t) : void(d.info.pieces = r, e.forEach(function(e) {
                            delete e.getStream
                        }), n.singleFileTorrent ? d.info.length = o : d.info.files = e, i(null, v.encode(d)))
                    })
                }

                function m(e, t) {
                    return e + t.length
                }

                function g(e) {
                    return "undefined" != typeof Blob && e instanceof Blob
                }

                function _(e) {
                    return "undefined" != typeof FileList && e instanceof FileList
                }

                function y(e) {
                    return "object" == typeof e && null != e && "function" == typeof e.pipe
                }

                function b(e) {
                    return function() {
                        return new C(e)
                    }
                }

                function w(e) {
                    return function() {
                        var t = new M.PassThrough;
                        return t.end(e), t
                    }
                }

                function k(e) {
                    return function() {
                        return T.createReadStream(e)
                    }
                }

                function x(e, t) {
                    return function() {
                        var n = new M.Transform;
                        return n._transform = function(e, n, r) {
                            t.length += e.length, this.push(e), r()
                        }, e.pipe(n), n
                    }
                }
                t.exports = s, t.exports.parseInput = d, t.exports.announceList = [
                    ["udp://tracker.leechers-paradise.org:6969"],
                    ["udp://tracker.coppersurfer.tk:6969"],
                    ["udp://tracker.opentrackr.org:1337"],
                    ["udp://explodie.org:6969"],
                    ["udp://tracker.empire-js.us:1337"],
                    ["wss://tracker.btorrent.xyz"],
                    ["wss://tracker.openwebtorrent.com"],
                    ["wss://tracker.fastcast.nz"],
		    ["ws://kittyseedbox.tk:1337/wstracker/vuze"]
                ];
                var v = e("bencode"),
                    S = e("block-stream2"),
                    E = e("piece-length"),
                    B = e("path"),
                    I = e("xtend"),
                    C = e("filestream/read"),
                    L = e("flatten"),
                    T = e("fs"),
                    A = e("is-file"),
                    U = e("junk"),
                    R = e("multistream"),
                    P = e("once"),
                    O = e("run-parallel"),
                    H = e("simple-sha1"),
                    M = e("readable-stream")
            }).call(this, e("_process"), "undefined" == typeof global ? "undefined" == typeof self ? "undefined" == typeof window ? {} : window : self : global, e("buffer").Buffer)
        }, {
            _process: 65,
            bencode: 11,
            "block-stream2": 20,
            buffer: 23,
            "filestream/read": 34,
            flatten: 35,
            fs: 22,
            "is-file": 43,
            junk: 46,
            multistream: 57,
            once: 59,
            path: 62,
            "piece-length": 63,
            "readable-stream": 82,
            "run-parallel": 86,
            "simple-sha1": 92,
            xtend: 119
        }],
        29: [function(e, t, n) {
            (function(o) {
                function r() {
                    var e;
                    try {
                        e = n.storage.debug
                    } catch (t) {}
                    return !e && "undefined" != typeof o && "env" in o && (e = o.env.DEBUG), e
                }
                n = t.exports = e("./debug"), n.log = function() {
                    return "object" == typeof console && console.log && Function.prototype.apply.call(console.log, console, arguments)
                }, n.formatArgs = function(e) {
                    var t = this.useColors;
                    if (e[0] = (t ? "%c" : "") + this.namespace + (t ? " %c" : " ") + e[0] + (t ? "%c " : " ") + "+" + n.humanize(this.diff), !!t) {
                        var r = "color: " + this.color;
                        e.splice(1, 0, r, "color: inherit");
                        var o = 0,
                            i = 0;
                        e[0].replace(/%[a-zA-Z%]/g, function(e) {
                            "%%" === e || (o++, "%c" === e && (i = o))
                        }), e.splice(i, 0, r)
                    }
                }, n.save = function(e) {
                    try {
                        null == e ? n.storage.removeItem("debug") : n.storage.debug = e
                    } catch (t) {}
                }, n.load = r, n.useColors = function() {
                    return "undefined" != typeof window && window.process && "renderer" === window.process.type || "undefined" != typeof document && document.documentElement && document.documentElement.style && document.documentElement.style.WebkitAppearance || "undefined" != typeof window && window.console && (window.console.firebug || window.console.exception && window.console.table) || "undefined" != typeof navigator && navigator.userAgent && navigator.userAgent.toLowerCase().match(/firefox\/(\d+)/) && 31 <= parseInt(RegExp.$1, 10) || "undefined" != typeof navigator && navigator.userAgent && navigator.userAgent.toLowerCase().match(/applewebkit\/(\d+)/)
                }, n.storage = "undefined" != typeof chrome && "undefined" != typeof chrome.storage ? chrome.storage.local : function() {
                    try {
                        return window.localStorage
                    } catch (t) {}
                }(), n.colors = ["lightseagreen", "forestgreen", "goldenrod", "dodgerblue", "darkorchid", "crimson"], n.formatters.j = function(e) {
                    try {
                        return JSON.stringify(e)
                    } catch (e) {
                        return "[UnexpectedJSONParseError]: " + e.message
                    }
                }, n.enable(r())
            }).call(this, e("_process"))
        }, {
            "./debug": 30,
            _process: 65
        }],
        30: [function(e, n, r) {
            function o(e) {
                var n = 0,
                    o;
                for (o in e) n = (n << 5) - n + e.charCodeAt(o), n |= 0;
                return r.colors[t(n) % r.colors.length]
            }

            function i(e) {
                function t() {
                    if (t.enabled) {
                        var e = t,
                            n = +new Date,
                            o = n - (s || n);
                        e.diff = o, e.prev = s, e.curr = n, s = n;
                        for (var d = Array(arguments.length), a = 0; a < d.length; a++) d[a] = arguments[a];
                        d[0] = r.coerce(d[0]), "string" != typeof d[0] && d.unshift("%O");
                        var i = 0;
                        d[0] = d[0].replace(/%([a-zA-Z%])/g, function(t, n) {
                            if ("%%" === t) return t;
                            i++;
                            var o = r.formatters[n];
                            if ("function" == typeof o) {
                                var s = d[i];
                                t = o.call(e, s), d.splice(i, 1), i--
                            }
                            return t
                        }), r.formatArgs.call(e, d);
                        var c = t.log || r.log || console.log.bind(console);
                        c.apply(e, d)
                    }
                }
                return t.namespace = e, t.enabled = r.enabled(e), t.useColors = r.useColors(), t.color = o(e), "function" == typeof r.init && r.init(t), t
            }
            r = n.exports = i.debug = i["default"] = i, r.coerce = function(e) {
                return e instanceof Error ? e.stack || e.message : e
            }, r.disable = function() {
                r.enable("")
            }, r.enable = function(e) {
                r.save(e), r.names = [], r.skips = [];
                for (var t = ("string" == typeof e ? e : "").split(/[\s,]+/), n = t.length, o = 0; o < n; o++) t[o] && (e = t[o].replace(/\*/g, ".*?"), "-" === e[0] ? r.skips.push(new RegExp("^" + e.substr(1) + "$")) : r.names.push(new RegExp("^" + e + "$")))
            }, r.enabled = function(e) {
                var t, n;
                for (t = 0, n = r.skips.length; t < n; t++)
                    if (r.skips[t].test(e)) return !1;
                for (t = 0, n = r.names.length; t < n; t++)
                    if (r.names[t].test(e)) return !0;
                return !1
            }, r.humanize = e("ms"), r.names = [], r.skips = [], r.formatters = {};
            var s
        }, {
            ms: 56
        }],
        31: [function(e, t) {
            t.exports = function() {
                for (var e = 0; e < arguments.length; e++)
                    if (arguments[e] !== void 0) return arguments[e]
            }
        }, {}],
        32: [function(e, t) {
            var n = e("once"),
                r = function() {},
                o = function(e) {
                    return e.setHeader && "function" == typeof e.abort
                },
                i = function(e) {
                    return e.stdio && Array.isArray(e.stdio) && 3 === e.stdio.length
                },
                s = function(e, t, d) {
                    if ("function" == typeof t) return s(e, null, t);
                    t || (t = {}), d = n(d || r);
                    var a = e._writableState,
                        c = e._readableState,
                        p = t.readable || !1 !== t.readable && e.readable,
                        l = t.writable || !1 !== t.writable && e.writable,
                        u = function() {
                            e.writable || f()
                        },
                        f = function() {
                            l = !1, p || d.call(e)
                        },
                        h = function() {
                            p = !1, l || d.call(e)
                        },
                        m = function(t) {
                            d.call(e, t ? new Error("exited with error code: " + t) : null)
                        },
                        g = function() {
                            return p && !(c && c.ended) ? d.call(e, new Error("premature close")) : l && !(a && a.ended) ? d.call(e, new Error("premature close")) : void 0
                        },
                        _ = function() {
                            e.req.on("finish", f)
                        };
                    return o(e) ? (e.on("complete", f), e.on("abort", g), e.req ? _() : e.on("request", _)) : l && !a && (e.on("end", u), e.on("close", u)), i(e) && e.on("exit", m), e.on("end", h), e.on("finish", f), !1 !== t.error && e.on("error", d), e.on("close", g),
                        function() {
                            e.removeListener("complete", f), e.removeListener("abort", g), e.removeListener("request", _), e.req && e.req.removeListener("finish", f), e.removeListener("end", u), e.removeListener("close", u), e.removeListener("finish", f), e.removeListener("exit", m), e.removeListener("end", h), e.removeListener("error", d), e.removeListener("close", g)
                        }
                };
            t.exports = s
        }, {
            once: 59
        }],
        33: [function(e, t) {
            function n() {
                this._events = this._events || {}, this._maxListeners = this._maxListeners || void 0
            }

            function r(e) {
                return "function" == typeof e
            }

            function o(e) {
                return "number" == typeof e
            }

            function s(e) {
                return "object" == typeof e && null !== e
            }

            function d(e) {
                return void 0 === e
            }
            t.exports = n, n.EventEmitter = n, n.prototype._events = void 0, n.prototype._maxListeners = void 0, n.defaultMaxListeners = 10, n.prototype.setMaxListeners = function(e) {
                if (!o(e) || 0 > e || isNaN(e)) throw TypeError("n must be a positive number");
                return this._maxListeners = e, this
            }, n.prototype.emit = function(e) {
                var t, n, o, a, c, i;
                if (this._events || (this._events = {}), "error" === e && (!this._events.error || s(this._events.error) && !this._events.error.length))
                    if (t = arguments[1], t instanceof Error) throw t;
                    else {
                        var p = new Error("Uncaught, unspecified \"error\" event. (" + t + ")");
                        throw p.context = t, p
                    }
                if (n = this._events[e], d(n)) return !1;
                if (r(n)) switch (arguments.length) {
                    case 1:
                        n.call(this);
                        break;
                    case 2:
                        n.call(this, arguments[1]);
                        break;
                    case 3:
                        n.call(this, arguments[1], arguments[2]);
                        break;
                    default:
                        a = Array.prototype.slice.call(arguments, 1), n.apply(this, a);
                } else if (s(n))
                    for (a = Array.prototype.slice.call(arguments, 1), i = n.slice(), o = i.length, c = 0; c < o; c++) i[c].apply(this, a);
                return !0
            }, n.prototype.addListener = function(e, t) {
                var o;
                if (!r(t)) throw TypeError("listener must be a function");
                return this._events || (this._events = {}), this._events.newListener && this.emit("newListener", e, r(t.listener) ? t.listener : t), this._events[e] ? s(this._events[e]) ? this._events[e].push(t) : this._events[e] = [this._events[e], t] : this._events[e] = t, s(this._events[e]) && !this._events[e].warned && (o = d(this._maxListeners) ? n.defaultMaxListeners : this._maxListeners, o && 0 < o && this._events[e].length > o && (this._events[e].warned = !0, console.error("(node) warning: possible EventEmitter memory leak detected. %d listeners added. Use emitter.setMaxListeners() to increase limit.", this._events[e].length), "function" == typeof console.trace && console.trace())), this
            }, n.prototype.on = n.prototype.addListener, n.prototype.once = function(e, t) {
                function n() {
                    this.removeListener(e, n), o || (o = !0, t.apply(this, arguments))
                }
                if (!r(t)) throw TypeError("listener must be a function");
                var o = !1;
                return n.listener = t, this.on(e, n), this
            }, n.prototype.removeListener = function(e, t) {
                var n, o, d, a;
                if (!r(t)) throw TypeError("listener must be a function");
                if (!this._events || !this._events[e]) return this;
                if (n = this._events[e], d = n.length, o = -1, n === t || r(n.listener) && n.listener === t) delete this._events[e], this._events.removeListener && this.emit("removeListener", e, t);
                else if (s(n)) {
                    for (a = d; 0 < a--;)
                        if (n[a] === t || n[a].listener && n[a].listener === t) {
                            o = a;
                            break
                        }
                    if (0 > o) return this;
                    1 === n.length ? (n.length = 0, delete this._events[e]) : n.splice(o, 1), this._events.removeListener && this.emit("removeListener", e, t)
                }
                return this
            }, n.prototype.removeAllListeners = function(e) {
                var t, n;
                if (!this._events) return this;
                if (!this._events.removeListener) return 0 === arguments.length ? this._events = {} : this._events[e] && delete this._events[e], this;
                if (0 === arguments.length) {
                    for (t in this._events) "removeListener" !== t && this.removeAllListeners(t);
                    return this.removeAllListeners("removeListener"), this._events = {}, this
                }
                if (n = this._events[e], r(n)) this.removeListener(e, n);
                else if (n)
                    for (; n.length;) this.removeListener(e, n[n.length - 1]);
                return delete this._events[e], this
            }, n.prototype.listeners = function(e) {
                var t;
                return t = this._events && this._events[e] ? r(this._events[e]) ? [this._events[e]] : this._events[e].slice() : [], t
            }, n.prototype.listenerCount = function(e) {
                if (this._events) {
                    var t = this._events[e];
                    if (r(t)) return 1;
                    if (t) return t.length
                }
                return 0
            }, n.listenerCount = function(e, t) {
                return e.listenerCount(t)
            }
        }, {}],
        34: [function(e, t) {
            function n(e, t) {
                var o = this;
                return this instanceof n ? void(t = t || {}, r.call(this, t), this._offset = 0, this._ready = !1, this._file = e, this._size = e.size, this._chunkSize = t.chunkSize || s(this._size / 1e3, 204800), this.reader = new FileReader, this._generateHeaderBlocks(e, t, function(e, t) {
                    return e ? o.emit("error", e) : void(Array.isArray(t) && t.forEach(function(e) {
                        o.push(e)
                    }), o._ready = !0, o.emit("_ready"))
                })) : new n(e, t)
            }
            var r = e("readable-stream").Readable,
                o = e("inherits"),
                i = /^.*\.(\w+)$/,
                d = e("typedarray-to-buffer");
            o(n, r), t.exports = n, n.prototype._generateHeaderBlocks = function(e, t, n) {
                n(null, [])
            }, n.prototype._read = function() {
                if (!this._ready) return void this.once("_ready", this._read.bind(this));
                var e = this,
                    t = this.reader,
                    n = this._offset,
                    r = this._offset + this._chunkSize;
                return r > this._size && (r = this._size), n === this._size ? (this.destroy(), void this.push(null)) : void(t.onload = function() {
                    e._offset = r, e.push(d(t.result))
                }, t.onerror = function() {
                    e.emit("error", t.error)
                }, t.readAsArrayBuffer(this._file.slice(n, r)))
            }, n.prototype.destroy = function() {
                if (this._file = null, this.reader) {
                    this.reader.onload = null, this.reader.onerror = null;
                    try {
                        this.reader.abort()
                    } catch (t) {}
                }
                this.reader = null
            }
        }, {
            inherits: 40,
            "readable-stream": 82,
            "typedarray-to-buffer": 108
        }],
        35: [function(e, t) {
            t.exports = function(e, t) {
                function n(e, r) {
                    return e.reduce(function(e, o) {
                        return Array.isArray(o) && r < t ? e.concat(n(o, r + 1)) : e.concat(o)
                    }, [])
                }
                return t = "number" == typeof t ? t : Infinity, t ? n(e, 1) : Array.isArray(e) ? e.map(function(e) {
                    return e
                }) : e
            }
        }, {}],
        36: [function(e, t) {
            t.exports = function() {
                if ("undefined" == typeof window) return null;
                var e = {
                    RTCPeerConnection: window.RTCPeerConnection || window.mozRTCPeerConnection || window.webkitRTCPeerConnection,
                    RTCSessionDescription: window.RTCSessionDescription || window.mozRTCSessionDescription || window.webkitRTCSessionDescription,
                    RTCIceCandidate: window.RTCIceCandidate || window.mozRTCIceCandidate || window.webkitRTCIceCandidate
                };
                return e.RTCPeerConnection ? e : null
            }
        }, {}],
        37: [function(e, t) {
            function n(e) {
                if ("string" == typeof e && (e = o.parse(e)), e.protocol || (e.protocol = "https:"), "https:" !== e.protocol) throw new Error("Protocol \"" + e.protocol + "\" not supported. Expected \"https:\"");
                return e
            }
            var r = e("http"),
                o = e("url"),
                i = t.exports;
            for (var s in r) r.hasOwnProperty(s) && (i[s] = r[s]);
            i.request = function(e, t) {
                return e = n(e), r.request.call(this, e, t)
            }, i.get = function(e, t) {
                return e = n(e), r.get.call(this, e, t)
            }
        }, {
            http: 95,
            url: 112
        }],
        38: [function(e, o, i) {
            i.read = function(t, r, o, a, c) {
                var p = 8 * c - a - 1,
                    l = (1 << p) - 1,
                    u = l >> 1,
                    f = -7,
                    h = o ? c - 1 : 0,
                    i = o ? -1 : 1,
                    d = t[r + h],
                    s, e;
                for (h += i, s = d & (1 << -f) - 1, d >>= -f, f += p; 0 < f; s = 256 * s + t[r + h], h += i, f -= 8);
                for (e = s & (1 << -f) - 1, s >>= -f, f += a; 0 < f; e = 256 * e + t[r + h], h += i, f -= 8);
                if (0 === s) s = 1 - u;
                else {
                    if (s === l) return e ? NaN : (d ? -1 : 1) * Infinity;
                    e += n(2, a), s -= u
                }
                return (d ? -1 : 1) * e * n(2, s - a)
            }, i.write = function(o, a, p, l, u, f) {
                var h = 8 * f - u - 1,
                    g = (1 << h) - 1,
                    _ = g >> 1,
                    y = 23 === u ? 5.960464477539063e-8 - 6.617444900424222e-24 : 0,
                    b = l ? 0 : f - 1,
                    i = l ? 1 : -1,
                    d = 0 > a || 0 === a && 0 > 1 / a ? 1 : 0,
                    s, w, m;
                for (a = t(a), isNaN(a) || a === Infinity ? (w = isNaN(a) ? 1 : 0, s = g) : (s = r(Math.log(a) / Math.LN2), 1 > a * (m = n(2, -s)) && (s--, m *= 2), a += 1 <= s + _ ? y / m : y * n(2, 1 - _), 2 <= a * m && (s++, m /= 2), s + _ >= g ? (w = 0, s = g) : 1 <= s + _ ? (w = (a * m - 1) * n(2, u), s += _) : (w = a * n(2, _ - 1) * n(2, u), s = 0)); 8 <= u; o[p + b] = 255 & w, b += i, w /= 256, u -= 8);
                for (s = s << u | w, h += u; 0 < h; o[p + b] = 255 & s, b += i, s /= 256, h -= 8);
                o[p + b - i] |= 128 * d
            }
        }, {}],
        39: [function(e, t) {
            (function(e) {
                function n(e) {
                    if (!(this instanceof n)) return new n(e);
                    if (this.store = e, this.chunkLength = e.chunkLength, !this.store || !this.store.get || !this.store.put) throw new Error("First argument must be abstract-chunk-store compliant");
                    this.mem = []
                }

                function r(t, n, r) {
                    e.nextTick(function() {
                        t && t(n, r)
                    })
                }
                t.exports = n, n.prototype.put = function(e, t, n) {
                    var r = this;
                    r.mem[e] = t, r.store.put(e, t, function(t) {
                        r.mem[e] = null, n && n(t)
                    })
                }, n.prototype.get = function(e, t, n) {
                    if ("function" == typeof t) return this.get(e, null, t);
                    var o = t && t.offset || 0,
                        i = t && t.length && o + t.length,
                        s = this.mem[e];
                    return s ? r(n, null, t ? s.slice(o, i) : s) : void this.store.get(e, t, n)
                }, n.prototype.close = function(e) {
                    this.store.close(e)
                }, n.prototype.destroy = function(e) {
                    this.store.destroy(e)
                }
            }).call(this, e("_process"))
        }, {
            _process: 65
        }],
        40: [function(e, t) {
            t.exports = "function" == typeof Object.create ? function(e, t) {
                e.super_ = t, e.prototype = Object.create(t.prototype, {
                    constructor: {
                        value: e,
                        enumerable: !1,
                        writable: !0,
                        configurable: !0
                    }
                })
            } : function(e, t) {
                e.super_ = t;
                var n = function() {};
                n.prototype = t.prototype, e.prototype = new n, e.prototype.constructor = e
            }
        }, {}],
        41: [function(e, t) {
            t.exports = function(e) {
                for (var t = 0, n = e.length; t < n; ++t)
                    if (e.charCodeAt(t) > 127) return !1;
                return !0
            }
        }, {}],
        42: [function(e, t) {
            function n(e) {
                return !!e.constructor && "function" == typeof e.constructor.isBuffer && e.constructor.isBuffer(e)
            }

            function r(e) {
                return "function" == typeof e.readFloatLE && "function" == typeof e.slice && n(e.slice(0, 0))
            }
            t.exports = function(e) {
                return null != e && (n(e) || r(e) || !!e._isBuffer)
            }
        }, {}],
        43: [function(e, t) {
            "use strict";

            function n(e) {
                return r.existsSync(e) && r.statSync(e).isFile()
            }
            var r = e("fs");
            t.exports = function(e, t) {
                return t ? void r.stat(e, function(e, n) {
                    return e ? t(e) : t(null, n.isFile())
                }) : n(e)
            }, t.exports.sync = n
        }, {
            fs: 22
        }],
        44: [function(e, t) {
            function n(e) {
                return r(e) || o(e)
            }

            function r(e) {
                return e instanceof Int8Array || e instanceof Int16Array || e instanceof Int32Array || e instanceof Uint8Array || e instanceof Uint8ClampedArray || e instanceof Uint16Array || e instanceof Uint32Array || e instanceof Float32Array || e instanceof Float64Array
            }

            function o(e) {
                return s[i.call(e)]
            }
            t.exports = n, n.strict = r, n.loose = o;
            var i = Object.prototype.toString,
                s = {
                    "[object Int8Array]": !0,
                    "[object Int16Array]": !0,
                    "[object Int32Array]": !0,
                    "[object Uint8Array]": !0,
                    "[object Uint8ClampedArray]": !0,
                    "[object Uint16Array]": !0,
                    "[object Uint32Array]": !0,
                    "[object Float32Array]": !0,
                    "[object Float64Array]": !0
                }
        }, {}],
        45: [function(e, t) {
            var n = {}.toString;
            t.exports = Array.isArray || function(e) {
                return "[object Array]" == n.call(e)
            }
        }, {}],
        46: [function(e, t, n) {
            "use strict";
            n.regex = n.re = /^npm-debug\.log$|^\..*\.swp$|^\.DS_Store$|^\.AppleDouble$|^\.LSOverride$|^Icon\r$|^\._.*|^\.Spotlight-V100(?:$|\/)|\.Trashes|^__MACOSX$|~$|^Thumbs\.db$|^ehthumbs\.db$|^Desktop\.ini$|^@eaDir$/, n.is = (e) => n.re.test(e), n.not = (e) => !n.is(e)
        }, {}],
        47: [function(e, t) {
            function n(e) {
                var t = {},
                    n = e.split("magnet:?")[1],
                    i = n && 0 <= n.length ? n.split("&") : [];
                i.forEach(function(e) {
                    var n = e.split("=");
                    if (2 === n.length) {
                        var r = n[0],
                            o = n[1];
                        if ("dn" === r && (o = decodeURIComponent(o).replace(/\+/g, " ")), ("tr" === r || "xs" === r || "as" === r || "ws" === r) && (o = decodeURIComponent(o)), "kt" === r && (o = decodeURIComponent(o).split("+")), "ix" === r && (o = +o), !t[r]) t[r] = o;
                        else if (Array.isArray(t[r])) t[r].push(o);
                        else {
                            var i = t[r];
                            t[r] = [i, o]
                        }
                    }
                });
                var d;
                if (t.xt) {
                    var a = Array.isArray(t.xt) ? t.xt : [t.xt];
                    a.forEach(function(e) {
                        if (d = e.match(/^urn:btih:(.{40})/)) t.infoHash = d[1].toLowerCase();
                        else if (d = e.match(/^urn:btih:(.{32})/)) {
                            var n = r.decode(d[1]);
                            t.infoHash = o.from(n, "binary").toString("hex")
                        }
                    })
                }
                return t.infoHash && (t.infoHashBuffer = o.from(t.infoHash, "hex")), t.dn && (t.name = t.dn), t.kt && (t.keywords = t.kt), t.announce = "string" == typeof t.tr ? [t.tr] : Array.isArray(t.tr) ? t.tr : [], t.urlList = [], ("string" == typeof t.as || Array.isArray(t.as)) && (t.urlList = t.urlList.concat(t.as)), ("string" == typeof t.ws || Array.isArray(t.ws)) && (t.urlList = t.urlList.concat(t.ws)), s(t.announce), s(t.urlList), t
            }
            t.exports = n, t.exports.decode = n, t.exports.encode = function(e) {
                e = i(e), e.infoHashBuffer && (e.xt = "urn:btih:" + e.infoHashBuffer.toString("hex")), e.infoHash && (e.xt = "urn:btih:" + e.infoHash), e.name && (e.dn = e.name), e.keywords && (e.kt = e.keywords), e.announce && (e.tr = e.announce), e.urlList && (e.ws = e.urlList, delete e.as);
                var t = "magnet:?";
                return Object.keys(e).filter(function(e) {
                    return 2 === e.length
                }).forEach(function(n, r) {
                    var o = Array.isArray(e[n]) ? e[n] : [e[n]];
                    o.forEach(function(e, o) {
                        (0 < r || 0 < o) && ("kt" !== n || 0 === o) && (t += "&"), "dn" === n && (e = encodeURIComponent(e).replace(/%20/g, "+")), ("tr" === n || "xs" === n || "as" === n || "ws" === n) && (e = encodeURIComponent(e)), "kt" === n && (e = encodeURIComponent(e)), t += "kt" === n && 0 < o ? "+" + e : n + "=" + e
                    })
                }), t
            };
            var r = e("thirty-two"),
                o = e("safe-buffer").Buffer,
                i = e("xtend"),
                s = e("uniq")
        }, {
            "safe-buffer": 88,
            "thirty-two": 103,
            uniq: 110,
            xtend: 119
        }],
        48: [function(e, t) {
            function n(e, t) {
                var r = this;
                if (!(r instanceof n)) return new n(e, t);
                if (!d) throw new Error("web browser lacks MediaSource support");
                t || (t = {}), r._bufferDuration = t.bufferDuration || a, r._elem = e, r._mediaSource = new d, r._streams = [], r.detailedError = null, r._errorHandler = function() {
                    r._elem.removeEventListener("error", r._errorHandler);
                    var e = r._streams.slice();
                    e.forEach(function(e) {
                        e.destroy(r._elem.error)
                    })
                }, r._elem.addEventListener("error", r._errorHandler), r._elem.src = window.URL.createObjectURL(r._mediaSource)
            }

            function r(e, t) {
                var n = this;
                if (i.Writable.call(n), n._wrapper = e, n._elem = e._elem, n._mediaSource = e._mediaSource, n._allStreams = e._streams, n._allStreams.push(n), n._bufferDuration = e._bufferDuration, n._sourceBuffer = null, n._openHandler = function() {
                        n._onSourceOpen()
                    }, n._flowHandler = function() {
                        n._flow()
                    }, "string" == typeof t) n._type = t, "open" === n._mediaSource.readyState ? n._createSourceBuffer() : n._mediaSource.addEventListener("sourceopen", n._openHandler);
                else if (null === t._sourceBuffer) t.destroy(), n._type = t._type, n._mediaSource.addEventListener("sourceopen", n._openHandler);
                else if (t._sourceBuffer) t.destroy(), n._type = t._type, n._sourceBuffer = t._sourceBuffer, n._sourceBuffer.addEventListener("updateend", n._flowHandler);
                else throw new Error("The argument to MediaElementWrapper.createWriteStream must be a string or a previous stream returned from that function");
                n._elem.addEventListener("timeupdate", n._flowHandler), n.on("error", function(e) {
                    n._wrapper.error(e)
                }), n.on("finish", function() {
                    if (!n.destroyed && (n._finished = !0, n._allStreams.every(function(e) {
                            return e._finished
                        }))) try {
                        n._mediaSource.endOfStream()
                    } catch (e) {}
                })
            }
            t.exports = n;
            var o = e("inherits"),
                i = e("readable-stream"),
                s = e("to-arraybuffer"),
                d = "undefined" != typeof window && window.MediaSource,
                a = 60;
            n.prototype.createWriteStream = function(e) {
                var t = this;
                return new r(t, e)
            }, n.prototype.error = function(e) {
                var t = this;
                t.detailedError || (t.detailedError = e);
                try {
                    t._mediaSource.endOfStream("decode")
                } catch (e) {}
            }, o(r, i.Writable), r.prototype._onSourceOpen = function() {
                var e = this;
                e.destroyed || (e._mediaSource.removeEventListener("sourceopen", e._openHandler), e._createSourceBuffer())
            }, r.prototype.destroy = function(e) {
                var t = this;
                t.destroyed || (t.destroyed = !0, t._allStreams.splice(t._allStreams.indexOf(t), 1), t._mediaSource.removeEventListener("sourceopen", t._openHandler), t._elem.removeEventListener("timeupdate", t._flowHandler), t._sourceBuffer && (t._sourceBuffer.removeEventListener("updateend", t._flowHandler), "open" === t._mediaSource.readyState && t._sourceBuffer.abort()), e && t.emit("error", e), t.emit("close"))
            }, r.prototype._createSourceBuffer = function() {
                var e = this;
                if (!e.destroyed)
                    if (!d.isTypeSupported(e._type)) e.destroy(new Error("The provided type is not supported"));
                    else if (e._sourceBuffer = e._mediaSource.addSourceBuffer(e._type), e._sourceBuffer.addEventListener("updateend", e._flowHandler), e._cb) {
                    var t = e._cb;
                    e._cb = null, t()
                }
            }, r.prototype._write = function(e, t, n) {
                var r = this;
                if (!r.destroyed) {
                    if (!r._sourceBuffer) return void(r._cb = function(o) {
                        return o ? n(o) : void r._write(e, t, n)
                    });
                    if (r._sourceBuffer.updating) return n(new Error("Cannot append buffer while source buffer updating"));
                    try {
                        r._sourceBuffer.appendBuffer(s(e))
                    } catch (e) {
                        return void r.destroy(e)
                    }
                    r._cb = n
                }
            }, r.prototype._flow = function() {
                var e = this;
                if (!(e.destroyed || !e._sourceBuffer || e._sourceBuffer.updating) && !("open" === e._mediaSource.readyState && e._getBufferDuration() > e._bufferDuration) && e._cb) {
                    var t = e._cb;
                    e._cb = null, t()
                }
            };
            r.prototype._getBufferDuration = function() {
                for (var e = this, t = e._sourceBuffer.buffered, n = e._elem.currentTime, r = -1, o = 0; o < t.length; o++) {
                    var i = t.start(o),
                        s = t.end(o) + 0;
                    if (i > n) break;
                    else(0 <= r || n <= s) && (r = s)
                }
                var d = r - n;
                return 0 > d && (d = 0), d
            }
        }, {
            inherits: 40,
            "readable-stream": 82,
            "to-arraybuffer": 105
        }],
        49: [function(e, t) {
            (function(e) {
                function n(e, t) {
                    if (!(this instanceof n)) return new n(e, t);
                    if (t || (t = {}), this.chunkLength = +e, !this.chunkLength) throw new Error("First argument must be a chunk length");
                    this.chunks = [], this.closed = !1, this.length = +t.length || Infinity, this.length !== Infinity && (this.lastChunkLength = this.length % this.chunkLength || this.chunkLength, this.lastChunkIndex = o(this.length / this.chunkLength) - 1)
                }

                function r(t, n, r) {
                    e.nextTick(function() {
                        t && t(n, r)
                    })
                }
                t.exports = n, n.prototype.put = function(e, t, n) {
                    if (this.closed) return r(n, new Error("Storage is closed"));
                    var o = e === this.lastChunkIndex;
                    return o && t.length !== this.lastChunkLength ? r(n, new Error("Last chunk length must be " + this.lastChunkLength)) : o || t.length === this.chunkLength ? void(this.chunks[e] = t, r(n, null)) : r(n, new Error("Chunk length must be " + this.chunkLength))
                }, n.prototype.get = function(e, t, n) {
                    if ("function" == typeof t) return this.get(e, null, t);
                    if (this.closed) return r(n, new Error("Storage is closed"));
                    var o = this.chunks[e];
                    if (!o) return r(n, new Error("Chunk not found"));
                    if (!t) return r(n, null, o);
                    var i = t.offset || 0,
                        s = t.length || o.length - i;
                    r(n, null, o.slice(i, s + i))
                }, n.prototype.close = n.prototype.destroy = function(e) {
                    return this.closed ? r(e, new Error("Storage is closed")) : void(this.closed = !0, this.chunks = null, r(e, null))
                }
            }).call(this, e("_process"))
        }, {
            _process: 65
        }],
        50: [function(e, t, n) {
            (function(t) {
                function o(e, t, n) {
                    for (var r = t; r < n; r++) e[r] = 0
                }

                function i(e, t, n) {
                    t.writeUInt32BE(r((e.getTime() + y) / 1e3), n)
                }

                function s(e, t, n) {
                    t.writeUInt16BE(r(e) % 65536, n), t.writeUInt16BE(r(256 * (256 * e)) % 65536, n + 2)
                }

                function a(e, t, n) {
                    t[n] = r(e) % 256, t[n + 1] = r(256 * e) % 256
                }

                function c(e, t, n) {
                    e || (e = [0, 0, 0, 0, 0, 0, 0, 0, 0]);
                    for (var r = 0; r < e.length; r++) s(e[r], t, n + 4 * r)
                }

                function p(e, n, r) {
                    var o = new t(e, "utf8");
                    o.copy(n, r), n[r + o.length] = 0
                }

                function l(e) {
                    for (var t = Array(e.length / 4), n = 0; n < t.length; n++) t[n] = f(e, 4 * n);
                    return t
                }

                function u(e, t) {
                    return new Date(1e3 * e.readUInt32BE(t) - y)
                }

                function f(e, t) {
                    return e.readUInt16BE(t) + e.readUInt16BE(t + 2) / 65536
                }

                function h(e, t) {
                    return e[t] + e[t + 1] / 256
                }

                function m(e, t, n) {
                    var r;
                    for (r = 0; r < n && !(0 === e[t + r]); r++);
                    return e.toString("utf8", t, t + r)
                }
                var g = e("./index"),
                    _ = e("./descriptor"),
                    y = 2.0828448e12;
                n.fullBoxes = {};
                ["mvhd", "tkhd", "mdhd", "vmhd", "smhd", "stsd", "esds", "stsz", "stco", "stss", "stts", "ctts", "stsc", "dref", "elst", "hdlr", "mehd", "trex", "mfhd", "tfhd", "tfdt", "trun"].forEach(function(e) {
                    n.fullBoxes[e] = !0
                }), n.ftyp = {}, n.ftyp.encode = function(e, r, o) {
                    r = r ? r.slice(o) : new t(n.ftyp.encodingLength(e));
                    var s = e.compatibleBrands || [];
                    r.write(e.brand, 0, 4, "ascii"), r.writeUInt32BE(e.brandVersion, 4);
                    for (var d = 0; d < s.length; d++) r.write(s[d], 8 + 4 * d, 4, "ascii");
                    return n.ftyp.encode.bytes = 8 + 4 * s.length, r
                }, n.ftyp.decode = function(e, t) {
                    e = e.slice(t);
                    for (var n = e.toString("ascii", 0, 4), r = e.readUInt32BE(4), o = [], s = 8; s < e.length; s += 4) o.push(e.toString("ascii", s, s + 4));
                    return {
                        brand: n,
                        brandVersion: r,
                        compatibleBrands: o
                    }
                }, n.ftyp.encodingLength = function(e) {
                    return 8 + 4 * (e.compatibleBrands || []).length
                }, n.mvhd = {}, n.mvhd.encode = function(e, r, d) {
                    return r = r ? r.slice(d) : new t(96), i(e.ctime || new Date, r, 0), i(e.mtime || new Date, r, 4), r.writeUInt32BE(e.timeScale || 0, 8), r.writeUInt32BE(e.duration || 0, 12), s(e.preferredRate || 0, r, 16), a(e.preferredVolume || 0, r, 20), o(r, 22, 32), c(e.matrix, r, 32), r.writeUInt32BE(e.previewTime || 0, 68), r.writeUInt32BE(e.previewDuration || 0, 72), r.writeUInt32BE(e.posterTime || 0, 76), r.writeUInt32BE(e.selectionTime || 0, 80), r.writeUInt32BE(e.selectionDuration || 0, 84), r.writeUInt32BE(e.currentTime || 0, 88), r.writeUInt32BE(e.nextTrackId || 0, 92), n.mvhd.encode.bytes = 96, r
                }, n.mvhd.decode = function(e, t) {
                    return e = e.slice(t), {
                        ctime: u(e, 0),
                        mtime: u(e, 4),
                        timeScale: e.readUInt32BE(8),
                        duration: e.readUInt32BE(12),
                        preferredRate: f(e, 16),
                        preferredVolume: h(e, 20),
                        matrix: l(e.slice(32, 68)),
                        previewTime: e.readUInt32BE(68),
                        previewDuration: e.readUInt32BE(72),
                        posterTime: e.readUInt32BE(76),
                        selectionTime: e.readUInt32BE(80),
                        selectionDuration: e.readUInt32BE(84),
                        currentTime: e.readUInt32BE(88),
                        nextTrackId: e.readUInt32BE(92)
                    }
                }, n.mvhd.encodingLength = function() {
                    return 96
                }, n.tkhd = {}, n.tkhd.encode = function(e, r, s) {
                    return r = r ? r.slice(s) : new t(80), i(e.ctime || new Date, r, 0), i(e.mtime || new Date, r, 4), r.writeUInt32BE(e.trackId || 0, 8), o(r, 12, 16), r.writeUInt32BE(e.duration || 0, 16), o(r, 20, 28), r.writeUInt16BE(e.layer || 0, 28), r.writeUInt16BE(e.alternateGroup || 0, 30), r.writeUInt16BE(e.volume || 0, 32), c(e.matrix, r, 36), r.writeUInt32BE(e.trackWidth || 0, 72), r.writeUInt32BE(e.trackHeight || 0, 76), n.tkhd.encode.bytes = 80, r
                }, n.tkhd.decode = function(e, t) {
                    return e = e.slice(t), {
                        ctime: u(e, 0),
                        mtime: u(e, 4),
                        trackId: e.readUInt32BE(8),
                        duration: e.readUInt32BE(16),
                        layer: e.readUInt16BE(28),
                        alternateGroup: e.readUInt16BE(30),
                        volume: e.readUInt16BE(32),
                        matrix: l(e.slice(36, 72)),
                        trackWidth: e.readUInt32BE(72),
                        trackHeight: e.readUInt32BE(76)
                    }
                }, n.tkhd.encodingLength = function() {
                    return 80
                }, n.mdhd = {}, n.mdhd.encode = function(e, r, o) {
                    return r = r ? r.slice(o) : new t(20), i(e.ctime || new Date, r, 0), i(e.mtime || new Date, r, 4), r.writeUInt32BE(e.timeScale || 0, 8), r.writeUInt32BE(e.duration || 0, 12), r.writeUInt16BE(e.language || 0, 16), r.writeUInt16BE(e.quality || 0, 18), n.mdhd.encode.bytes = 20, r
                }, n.mdhd.decode = function(e, t) {
                    return e = e.slice(t), {
                        ctime: u(e, 0),
                        mtime: u(e, 4),
                        timeScale: e.readUInt32BE(8),
                        duration: e.readUInt32BE(12),
                        language: e.readUInt16BE(16),
                        quality: e.readUInt16BE(18)
                    }
                }, n.mdhd.encodingLength = function() {
                    return 20
                }, n.vmhd = {}, n.vmhd.encode = function(e, r, o) {
                    r = r ? r.slice(o) : new t(8), r.writeUInt16BE(e.graphicsMode || 0, 0);
                    var i = e.opcolor || [0, 0, 0];
                    return r.writeUInt16BE(i[0], 2), r.writeUInt16BE(i[1], 4), r.writeUInt16BE(i[2], 6), n.vmhd.encode.bytes = 8, r
                }, n.vmhd.decode = function(e, t) {
                    return e = e.slice(t), {
                        graphicsMode: e.readUInt16BE(0),
                        opcolor: [e.readUInt16BE(2), e.readUInt16BE(4), e.readUInt16BE(6)]
                    }
                }, n.vmhd.encodingLength = function() {
                    return 8
                }, n.smhd = {}, n.smhd.encode = function(e, r, i) {
                    return r = r ? r.slice(i) : new t(4), r.writeUInt16BE(e.balance || 0, 0), o(r, 2, 4), n.smhd.encode.bytes = 4, r
                }, n.smhd.decode = function(e, t) {
                    return e = e.slice(t), {
                        balance: e.readUInt16BE(0)
                    }
                }, n.smhd.encodingLength = function() {
                    return 4
                }, n.stsd = {}, n.stsd.encode = function(e, r, o) {
                    r = r ? r.slice(o) : new t(n.stsd.encodingLength(e));
                    var s = e.entries || [];
                    r.writeUInt32BE(s.length, 0);
                    for (var d = 4, a = 0, i; a < s.length; a++) i = s[a], g.encode(i, r, d), d += g.encode.bytes;
                    return n.stsd.encode.bytes = d, r
                }, n.stsd.decode = function(e, t, n) {
                    e = e.slice(t);
                    for (var r = e.readUInt32BE(0), o = Array(r), s = 4, d = 0, i; d < r; d++) i = g.decode(e, s, n), o[d] = i, s += i.length;
                    return {
                        entries: o
                    }
                }, n.stsd.encodingLength = function(e) {
                    var t = 4;
                    if (!e.entries) return t;
                    for (var n = 0; n < e.entries.length; n++) t += g.encodingLength(e.entries[n]);
                    return t
                }, n.avc1 = n.VisualSampleEntry = {}, n.VisualSampleEntry.encode = function(e, r, i) {
                    r = r ? r.slice(i) : new t(n.VisualSampleEntry.encodingLength(e)), o(r, 0, 6), r.writeUInt16BE(e.dataReferenceIndex || 0, 6), o(r, 8, 24), r.writeUInt16BE(e.width || 0, 24), r.writeUInt16BE(e.height || 0, 26), r.writeUInt32BE(e.hResolution || 4718592, 28), r.writeUInt32BE(e.vResolution || 4718592, 32), o(r, 36, 40), r.writeUInt16BE(e.frameCount || 1, 40);
                    var s = e.compressorName || "",
                        a = d(s.length, 31);
                    r.writeUInt8(a, 42), r.write(s, 43, a, "utf8"), r.writeUInt16BE(e.depth || 24, 74), r.writeInt16BE(-1, 76);
                    var c = 78,
                        p = e.children || [];
                    p.forEach(function(e) {
                        g.encode(e, r, c), c += g.encode.bytes
                    }), n.VisualSampleEntry.encode.bytes = c
                }, n.VisualSampleEntry.decode = function(e, t, n) {
                    e = e.slice(t);
                    for (var r = n - t, o = d(e.readUInt8(42), 31), i = {
                            dataReferenceIndex: e.readUInt16BE(6),
                            width: e.readUInt16BE(24),
                            height: e.readUInt16BE(26),
                            hResolution: e.readUInt32BE(28),
                            vResolution: e.readUInt32BE(32),
                            frameCount: e.readUInt16BE(40),
                            compressorName: e.toString("utf8", 43, 43 + o),
                            depth: e.readUInt16BE(74),
                            children: []
                        }, s = 78; 8 <= r - s;) {
                        var a = g.decode(e, s, r);
                        i.children.push(a), i[a.type] = a, s += a.length
                    }
                    return i
                }, n.VisualSampleEntry.encodingLength = function(e) {
                    var t = 78,
                        n = e.children || [];
                    return n.forEach(function(e) {
                        t += g.encodingLength(e)
                    }), t
                }, n.avcC = {}, n.avcC.encode = function(e, r, o) {
                    r = r ? r.slice(o) : t(e.buffer.length), e.buffer.copy(r), n.avcC.encode.bytes = e.buffer.length
                }, n.avcC.decode = function(e, n, r) {
                    return e = e.slice(n, r), {
                        mimeCodec: e.toString("hex", 1, 4),
                        buffer: new t(e)
                    }
                }, n.avcC.encodingLength = function(e) {
                    return e.buffer.length
                }, n.mp4a = n.AudioSampleEntry = {}, n.AudioSampleEntry.encode = function(e, r, i) {
                    r = r ? r.slice(i) : new t(n.AudioSampleEntry.encodingLength(e)), o(r, 0, 6), r.writeUInt16BE(e.dataReferenceIndex || 0, 6), o(r, 8, 16), r.writeUInt16BE(e.channelCount || 2, 16), r.writeUInt16BE(e.sampleSize || 16, 18), o(r, 20, 24), r.writeUInt32BE(e.sampleRate || 0, 24);
                    var s = 28,
                        d = e.children || [];
                    d.forEach(function(e) {
                        g.encode(e, r, s), s += g.encode.bytes
                    }), n.AudioSampleEntry.encode.bytes = s
                }, n.AudioSampleEntry.decode = function(e, t, n) {
                    e = e.slice(t, n);
                    for (var r = n - t, o = {
                            dataReferenceIndex: e.readUInt16BE(6),
                            channelCount: e.readUInt16BE(16),
                            sampleSize: e.readUInt16BE(18),
                            sampleRate: e.readUInt32BE(24),
                            children: []
                        }, i = 28; 8 <= r - i;) {
                        var s = g.decode(e, i, r);
                        o.children.push(s), o[s.type] = s, i += s.length
                    }
                    return o
                }, n.AudioSampleEntry.encodingLength = function(e) {
                    var t = 28,
                        n = e.children || [];
                    return n.forEach(function(e) {
                        t += g.encodingLength(e)
                    }), t
                }, n.esds = {}, n.esds.encode = function(e, r, o) {
                    r = r ? r.slice(o) : t(e.buffer.length), e.buffer.copy(r, 0), n.esds.encode.bytes = e.buffer.length
                }, n.esds.decode = function(e, n, r) {
                    e = e.slice(n, r);
                    var o = _.Descriptor.decode(e, 0, e.length),
                        i = "ESDescriptor" === o.tagName ? o : {},
                        s = i.DecoderConfigDescriptor || {},
                        d = s.oti || 0,
                        a = s.DecoderSpecificInfo,
                        c = a ? (248 & a.buffer.readUInt8(0)) >> 3 : 0,
                        p = null;
                    return d && (p = d.toString(16), c && (p += "." + c)), {
                        mimeCodec: p,
                        buffer: new t(e.slice(0))
                    }
                }, n.esds.encodingLength = function(e) {
                    return e.buffer.length
                }, n.stsz = {}, n.stsz.encode = function(e, r, o) {
                    var s = e.entries || [];
                    r = r ? r.slice(o) : t(n.stsz.encodingLength(e)), r.writeUInt32BE(0, 0), r.writeUInt32BE(s.length, 4);
                    for (var d = 0; d < s.length; d++) r.writeUInt32BE(s[d], 4 * d + 8);
                    return n.stsz.encode.bytes = 8 + 4 * s.length, r
                }, n.stsz.decode = function(e, t) {
                    e = e.slice(t);
                    for (var n = e.readUInt32BE(0), r = e.readUInt32BE(4), o = Array(r), s = 0; s < r; s++) o[s] = 0 === n ? e.readUInt32BE(4 * s + 8) : n;
                    return {
                        entries: o
                    }
                }, n.stsz.encodingLength = function(e) {
                    return 8 + 4 * e.entries.length
                }, n.stss = n.stco = {}, n.stco.encode = function(e, r, o) {
                    var s = e.entries || [];
                    r = r ? r.slice(o) : new t(n.stco.encodingLength(e)), r.writeUInt32BE(s.length, 0);
                    for (var d = 0; d < s.length; d++) r.writeUInt32BE(s[d], 4 * d + 4);
                    return n.stco.encode.bytes = 4 + 4 * s.length, r
                }, n.stco.decode = function(e, t) {
                    e = e.slice(t);
                    for (var n = e.readUInt32BE(0), r = Array(n), o = 0; o < n; o++) r[o] = e.readUInt32BE(4 * o + 4);
                    return {
                        entries: r
                    }
                }, n.stco.encodingLength = function(e) {
                    return 4 + 4 * e.entries.length
                }, n.stts = {}, n.stts.encode = function(e, r, o) {
                    var s = e.entries || [];
                    r = r ? r.slice(o) : new t(n.stts.encodingLength(e)), r.writeUInt32BE(s.length, 0);
                    for (var d = 0, i; d < s.length; d++) i = 8 * d + 4, r.writeUInt32BE(s[d].count || 0, i), r.writeUInt32BE(s[d].duration || 0, i + 4);
                    return n.stts.encode.bytes = 4 + 8 * e.entries.length, r
                }, n.stts.decode = function(e, t) {
                    e = e.slice(t);
                    for (var n = e.readUInt32BE(0), r = Array(n), o = 0, i; o < n; o++) i = 8 * o + 4, r[o] = {
                        count: e.readUInt32BE(i),
                        duration: e.readUInt32BE(i + 4)
                    };
                    return {
                        entries: r
                    }
                }, n.stts.encodingLength = function(e) {
                    return 4 + 8 * e.entries.length
                }, n.ctts = {}, n.ctts.encode = function(e, r, o) {
                    var s = e.entries || [];
                    r = r ? r.slice(o) : new t(n.ctts.encodingLength(e)), r.writeUInt32BE(s.length, 0);
                    for (var d = 0, i; d < s.length; d++) i = 8 * d + 4, r.writeUInt32BE(s[d].count || 0, i), r.writeUInt32BE(s[d].compositionOffset || 0, i + 4);
                    return n.ctts.encode.bytes = 4 + 8 * s.length, r
                }, n.ctts.decode = function(e, t) {
                    e = e.slice(t);
                    for (var n = e.readUInt32BE(0), r = Array(n), o = 0, i; o < n; o++) i = 8 * o + 4, r[o] = {
                        count: e.readUInt32BE(i),
                        compositionOffset: e.readInt32BE(i + 4)
                    };
                    return {
                        entries: r
                    }
                }, n.ctts.encodingLength = function(e) {
                    return 4 + 8 * e.entries.length
                }, n.stsc = {}, n.stsc.encode = function(e, r, o) {
                    var s = e.entries || [];
                    r = r ? r.slice(o) : new t(n.stsc.encodingLength(e)), r.writeUInt32BE(s.length, 0);
                    for (var d = 0, i; d < s.length; d++) i = 12 * d + 4, r.writeUInt32BE(s[d].firstChunk || 0, i), r.writeUInt32BE(s[d].samplesPerChunk || 0, i + 4), r.writeUInt32BE(s[d].sampleDescriptionId || 0, i + 8);
                    return n.stsc.encode.bytes = 4 + 12 * s.length, r
                }, n.stsc.decode = function(e, t) {
                    e = e.slice(t);
                    for (var n = e.readUInt32BE(0), r = Array(n), o = 0, i; o < n; o++) i = 12 * o + 4, r[o] = {
                        firstChunk: e.readUInt32BE(i),
                        samplesPerChunk: e.readUInt32BE(i + 4),
                        sampleDescriptionId: e.readUInt32BE(i + 8)
                    };
                    return {
                        entries: r
                    }
                }, n.stsc.encodingLength = function(e) {
                    return 4 + 12 * e.entries.length
                }, n.dref = {}, n.dref.encode = function(e, r, o) {
                    r = r ? r.slice(o) : new t(n.dref.encodingLength(e));
                    var s = e.entries || [];
                    r.writeUInt32BE(s.length, 0);
                    for (var d = 4, a = 0; a < s.length; a++) {
                        var i = s[a],
                            c = (i.buf ? i.buf.length : 0) + 4 + 4;
                        r.writeUInt32BE(c, d), d += 4, r.write(i.type, d, 4, "ascii"), d += 4, i.buf && (i.buf.copy(r, d), d += i.buf.length)
                    }
                    return n.dref.encode.bytes = d, r
                }, n.dref.decode = function(e, t) {
                    e = e.slice(t);
                    for (var n = e.readUInt32BE(0), r = Array(n), o = 4, s = 0; s < n; s++) {
                        var i = e.readUInt32BE(o),
                            d = e.toString("ascii", o + 4, o + 8),
                            a = e.slice(o + 8, o + i);
                        o += i, r[s] = {
                            type: d,
                            buf: a
                        }
                    }
                    return {
                        entries: r
                    }
                }, n.dref.encodingLength = function(e) {
                    var t = 4;
                    if (!e.entries) return t;
                    for (var n = 0, r; n < e.entries.length; n++) r = e.entries[n].buf, t += (r ? r.length : 0) + 4 + 4;
                    return t
                }, n.elst = {}, n.elst.encode = function(e, r, o) {
                    var d = e.entries || [];
                    r = r ? r.slice(o) : new t(n.elst.encodingLength(e)), r.writeUInt32BE(d.length, 0);
                    for (var a = 0, i; a < d.length; a++) i = 12 * a + 4, r.writeUInt32BE(d[a].trackDuration || 0, i), r.writeUInt32BE(d[a].mediaTime || 0, i + 4), s(d[a].mediaRate || 0, r, i + 8);
                    return n.elst.encode.bytes = 4 + 12 * d.length, r
                }, n.elst.decode = function(e, t) {
                    e = e.slice(t);
                    for (var n = e.readUInt32BE(0), r = Array(n), o = 0, i; o < n; o++) i = 12 * o + 4, r[o] = {
                        trackDuration: e.readUInt32BE(i),
                        mediaTime: e.readInt32BE(i + 4),
                        mediaRate: f(e, i + 8)
                    };
                    return {
                        entries: r
                    }
                }, n.elst.encodingLength = function(e) {
                    return 4 + 12 * e.entries.length
                }, n.hdlr = {}, n.hdlr.encode = function(e, r, o) {
                    r = r ? r.slice(o) : new t(n.hdlr.encodingLength(e));
                    var i = 21 + (e.name || "").length;
                    return r.fill(0, 0, i), r.write(e.handlerType || "", 4, 4, "ascii"), p(e.name || "", r, 20), n.hdlr.encode.bytes = i, r
                }, n.hdlr.decode = function(e, t, n) {
                    return e = e.slice(t), {
                        handlerType: e.toString("ascii", 4, 8),
                        name: m(e, 20, n)
                    }
                }, n.hdlr.encodingLength = function(e) {
                    return 21 + (e.name || "").length
                }, n.mehd = {}, n.mehd.encode = function(e, r, o) {
                    return r = r ? r.slice(o) : new t(4), r.writeUInt32BE(e.fragmentDuration || 0, 0), n.mehd.encode.bytes = 4, r
                }, n.mehd.decode = function(e, t) {
                    return e = e.slice(t), {
                        fragmentDuration: e.readUInt32BE(0)
                    }
                }, n.mehd.encodingLength = function() {
                    return 4
                }, n.trex = {}, n.trex.encode = function(e, r, o) {
                    return r = r ? r.slice(o) : new t(20), r.writeUInt32BE(e.trackId || 0, 0), r.writeUInt32BE(e.defaultSampleDescriptionIndex || 0, 4), r.writeUInt32BE(e.defaultSampleDuration || 0, 8), r.writeUInt32BE(e.defaultSampleSize || 0, 12), r.writeUInt32BE(e.defaultSampleFlags || 0, 16), n.trex.encode.bytes = 20, r
                }, n.trex.decode = function(e, t) {
                    return e = e.slice(t), {
                        trackId: e.readUInt32BE(0),
                        defaultSampleDescriptionIndex: e.readUInt32BE(4),
                        defaultSampleDuration: e.readUInt32BE(8),
                        defaultSampleSize: e.readUInt32BE(12),
                        defaultSampleFlags: e.readUInt32BE(16)
                    }
                }, n.trex.encodingLength = function() {
                    return 20
                }, n.mfhd = {}, n.mfhd.encode = function(e, r, o) {
                    return r = r ? r.slice(o) : new t(4), r.writeUInt32BE(e.sequenceNumber || 0, 0), n.mfhd.encode.bytes = 4, r
                }, n.mfhd.decode = function(e) {
                    return {
                        sequenceNumber: e.readUint32BE(0)
                    }
                }, n.mfhd.encodingLength = function() {
                    return 4
                }, n.tfhd = {}, n.tfhd.encode = function(e, r, o) {
                    return r = r ? r.slice(o) : new t(4), r.writeUInt32BE(e.trackId, 0), n.tfhd.encode.bytes = 4, r
                }, n.tfhd.decode = function() {}, n.tfhd.encodingLength = function() {
                    return 4
                }, n.tfdt = {}, n.tfdt.encode = function(e, r, o) {
                    return r = r ? r.slice(o) : new t(4), r.writeUInt32BE(e.baseMediaDecodeTime || 0, 0), n.tfdt.encode.bytes = 4, r
                }, n.tfdt.decode = function() {}, n.tfdt.encodingLength = function() {
                    return 4
                }, n.trun = {}, n.trun.encode = function(e, r, o) {
                    r = r ? r.slice(o) : new t(8 + 16 * e.entries.length), r.writeUInt32BE(e.entries.length, 0), r.writeInt32BE(e.dataOffset, 4);
                    for (var s = 8, d = 0, i; d < e.entries.length; d++) i = e.entries[d], r.writeUInt32BE(i.sampleDuration, s), s += 4, r.writeUInt32BE(i.sampleSize, s), s += 4, r.writeUInt32BE(i.sampleFlags, s), s += 4, r.writeUInt32BE(i.sampleCompositionTimeOffset, s), s += 4;
                    n.trun.encode.bytes = s
                }, n.trun.decode = function() {}, n.trun.encodingLength = function(e) {
                    return 8 + 16 * e.entries.length
                }, n.mdat = {}, n.mdat.encode = function(e, t, r) {
                    e.buffer ? (e.buffer.copy(t, r), n.mdat.encode.bytes = e.buffer.length) : n.mdat.encode.bytes = n.mdat.encodingLength(e)
                }, n.mdat.decode = function(e, n, r) {
                    return {
                        buffer: new t(e.slice(n, r))
                    }
                }, n.mdat.encodingLength = function(e) {
                    return e.buffer ? e.buffer.length : e.contentLength
                }
            }).call(this, e("buffer").Buffer)
        }, {
            "./descriptor": 51,
            "./index": 52,
            buffer: 23
        }],
        51: [function(e, t, n) {
            (function(e) {
                var t = {
                    3: "ESDescriptor",
                    4: "DecoderConfigDescriptor",
                    5: "DecoderSpecificInfo",
                    6: "SLConfigDescriptor"
                };
                n.Descriptor = {}, n.Descriptor.decode = function(r, o, i) {
                    var s = r.readUInt8(o),
                        d = o + 1,
                        a = 0,
                        c;
                    do c = r.readUInt8(d++), a = a << 7 | 127 & c; while (128 & c);
                    var p = t[s],
                        l;
                    return l = n[p] ? n[p].decode(r, d, i) : {
                        buffer: new e(r.slice(d, d + a))
                    }, l.tag = s, l.tagName = p, l.length = d - o + a, l.contentsLen = a, l
                }, n.DescriptorArray = {}, n.DescriptorArray.decode = function(e, r, o) {
                    for (var i = r, s = {}; i + 2 <= o;) {
                        var d = n.Descriptor.decode(e, i, o);
                        i += d.length;
                        var a = t[d.tag] || "Descriptor" + d.tag;
                        s[a] = d
                    }
                    return s
                }, n.ESDescriptor = {}, n.ESDescriptor.decode = function(e, t, r) {
                    var o = e.readUInt8(t + 2),
                        i = t + 3;
                    if (128 & o && (i += 2), 64 & o) {
                        var s = e.readUInt8(i);
                        i += s + 1
                    }
                    return 32 & o && (i += 2), n.DescriptorArray.decode(e, i, r)
                }, n.DecoderConfigDescriptor = {}, n.DecoderConfigDescriptor.decode = function(e, t, r) {
                    var o = e.readUInt8(t),
                        i = n.DescriptorArray.decode(e, t + 13, r);
                    return i.oti = o, i
                }
            }).call(this, e("buffer").Buffer)
        }, {
            buffer: 23
        }],
        52: [function(e, t, n) {
            (function(t) {
                var r = e("uint64be"),
                    o = e("./boxes"),
                    i = 4294967295,
                    s = n,
                    d = n.containers = {
                        moov: ["mvhd", "meta", "traks", "mvex"],
                        trak: ["tkhd", "tref", "trgr", "edts", "meta", "mdia", "udta"],
                        edts: ["elst"],
                        mdia: ["mdhd", "hdlr", "elng", "minf"],
                        minf: ["vmhd", "smhd", "hmhd", "sthd", "nmhd", "dinf", "stbl"],
                        dinf: ["dref"],
                        stbl: ["stsd", "stts", "ctts", "cslg", "stsc", "stsz", "stz2", "stco", "co64", "stss", "stsh", "padb", "stdp", "sdtp", "sbgps", "sgpds", "subss", "saizs", "saios"],
                        mvex: ["mehd", "trexs", "leva"],
                        moof: ["mfhd", "meta", "trafs"],
                        traf: ["tfhd", "trun", "sbgps", "sgpds", "subss", "saizs", "saios", "tfdt", "meta"]
                    };
                s.encode = function(e, n, r) {
                    return s.encodingLength(e), r = r || 0, n = n || new t(e.length), s._encode(e, n, r)
                }, s._encode = function(e, t, n) {
                    var a = e.type,
                        c = e.length;
                    c > i && (c = 1), t.writeUInt32BE(c, n), t.write(e.type, n + 4, 4, "ascii");
                    var p = n + 8;
                    if (1 === c && (r.encode(e.length, t, p), p += 8), o.fullBoxes[a] && (t.writeUInt32BE(e.flags || 0, p), t.writeUInt8(e.version || 0, p), p += 4), d[a]) {
                        var l = d[a];
                        l.forEach(function(n) {
                            if (5 === n.length) {
                                var r = e[n] || [];
                                n = n.substr(0, 4), r.forEach(function(e) {
                                    s._encode(e, t, p), p += s.encode.bytes
                                })
                            } else e[n] && (s._encode(e[n], t, p), p += s.encode.bytes)
                        }), e.otherBoxes && e.otherBoxes.forEach(function(e) {
                            s._encode(e, t, p), p += s.encode.bytes
                        })
                    } else if (o[a]) {
                        var u = o[a].encode;
                        u(e, t, p), p += u.bytes
                    } else if (e.buffer) {
                        var f = e.buffer;
                        f.copy(t, p), p += e.buffer.length
                    } else throw new Error("Either `type` must be set to a known type (not'" + a + "') or `buffer` must be set");
                    return s.encode.bytes = p - n, t
                }, s.readHeaders = function(e, t, n) {
                    if (t = t || 0, n = n || e.length, 8 > n - t) return 8;
                    var i = e.readUInt32BE(t),
                        s = e.toString("ascii", t + 4, t + 8),
                        d = t + 8;
                    if (1 === i) {
                        if (16 > n - t) return 16;
                        i = r.decode(e, d), d += 8
                    }
                    var a, c;
                    return o.fullBoxes[s] && (a = e.readUInt8(d), c = 16777215 & e.readUInt32BE(d), d += 4), {
                        length: i,
                        headersLen: d - t,
                        contentLen: i - (d - t),
                        type: s,
                        version: a,
                        flags: c
                    }
                }, s.decode = function(e, t, n) {
                    t = t || 0, n = n || e.length;
                    var r = s.readHeaders(e, t, n);
                    if (!r || r.length > n - t) throw new Error("Data too short");
                    return s.decodeWithoutHeaders(r, e, t + r.headersLen, t + r.length)
                }, s.decodeWithoutHeaders = function(e, n, r, i) {
                    r = r || 0, i = i || n.length;
                    var a = e.type,
                        c = {};
                    if (d[a]) {
                        c.otherBoxes = [];
                        for (var p = d[a], l = r, u; 8 <= i - l;)
                            if (u = s.decode(n, l, i), l += u.length, 0 <= p.indexOf(u.type)) c[u.type] = u;
                            else if (0 <= p.indexOf(u.type + "s")) {
                            var f = u.type + "s",
                                h = c[f] = c[f] || [];
                            h.push(u)
                        } else c.otherBoxes.push(u)
                    } else if (o[a]) {
                        var m = o[a].decode;
                        c = m(n, r, i)
                    } else c.buffer = new t(n.slice(r, i));
                    return c.length = e.length, c.contentLen = e.contentLen, c.type = e.type, c.version = e.version, c.flags = e.flags, c
                }, s.encodingLength = function(e) {
                    var t = e.type,
                        n = 8;
                    if (o.fullBoxes[t] && (n += 4), d[t]) {
                        var r = d[t];
                        r.forEach(function(t) {
                            if (5 === t.length) {
                                var r = e[t] || [];
                                t = t.substr(0, 4), r.forEach(function(e) {
                                    e.type = t, n += s.encodingLength(e)
                                })
                            } else if (e[t]) {
                                var o = e[t];
                                o.type = t, n += s.encodingLength(o)
                            }
                        }), e.otherBoxes && e.otherBoxes.forEach(function(e) {
                            n += s.encodingLength(e)
                        })
                    } else if (o[t]) n += o[t].encodingLength(e);
                    else if (e.buffer) n += e.buffer.length;
                    else throw new Error("Either `type` must be set to a known type (not'" + t + "') or `buffer` must be set");
                    return n > i && (n += 8), e.length = n, n
                }
            }).call(this, e("buffer").Buffer)
        }, {
            "./boxes": 50,
            buffer: 23,
            uint64be: 109
        }],
        53: [function(e, t) {
            (function(n) {
                function r() {
                    return this instanceof r ? void(i.Writable.call(this), this.destroyed = !1, this._pending = 0, this._missing = 0, this._buf = null, this._str = null, this._cb = null, this._ondrain = null, this._writeBuffer = null, this._writeCb = null, this._ondrain = null, this._kick()) : new r
                }

                function o(e) {
                    this._parent = e, this.destroyed = !1, i.PassThrough.call(this)
                }
                var i = e("readable-stream"),
                    s = e("inherits"),
                    d = e("next-event"),
                    a = e("mp4-box-encoding"),
                    c = new n(0);
                t.exports = r, s(r, i.Writable), r.prototype.destroy = function(e) {
                    this.destroyed || (this.destroyed = !0, e && this.emit("error", e), this.emit("close"))
                }, r.prototype._write = function(e, t, n) {
                    if (!this.destroyed) {
                        for (var r = !this._str || !this._str._writableState.needDrain; e.length && !this.destroyed;) {
                            if (!this._missing) return this._writeBuffer = e, void(this._writeCb = n);
                            var o = e.length < this._missing ? e.length : this._missing;
                            if (this._buf ? e.copy(this._buf, this._buf.length - this._missing) : this._str && (r = this._str.write(o === e.length ? e : e.slice(0, o))), this._missing -= o, !this._missing) {
                                var i = this._buf,
                                    s = this._cb,
                                    d = this._str;
                                this._buf = this._cb = this._str = this._ondrain = null, r = !0, d && d.end(), s && s(i)
                            }
                            e = o === e.length ? c : e.slice(o)
                        }
                        return this._pending && !this._missing ? (this._writeBuffer = e, void(this._writeCb = n)) : void(r ? n() : this._ondrain(n))
                    }
                }, r.prototype._buffer = function(e, t) {
                    this._missing = e, this._buf = new n(e), this._cb = t
                }, r.prototype._stream = function(e, t) {
                    var n = this;
                    return this._missing = e, this._str = new o(this), this._ondrain = d(this._str, "drain"), this._pending++, this._str.on("end", function() {
                        n._pending--, n._kick()
                    }), this._cb = t, this._str
                }, r.prototype._readBox = function() {
                    function e(r, o) {
                        t._buffer(r, function(r) {
                            o = o ? n.concat([o, r]) : r;
                            var i = a.readHeaders(o);
                            "number" == typeof i ? e(i - o.length, o) : (t._pending++, t._headers = i, t.emit("box", i))
                        })
                    }
                    var t = this;
                    e(8)
                }, r.prototype.stream = function() {
                    var e = this;
                    if (!e._headers) throw new Error("this function can only be called once after 'box' is emitted");
                    var t = e._headers;
                    return e._headers = null, e._stream(t.contentLen, null)
                }, r.prototype.decode = function(e) {
                    var t = this;
                    if (!t._headers) throw new Error("this function can only be called once after 'box' is emitted");
                    var n = t._headers;
                    t._headers = null, t._buffer(n.contentLen, function(r) {
                        var o = a.decodeWithoutHeaders(n, r);
                        e(o), t._pending--, t._kick()
                    })
                }, r.prototype.ignore = function() {
                    var e = this;
                    if (!e._headers) throw new Error("this function can only be called once after 'box' is emitted");
                    var t = e._headers;
                    e._headers = null, this._missing = t.contentLen, this._cb = function() {
                        e._pending--, e._kick()
                    }
                }, r.prototype._kick = function() {
                    if (!this._pending && (this._buf || this._str || this._readBox(), this._writeBuffer)) {
                        var e = this._writeCb,
                            t = this._writeBuffer;
                        this._writeBuffer = null, this._writeCb = null, this._write(t, null, e)
                    }
                }, s(o, i.PassThrough), o.prototype.destroy = function(e) {
                    this.destroyed || (this.destroyed = !0, this._parent.destroy(e), e && this.emit("error", e), this.emit("close"))
                }
            }).call(this, e("buffer").Buffer)
        }, {
            buffer: 23,
            inherits: 40,
            "mp4-box-encoding": 52,
            "next-event": 58,
            "readable-stream": 82
        }],
        54: [function(e, t) {
            (function(n, r) {
                function o() {}

                function i() {
                    if (!(this instanceof i)) return new i;
                    d.Readable.call(this), this.destroyed = !1, this._reading = !1, this._stream = null, this._drain = null, this._want = !1, this._onreadable = function() {
                        e._want && (e._want = !1, e._read())
                    }, this._onend = function() {
                        e._stream = null
                    };
                    var e = this
                }

                function s(e) {
                    this._parent = e, this.destroyed = !1, d.PassThrough.call(this)
                }
                var d = e("readable-stream"),
                    a = e("inherits"),
                    c = e("mp4-box-encoding");
                t.exports = i, a(i, d.Readable), i.prototype.mediaData = i.prototype.mdat = function(e, t) {
                    var n = new s(this);
                    return this.box({
                        type: "mdat",
                        contentLength: e,
                        encodeBufferLen: 8,
                        stream: n
                    }, t), n
                }, i.prototype.box = function(e, t) {
                    if (t || (t = o), this.destroyed) return t(new Error("Encoder is destroyed"));
                    var i;
                    if (e.encodeBufferLen && (i = new r(e.encodeBufferLen)), e.stream) e.buffer = null, i = c.encode(e, i), this.push(i), this._stream = e.stream, this._stream.on("readable", this._onreadable), this._stream.on("end", this._onend), this._stream.on("end", t), this._forward();
                    else {
                        i = c.encode(e, i);
                        var s = this.push(i);
                        if (s) return n.nextTick(t);
                        this._drain = t
                    }
                }, i.prototype.destroy = function(e) {
                    if (!this.destroyed) {
                        if (this.destroyed = !0, this._stream && this._stream.destroy && this._stream.destroy(), this._stream = null, this._drain) {
                            var t = this._drain;
                            this._drain = null, t(e)
                        }
                        e && this.emit("error", e), this.emit("close")
                    }
                }, i.prototype.finalize = function() {
                    this.push(null)
                }, i.prototype._forward = function() {
                    if (this._stream)
                        for (; !this.destroyed;) {
                            var e = this._stream.read();
                            if (!e) return void(this._want = !!this._stream);
                            if (!this.push(e)) return
                        }
                }, i.prototype._read = function() {
                    if (!(this._reading || this.destroyed)) {
                        if (this._reading = !0, this._stream && this._forward(), this._drain) {
                            var e = this._drain;
                            this._drain = null, e()
                        }
                        this._reading = !1
                    }
                }, a(s, d.PassThrough), s.prototype.destroy = function(e) {
                    this.destroyed || (this.destroyed = !0, this._parent.destroy(e), e && this.emit("error", e), this.emit("close"))
                }
            }).call(this, e("_process"), e("buffer").Buffer)
        }, {
            _process: 65,
            buffer: 23,
            inherits: 40,
            "mp4-box-encoding": 52,
            "readable-stream": 82
        }],
        55: [function(e, t, n) {
            n.decode = e("./decode"), n.encode = e("./encode")
        }, {
            "./decode": 53,
            "./encode": 54
        }],
        56: [function(e, t) {
            function n(e) {
                if (e += "", !(100 < e.length)) {
                    var t = /^((?:\d+)?\.?\d+) *(milliseconds?|msecs?|ms|seconds?|secs?|s|minutes?|mins?|m|hours?|hrs?|h|days?|d|years?|yrs?|y)?$/i.exec(e);
                    if (t) {
                        var r = parseFloat(t[1]),
                            n = (t[2] || "ms").toLowerCase();
                        return "years" === n || "year" === n || "yrs" === n || "yr" === n || "y" === n ? r * d : "days" === n || "day" === n || "d" === n ? r * u : "hours" === n || "hour" === n || "hrs" === n || "hr" === n || "h" === n ? r * l : "minutes" === n || "minute" === n || "mins" === n || "min" === n || "m" === n ? r * s : "seconds" === n || "second" === n || "secs" === n || "sec" === n || "s" === n ? r * p : "milliseconds" === n || "millisecond" === n || "msecs" === n || "msec" === n || "ms" === n ? r : void 0
                    }
                }
            }

            function i(e) {
                var t = Math.round;
                return e >= u ? t(e / u) + "d" : e >= l ? t(e / l) + "h" : e >= s ? t(e / s) + "m" : e >= p ? t(e / p) + "s" : e + "ms"
            }

            function a(e) {
                return c(e, u, "day") || c(e, l, "hour") || c(e, s, "minute") || c(e, p, "second") || e + " ms"
            }

            function c(e, t, n) {
                return e < t ? void 0 : e < 1.5 * t ? r(e / t) + " " + n : o(e / t) + " " + n + "s"
            }
            var p = 1e3,
                s = 60 * p,
                l = 60 * s,
                u = 24 * l,
                d = 365.25 * u;
            t.exports = function(e, t) {
                t = t || {};
                var r = typeof e;
                if ("string" == r && 0 < e.length) return n(e);
                if ("number" == r && !1 === isNaN(e)) return t.long ? a(e) : i(e);
                throw new Error("val is not a non-empty string or a valid number. val=" + JSON.stringify(e))
            }
        }, {}],
        57: [function(e, t) {
            function n(e, t) {
                var o = this;
                return o instanceof n ? void(i.Readable.call(o, t), o.destroyed = !1, o._drained = !1, o._forwarding = !1, o._current = null, "function" == typeof e ? o._queue = e : (o._queue = e.map(r), o._queue.forEach(function(e) {
                    "function" != typeof e && o._attachErrorListener(e)
                })), o._next()) : new n(e, t)
            }

            function r(e) {
                if (!e || "function" == typeof e || e._readableState) return e;
                var t = new i.Readable().wrap(e);
                return e.destroy && (t.destroy = e.destroy.bind(e)), t
            }
            t.exports = n;
            var o = e("inherits"),
                i = e("readable-stream");
            o(n, i.Readable), n.obj = function(e) {
                return new n(e, {
                    objectMode: !0,
                    highWaterMark: 16
                })
            }, n.prototype._read = function() {
                this._drained = !0, this._forward()
            }, n.prototype._forward = function() {
                if (!this._forwarding && this._drained && this._current) {
                    this._forwarding = !0;
                    for (var e; null !== (e = this._current.read());) this._drained = this.push(e);
                    this._forwarding = !1
                }
            }, n.prototype.destroy = function(e) {
                this.destroyed || (this.destroyed = !0, this._current && this._current.destroy && this._current.destroy(), "function" != typeof this._queue && this._queue.forEach(function(e) {
                    e.destroy && e.destroy()
                }), e && this.emit("error", e), this.emit("close"))
            }, n.prototype._next = function() {
                var e = this;
                if (e._current = null, "function" == typeof e._queue) e._queue(function(t, n) {
                    return t ? e.destroy(t) : void(n = r(n), e._attachErrorListener(n), e._gotNextStream(n))
                });
                else {
                    var t = e._queue.shift();
                    "function" == typeof t && (t = r(t()), e._attachErrorListener(t)), e._gotNextStream(t)
                }
            }, n.prototype._gotNextStream = function(e) {
                function t() {
                    o._forward()
                }

                function n() {
                    e._readableState.ended || o.destroy()
                }

                function r() {
                    o._current = null, e.removeListener("readable", t), e.removeListener("end", r), e.removeListener("close", n), o._next()
                }
                var o = this;
                return e ? void(o._current = e, o._forward(), e.on("readable", t), e.once("end", r), e.once("close", n)) : (o.push(null), void o.destroy())
            }, n.prototype._attachErrorListener = function(e) {
                function t(r) {
                    e.removeListener("error", t), n.destroy(r)
                }
                var n = this;
                e && e.once("error", t)
            }
        }, {
            inherits: 40,
            "readable-stream": 82
        }],
        58: [function(e, t) {
            t.exports = function(e, t) {
                var n = null;
                return e.on(t, function(e) {
                        if (n) {
                            var t = n;
                            n = null, t(e)
                        }
                    }),
                    function(e) {
                        n = e
                    }
            }
        }, {}],
        59: [function(e, t) {
            function n(e) {
                var t = function() {
                    return t.called ? t.value : (t.called = !0, t.value = e.apply(this, arguments))
                };
                return t.called = !1, t
            }

            function r(e) {
                var t = function() {
                        if (t.called) throw new Error(t.onceError);
                        return t.called = !0, t.value = e.apply(this, arguments)
                    },
                    n = e.name || "Function wrapped with `once`";
                return t.onceError = n + " shouldn't be called more than once", t.called = !1, t
            }
            var o = e("wrappy");
            t.exports = o(n), t.exports.strict = o(r), n.proto = n(function() {
                Object.defineProperty(Function.prototype, "once", {
                    value: function() {
                        return n(this)
                    },
                    configurable: !0
                }), Object.defineProperty(Function.prototype, "onceStrict", {
                    value: function() {
                        return r(this)
                    },
                    configurable: !0
                })
            })
        }, {
            wrappy: 118
        }],
        60: [function(e, t) {
            (function(n) {
                function r(e) {
                    n.isBuffer(e) && (e = d.decode(e)), s(e.info, "info"), s(e.info["name.utf-8"] || e.info.name, "info.name"), s(e.info["piece length"], "info['piece length']"), s(e.info.pieces, "info.pieces"), e.info.files ? e.info.files.forEach(function(e) {
                        s("number" == typeof e.length, "info.files[0].length"), s(e["path.utf-8"] || e.path, "info.files[0].path")
                    }) : s("number" == typeof e.info.length, "info.length");
                    var t = {};
                    t.info = e.info, t.infoBuffer = d.encode(e.info), t.infoHash = c.sync(t.infoBuffer), t.infoHashBuffer = n.from(t.infoHash, "hex"), t.name = (e.info["name.utf-8"] || e.info.name).toString(), void 0 !== e.info.private && (t.private = !!e.info.private), e["creation date"] && (t.created = new Date(1e3 * e["creation date"])), e["created by"] && (t.createdBy = e["created by"].toString()), n.isBuffer(e.comment) && (t.comment = e.comment.toString()), t.announce = [], e["announce-list"] && e["announce-list"].length ? e["announce-list"].forEach(function(e) {
                        e.forEach(function(e) {
                            t.announce.push(e.toString())
                        })
                    }) : e.announce && t.announce.push(e.announce.toString()), n.isBuffer(e["url-list"]) && (e["url-list"] = 0 < e["url-list"].length ? [e["url-list"]] : []), t.urlList = (e["url-list"] || []).map(function(e) {
                        return e.toString()
                    }), p(t.announce), p(t.urlList);
                    var r = e.info.files || [e.info];
                    t.files = r.map(function(e, n) {
                        var i = [].concat(t.name, e["path.utf-8"] || e.path || []).map(function(e) {
                            return e.toString()
                        });
                        return {
                            path: a.join.apply(null, [a.sep].concat(i)).slice(1),
                            name: i[i.length - 1],
                            length: e.length,
                            offset: r.slice(0, n).reduce(o, 0)
                        }
                    }), t.length = r.reduce(o, 0);
                    var l = t.files[t.files.length - 1];
                    return t.pieceLength = e.info["piece length"], t.lastPieceLength = (l.offset + l.length) % t.pieceLength || t.pieceLength, t.pieces = i(e.info.pieces), t
                }

                function o(e, t) {
                    return e + t.length
                }

                function i(e) {
                    for (var t = [], n = 0; n < e.length; n += 20) t.push(e.slice(n, n + 20).toString("hex"));
                    return t
                }

                function s(e, t) {
                    if (!e) throw new Error("Torrent is missing required field: " + t)
                }
                t.exports = r, t.exports.decode = r, t.exports.encode = function(e) {
                    var t = {
                        info: e.info
                    };
                    return t["announce-list"] = (e.announce || []).map(function(e) {
                        return t.announce || (t.announce = e), e = n.from(e, "utf8"), [e]
                    }), t["url-list"] = e.urlList || [], e.created && (t["creation date"] = 0 | e.created.getTime() / 1e3), e.createdBy && (t["created by"] = e.createdBy), e.comment && (t.comment = e.comment), d.encode(t)
                };
                var d = e("bencode"),
                    a = e("path"),
                    c = e("simple-sha1"),
                    p = e("uniq")
            }).call(this, e("buffer").Buffer)
        }, {
            bencode: 11,
            buffer: 23,
            path: 62,
            "simple-sha1": 92,
            uniq: 110
        }],
        61: [function(e, t) {
            (function(n, r) {
                function o(e) {
                    if ("string" == typeof e && /^(stream-)?magnet:/.test(e)) return c(e);
                    if ("string" == typeof e && (/^[a-f0-9]{40}$/i.test(e) || /^[a-z2-7]{32}$/i.test(e))) return c("magnet:?xt=urn:btih:" + e);
                    if (r.isBuffer(e) && 20 === e.length) return c("magnet:?xt=urn:btih:" + e.toString("hex"));
                    if (r.isBuffer(e)) return p(e);
                    if (e && e.infoHash) return e.announce || (e.announce = []), "string" == typeof e.announce && (e.announce = [e.announce]), e.urlList || (e.urlList = []), e;
                    throw new Error("Invalid torrent identifier")
                }

                function i(e) {
                    return "undefined" != typeof Blob && e instanceof Blob
                }
                t.exports = o, t.exports.remote = function(e, t) {
                    function r(e) {
                        try {
                            c = o(e)
                        } catch (e) {
                            return t(e)
                        }
                        c && c.infoHash ? t(null, c) : t(new Error("Invalid torrent identifier"))
                    }
                    var c;
                    if ("function" != typeof t) throw new Error("second argument must be a Function");
                    try {
                        c = o(e)
                    } catch (e) {}
                    c && c.infoHash ? n.nextTick(function() {
                        t(null, c)
                    }) : i(e) ? s(e, function(e, n) {
                        return e ? t(new Error("Error converting Blob: " + e.message)) : void r(n)
                    }) : "function" == typeof a && /^https?:/.test(e) ? a.concat({
                        url: e,
                        timeout: 30000,
                        headers: {
                            "user-agent": "WebTorrent (http://webtorrent.io)"
                        }
                    }, function(e, n, o) {
                        return e ? t(new Error("Error downloading torrent: " + e.message)) : void r(o)
                    }) : "function" == typeof d.readFile && "string" == typeof e ? d.readFile(e, function(e, n) {
                        return e ? t(new Error("Invalid torrent identifier")) : void r(n)
                    }) : n.nextTick(function() {
                        t(new Error("Invalid torrent identifier"))
                    })
                };
                var s = e("blob-to-buffer"),
                    d = e("fs"),
                    a = e("simple-get"),
                    c = e("magnet-uri"),
                    p = e("parse-torrent-file");
                t.exports.toMagnetURI = c.encode, t.exports.toTorrentFile = p.encode;
                (function() {
                    r.alloc(0)
                })()
            }).call(this, e("_process"), e("buffer").Buffer)
        }, {
            _process: 65,
            "blob-to-buffer": 19,
            buffer: 23,
            fs: 22,
            "magnet-uri": 47,
            "parse-torrent-file": 60,
            "simple-get": 90
        }],
        62: [function(e, t, n) {
            (function(e) {
                function t(e, t) {
                    for (var n = 0, r = e.length - 1, o; 0 <= r; r--) o = e[r], "." === o ? e.splice(r, 1) : ".." === o ? (e.splice(r, 1), n++) : n && (e.splice(r, 1), n--);
                    if (t)
                        for (; n--; n) e.unshift("..");
                    return e
                }

                function r(e, t) {
                    if (e.filter) return e.filter(t);
                    for (var n = [], r = 0; r < e.length; r++) t(e[r], r, e) && n.push(e[r]);
                    return n
                }
                var o = /^(\/?|)([\s\S]*?)((?:\.{1,2}|[^\/]+?|)(\.[^.\/]*|))(?:[\/]*)$/,
                    i = function(e) {
                        return o.exec(e).slice(1)
                    };
                n.resolve = function() {
                    for (var n = "", o = !1, s = arguments.length - 1, i; - 1 <= s && !o; s--) {
                        if (i = 0 <= s ? arguments[s] : e.cwd(), "string" != typeof i) throw new TypeError("Arguments to path.resolve must be strings");
                        else if (!i) continue;
                        n = i + "/" + n, o = "/" === i.charAt(0)
                    }
                    return n = t(r(n.split("/"), function(e) {
                        return !!e
                    }), !o).join("/"), (o ? "/" : "") + n || "."
                }, n.normalize = function(e) {
                    var o = n.isAbsolute(e),
                        i = "/" === s(e, -1);
                    return e = t(r(e.split("/"), function(e) {
                        return !!e
                    }), !o).join("/"), e || o || (e = "."), e && i && (e += "/"), (o ? "/" : "") + e
                }, n.isAbsolute = function(e) {
                    return "/" === e.charAt(0)
                }, n.join = function() {
                    var e = Array.prototype.slice.call(arguments, 0);
                    return n.normalize(r(e, function(e) {
                        if ("string" != typeof e) throw new TypeError("Arguments to path.join must be strings");
                        return e
                    }).join("/"))
                }, n.relative = function(e, t) {
                    function r(e) {
                        for (var t = 0; t < e.length && "" === e[t]; t++);
                        for (var n = e.length - 1; 0 <= n && "" === e[n]; n--);
                        return t > n ? [] : e.slice(t, n - t + 1)
                    }
                    e = n.resolve(e).substr(1), t = n.resolve(t).substr(1);
                    for (var o = r(e.split("/")), s = r(t.split("/")), a = d(o.length, s.length), c = a, p = 0; p < a; p++)
                        if (o[p] !== s[p]) {
                            c = p;
                            break
                        }
                    for (var i = [], p = c; p < o.length; p++) i.push("..");
                    return i = i.concat(s.slice(c)), i.join("/")
                }, n.sep = "/", n.delimiter = ":", n.dirname = function(e) {
                    var t = i(e),
                        n = t[0],
                        r = t[1];
                    return n || r ? (r && (r = r.substr(0, r.length - 1)), n + r) : "."
                }, n.basename = function(e, t) {
                    var n = i(e)[2];
                    return t && n.substr(-1 * t.length) === t && (n = n.substr(0, n.length - t.length)), n
                }, n.extname = function(e) {
                    return i(e)[3]
                };
                var s = function(e, t, n) {
                    return e.substr(t, n)
                }
            }).call(this, e("_process"))
        }, {
            _process: 65
        }],
        63: [function(e, t) {
            for (var r = e("closest-to"), o = 1024, i = 13, s = []; 22 > i++;) s.push(n(2, i));
            t.exports = function(e) {
                return r(e / o, s)
            }
        }, {
            "closest-to": 26
        }],
        64: [function(e, t) {
            (function(e) {
                "use strict";
                t.exports = e.version && 0 !== e.version.indexOf("v0.") && (0 !== e.version.indexOf("v1.") || 0 === e.version.indexOf("v1.8.")) ? e.nextTick : function(t, n, r, o) {
                    if ("function" != typeof t) throw new TypeError("\"callback\" argument must be a function");
                    var s = arguments.length,
                        d, a;
                    switch (s) {
                        case 0:
                        case 1:
                            return e.nextTick(t);
                        case 2:
                            return e.nextTick(function() {
                                t.call(null, n)
                            });
                        case 3:
                            return e.nextTick(function() {
                                t.call(null, n, r)
                            });
                        case 4:
                            return e.nextTick(function() {
                                t.call(null, n, r, o)
                            });
                        default:
                            for (d = Array(s - 1), a = 0; a < d.length;) d[a++] = arguments[a];
                            return e.nextTick(function() {
                                t.apply(null, d)
                            });
                    }
                }
            }).call(this, e("_process"))
        }, {
            _process: 65
        }],
        65: [function(e, t) {
            function n() {
                throw new Error("setTimeout has not been defined")
            }

            function r() {
                throw new Error("clearTimeout has not been defined")
            }

            function o(e) {
                if (l === setTimeout) return setTimeout(e, 0);
                if ((l === n || !l) && setTimeout) return l = setTimeout, setTimeout(e, 0);
                try {
                    return l(e, 0)
                } catch (t) {
                    try {
                        return l.call(null, e, 0)
                    } catch (t) {
                        return l.call(this, e, 0)
                    }
                }
            }

            function i(e) {
                if (u === clearTimeout) return clearTimeout(e);
                if ((u === r || !u) && clearTimeout) return u = clearTimeout, clearTimeout(e);
                try {
                    return u(e)
                } catch (t) {
                    try {
                        return u.call(null, e)
                    } catch (t) {
                        return u.call(this, e)
                    }
                }
            }

            function s() {
                h && g && (h = !1, g.length ? f = g.concat(f) : m = -1, f.length && d())
            }

            function d() {
                if (!h) {
                    var e = o(s);
                    h = !0;
                    for (var t = f.length; t;) {
                        for (g = f, f = []; ++m < t;) g && g[m].run();
                        m = -1, t = f.length
                    }
                    g = null, h = !1, i(e)
                }
            }

            function a(e, t) {
                this.fun = e, this.array = t
            }

            function c() {}
            var p = t.exports = {},
                l, u;
            (function() {
                try {
                    l = "function" == typeof setTimeout ? setTimeout : n
                } catch (t) {
                    l = n
                }
                try {
                    u = "function" == typeof clearTimeout ? clearTimeout : r
                } catch (t) {
                    u = r
                }
            })();
            var f = [],
                h = !1,
                m = -1,
                g;
            p.nextTick = function(e) {
                var t = Array(arguments.length - 1);
                if (1 < arguments.length)
                    for (var n = 1; n < arguments.length; n++) t[n - 1] = arguments[n];
                f.push(new a(e, t)), 1 !== f.length || h || o(d)
            }, a.prototype.run = function() {
                this.fun.apply(null, this.array)
            }, p.title = "browser", p.browser = !0, p.env = {}, p.argv = [], p.version = "", p.versions = {}, p.on = c, p.addListener = c, p.once = c, p.off = c, p.removeListener = c, p.removeAllListeners = c, p.emit = c, p.prependListener = c, p.prependOnceListener = c, p.listeners = function() {
                return []
            }, p.binding = function() {
                throw new Error("process.binding is not supported")
            }, p.cwd = function() {
                return "/"
            }, p.chdir = function() {
                throw new Error("process.chdir is not supported")
            }, p.umask = function() {
                return 0
            }
        }, {}],
        66: [function(e, t) {
            var n = e("once"),
                r = e("end-of-stream"),
                o = e("fs"),
                i = function() {},
                s = function(e) {
                    return "function" == typeof e
                },
                d = function(e) {
                    return !!o && (e instanceof(o.ReadStream || i) || e instanceof(o.WriteStream || i)) && s(e.close)
                },
                a = function(e) {
                    return e.setHeader && s(e.abort)
                },
                c = function(e, t, o, i) {
                    i = n(i);
                    var c = !1;
                    e.on("close", function() {
                        c = !0
                    }), r(e, {
                        readable: t,
                        writable: o
                    }, function(e) {
                        return e ? i(e) : void(c = !0, i())
                    });
                    var p = !1;
                    return function(t) {
                        if (!c) return p ? void 0 : (p = !0, d(e) ? e.close() : a(e) ? e.abort() : s(e.destroy) ? e.destroy() : void i(t || new Error("stream was destroyed")))
                    }
                },
                p = function(e) {
                    e()
                },
                l = function(e, t) {
                    return e.pipe(t)
                };
            t.exports = function() {
                var e = Array.prototype.slice.call(arguments),
                    t = s(e[e.length - 1] || i) && e.pop() || i;
                if (Array.isArray(e[0]) && (e = e[0]), 2 > e.length) throw new Error("pump requires two streams per minimum");
                var n = e.map(function(o, s) {
                        var i = s < e.length - 1;
                        return c(o, i, 0 < s, function(e) {
                            r || (r = e), e && n.forEach(p), i || (n.forEach(p), t(r))
                        })
                    }),
                    r;
                return e.reduce(l)
            }
        }, {
            "end-of-stream": 32,
            fs: 21,
            once: 59
        }],
        67: [function(t, n, o) {
            (function(t) {
                (function(s) {
                    function d(e) {
                        throw new RangeError(U[e])
                    }

                    function a(e, t) {
                        for (var n = e.length, r = []; n--;) r[n] = t(e[n]);
                        return r
                    }

                    function c(e, t) {
                        var n = e.split("@"),
                            r = "";
                        1 < n.length && (r = n[0] + "@", e = n[1]), e = e.replace(A, ".");
                        var o = e.split("."),
                            i = a(o, t).join(".");
                        return r + i
                    }

                    function p(e) {
                        for (var t = [], n = 0, r = e.length, o, i; n < r;) o = e.charCodeAt(n++), 55296 <= o && 56319 >= o && n < r ? (i = e.charCodeAt(n++), 56320 == (64512 & i) ? t.push(((1023 & o) << 10) + (1023 & i) + 65536) : (t.push(o), n--)) : t.push(o);
                        return t
                    }

                    function l(e) {
                        return a(e, function(e) {
                            var t = "";
                            return 65535 < e && (e -= 65536, t += O(55296 | 1023 & e >>> 10), e = 56320 | 1023 & e), t += O(e), t
                        }).join("")
                    }

                    function u(e) {
                        return 10 > e - 48 ? e - 22 : 26 > e - 65 ? e - 65 : 26 > e - 97 ? e - 97 : v
                    }

                    function f(e, t) {
                        return e + 22 + 75 * (26 > e) - ((0 != t) << 5)
                    }

                    function h(e, t, n) {
                        var r = 0;
                        for (e = n ? P(e / B) : e >> 1, e += P(e / t); e > R * E >> 1; r += v) e = P(e / R);
                        return P(r + (R + 1) * e / (e + w))
                    }

                    function m(e) {
                        var r = [],
                            o = e.length,
                            s = 0,
                            i = C,
                            n = I,
                            a, c, p, f, m, g, _, y, b, t;
                        for (c = e.lastIndexOf(L), 0 > c && (c = 0), p = 0; p < c; ++p) 128 <= e.charCodeAt(p) && d("not-basic"), r.push(e.charCodeAt(p));
                        for (f = 0 < c ? c + 1 : 0; f < o;) {
                            for (m = s, g = 1, _ = v;; _ += v) {
                                if (f >= o && d("invalid-input"), y = u(e.charCodeAt(f++)), (y >= v || y > P((x - s) / g)) && d("overflow"), s += y * g, b = _ <= n ? S : _ >= n + E ? E : _ - n, y < b) break;
                                t = v - b, g > P(x / t) && d("overflow"), g *= t
                            }
                            a = r.length + 1, n = h(s - m, a, 0 == m), P(s / a) > x - i && d("overflow"), i += P(s / a), s %= a, r.splice(s++, 0, i)
                        }
                        return l(r)
                    }

                    function g(e) {
                        var r = [],
                            o, n, i, s, a, c, l, u, m, g, t, _, y, b, w;
                        for (e = p(e), _ = e.length, o = C, n = 0, a = I, c = 0; c < _; ++c) t = e[c], 128 > t && r.push(O(t));
                        for (i = s = r.length, s && r.push(L); i < _;) {
                            for (l = x, c = 0; c < _; ++c) t = e[c], t >= o && t < l && (l = t);
                            for (y = i + 1, l - o > P((x - n) / y) && d("overflow"), n += (l - o) * y, o = l, c = 0; c < _; ++c)
                                if (t = e[c], t < o && ++n > x && d("overflow"), t == o) {
                                    for (u = n, m = v;; m += v) {
                                        if (g = m <= a ? S : m >= a + E ? E : m - a, u < g) break;
                                        w = u - g, b = v - g, r.push(O(f(g + w % b, 0))), u = P(w / b)
                                    }
                                    r.push(O(f(u, 0))), a = h(n, y, i == s), n = 0, ++i
                                }++n, ++o
                        }
                        return r.join("")
                    }
                    var _ = "object" == typeof o && o && !o.nodeType && o,
                        y = "object" == typeof n && n && !n.nodeType && n,
                        b = "object" == typeof t && t;
                    (b.global === b || b.window === b || b.self === b) && (s = b);
                    var x = 2147483647,
                        v = 36,
                        S = 1,
                        E = 26,
                        w = 38,
                        B = 700,
                        I = 72,
                        C = 128,
                        L = "-",
                        k = /^xn--/,
                        T = /[^\x20-\x7E]/,
                        A = /[\x2E\u3002\uFF0E\uFF61]/g,
                        U = {
                            overflow: "Overflow: input needs wider integers to process",
                            "not-basic": "Illegal input >= 0x80 (not a basic code point)",
                            "invalid-input": "Invalid input"
                        },
                        R = v - S,
                        P = r,
                        O = e,
                        H, M;
                    if (H = {
                            version: "1.4.1",
                            ucs2: {
                                decode: p,
                                encode: l
                            },
                            decode: m,
                            encode: g,
                            toASCII: function(e) {
                                return c(e, function(e) {
                                    return T.test(e) ? "xn--" + g(e) : e
                                })
                            },
                            toUnicode: function(e) {
                                return c(e, function(e) {
                                    return k.test(e) ? m(e.slice(4).toLowerCase()) : e
                                })
                            }
                        }, "function" == typeof i && "object" == typeof i.amd && i.amd) i("punycode", function() {
                        return H
                    });
                    else if (!(_ && y)) s.punycode = H;
                    else if (n.exports == _) y.exports = H;
                    else
                        for (M in H) H.hasOwnProperty(M) && (_[M] = H[M])
                })(this)
            }).call(this, "undefined" == typeof global ? "undefined" == typeof self ? "undefined" == typeof window ? {} : window : self : global)
        }, {}],
        68: [function(e, t) {
            "use strict";

            function n(e, t) {
                return Object.prototype.hasOwnProperty.call(e, t)
            }
            t.exports = function(e, t, o, s) {
                t = t || "&", o = o || "=";
                var d = {};
                if ("string" != typeof e || 0 === e.length) return d;
                var a = /\+/g;
                e = e.split(t);
                var c = 1e3;
                s && "number" == typeof s.maxKeys && (c = s.maxKeys);
                var p = e.length;
                0 < c && p > c && (p = c);
                for (var l = 0; l < p; ++l) {
                    var i = e[l].replace(a, "%20"),
                        u = i.indexOf(o),
                        f, h, m, g;
                    0 <= u ? (f = i.substr(0, u), h = i.substr(u + 1)) : (f = i, h = ""), m = decodeURIComponent(f), g = decodeURIComponent(h), n(d, m) ? r(d[m]) ? d[m].push(g) : d[m] = [d[m], g] : d[m] = g
                }
                return d
            };
            var r = Array.isArray || function(e) {
                return "[object Array]" === Object.prototype.toString.call(e)
            }
        }, {}],
        69: [function(e, t) {
            "use strict";

            function n(e, t) {
                if (e.map) return e.map(t);
                for (var n = [], r = 0; r < e.length; r++) n.push(t(e[r], r));
                return n
            }
            var r = function(e) {
                switch (typeof e) {
                    case "string":
                        return e;
                    case "boolean":
                        return e ? "true" : "false";
                    case "number":
                        return isFinite(e) ? e : "";
                    default:
                        return "";
                }
            };
            t.exports = function(e, t, s, d) {
                return t = t || "&", s = s || "=", null === e && (e = void 0), "object" == typeof e ? n(i(e), function(i) {
                    var d = encodeURIComponent(r(i)) + s;
                    return o(e[i]) ? n(e[i], function(e) {
                        return d + encodeURIComponent(r(e))
                    }).join(t) : d + encodeURIComponent(r(e[i]))
                }).join(t) : d ? encodeURIComponent(r(d)) + s + encodeURIComponent(r(e)) : ""
            };
            var o = Array.isArray || function(e) {
                    return "[object Array]" === Object.prototype.toString.call(e)
                },
                i = Object.keys || function(e) {
                    var t = [];
                    for (var n in e) Object.prototype.hasOwnProperty.call(e, n) && t.push(n);
                    return t
                }
        }, {}],
        70: [function(e, t, n) {
            "use strict";
            n.decode = n.parse = e("./decode"), n.encode = n.stringify = e("./encode")
        }, {
            "./decode": 68,
            "./encode": 69
        }],
        71: [function(e, t) {
            t.exports = function(e) {
                var t = 0;
                return function() {
                    if (t === e.length) return null;
                    var n = e.length - t,
                        r = 0 | Math.random() * n,
                        o = e[t + r],
                        i = e[t];
                    return e[t] = o, e[t + r] = i, t++, o
                }
            }
        }, {}],
        72: [function(e, t) {
            (function(n, r) {
                "use strict";
                var o = e("safe-buffer").Buffer,
                    i = r.crypto || r.msCrypto;
                t.exports = i && i.getRandomValues ? function(e, t) {
                    if (65536 < e) throw new Error("requested too many random bytes");
                    var s = new r.Uint8Array(e);
                    0 < e && i.getRandomValues(s);
                    var d = o.from(s.buffer);
                    return "function" == typeof t ? n.nextTick(function() {
                        t(null, d)
                    }) : d
                } : function() {
                    throw new Error("secure random number generation not supported by this browser\nuse chrome, FireFox or Internet Explorer 11")
                }
            }).call(this, e("_process"), "undefined" == typeof global ? "undefined" == typeof self ? "undefined" == typeof window ? {} : window : self : global)
        }, {
            _process: 65,
            "safe-buffer": 88
        }],
        73: [function(e, t) {
            function n(e, t) {
                var r = this;
                return r instanceof n ? void(o.Writable.call(r, t), r.destroyed = !1, r._queue = [], r._position = e || 0, r._cb = null, r._buffer = null, r._out = null) : new n(e)
            }
            var r = e("inherits"),
                o = e("readable-stream");
            t.exports = n, r(n, o.Writable), n.prototype._write = function(e, t, n) {
                for (var r = this, o = !0;;) {
                    if (r.destroyed) return;
                    if (0 === r._queue.length) return r._buffer = e, void(r._cb = n);
                    r._buffer = null;
                    var i = r._queue[0],
                        d = s(i.start - r._position, 0),
                        a = i.end - r._position;
                    if (d >= e.length) return r._position += e.length, n(null);
                    var c;
                    if (a > e.length) {
                        r._position += e.length, c = 0 === d ? e : e.slice(d), o = i.stream.write(c) && o;
                        break
                    }
                    r._position += a, c = 0 === d && a === e.length ? e : e.slice(d, a), o = i.stream.write(c) && o, i.last && i.stream.end(), e = e.slice(a), r._queue.shift()
                }
                o ? n(null) : i.stream.once("drain", n.bind(null, null))
            }, n.prototype.slice = function(e) {
                var t = this;
                if (t.destroyed) return null;
                e instanceof Array || (e = [e]);
                var n = new o.PassThrough;
                return e.forEach(function(r, o) {
                    t._queue.push({
                        start: r.start,
                        end: r.end,
                        stream: n,
                        last: o === e.length - 1
                    })
                }), t._buffer && t._write(t._buffer, null, t._cb), n
            }, n.prototype.destroy = function(e) {
                var t = this;
                t.destroyed || (t.destroyed = !0, e && t.emit("error", e))
            }
        }, {
            inherits: 40,
            "readable-stream": 82
        }],
        74: [function(e, t) {
            "use strict";

            function n(e) {
                return this instanceof n ? void(a.call(this, e), c.call(this, e), e && !1 === e.readable && (this.readable = !1), e && !1 === e.writable && (this.writable = !1), this.allowHalfOpen = !0, e && !1 === e.allowHalfOpen && (this.allowHalfOpen = !1), this.once("end", r)) : new n(e)
            }

            function r() {
                this.allowHalfOpen || this._writableState.ended || i(o, this)
            }

            function o(e) {
                e.end()
            }
            var i = e("process-nextick-args"),
                s = Object.keys || function(e) {
                    var t = [];
                    for (var n in e) t.push(n);
                    return t
                };
            t.exports = n;
            var d = e("core-util-is");
            d.inherits = e("inherits");
            var a = e("./_stream_readable"),
                c = e("./_stream_writable");
            d.inherits(n, a);
            for (var p = s(c.prototype), l = 0, u; l < p.length; l++) u = p[l], n.prototype[u] || (n.prototype[u] = c.prototype[u]);
            Object.defineProperty(n.prototype, "destroyed", {
                get: function() {
                    return void 0 === this._readableState || void 0 === this._writableState ? !1 : this._readableState.destroyed && this._writableState.destroyed
                },
                set: function(e) {
                    void 0 === this._readableState || void 0 === this._writableState || (this._readableState.destroyed = e, this._writableState.destroyed = e)
                }
            }), n.prototype._destroy = function(e, t) {
                this.push(null), this.end(), i(t, e)
            }
        }, {
            "./_stream_readable": 76,
            "./_stream_writable": 78,
            "core-util-is": 27,
            inherits: 40,
            "process-nextick-args": 64
        }],
        75: [function(e, t) {
            "use strict";

            function n(e) {
                return this instanceof n ? void r.call(this, e) : new n(e)
            }
            t.exports = n;
            var r = e("./_stream_transform"),
                o = e("core-util-is");
            o.inherits = e("inherits"), o.inherits(n, r), n.prototype._transform = function(e, t, n) {
                n(null, e)
            }
        }, {
            "./_stream_transform": 77,
            "core-util-is": 27,
            inherits: 40
        }],
        76: [function(e, t) {
            (function(n) {
                "use strict";

                function o(e) {
                    return q.from(e)
                }

                function i(e) {
                    return "[object Uint8Array]" === Object.prototype.toString.call(e) || q.isBuffer(e)
                }

                function s(e, t, n) {
                    return "function" == typeof e.prependListener ? e.prependListener(t, n) : void(e._events && e._events[t] ? R(e._events[t]) ? e._events[t].unshift(n) : e._events[t] = [n, e._events[t]] : e.on(t, n))
                }

                function d(t, n) {
                    P = P || e("./_stream_duplex"), t = t || {}, this.objectMode = !!t.objectMode, n instanceof P && (this.objectMode = this.objectMode || !!t.readableObjectMode);
                    var o = t.highWaterMark,
                        i = this.objectMode ? 16 : 16384;
                    this.highWaterMark = o || 0 === o ? o : i, this.highWaterMark = r(this.highWaterMark), this.buffer = new W, this.length = 0, this.pipes = null, this.pipesCount = 0, this.flowing = null, this.ended = !1, this.endEmitted = !1, this.reading = !1, this.sync = !0, this.needReadable = !1, this.emittedReadable = !1, this.readableListening = !1, this.resumeScheduled = !1, this.destroyed = !1, this.defaultEncoding = t.defaultEncoding || "utf8", this.awaitDrain = 0, this.readingMore = !1, this.decoder = null, this.encoding = null, t.encoding && (!F && (F = e("string_decoder/").StringDecoder), this.decoder = new F(t.encoding), this.encoding = t.encoding)
                }

                function a(t) {
                    return P = P || e("./_stream_duplex"), this instanceof a ? void(this._readableState = new d(t, this), this.readable = !0, t && ("function" == typeof t.read && (this._read = t.read), "function" == typeof t.destroy && (this._destroy = t.destroy)), M.call(this)) : new a(t)
                }

                function c(e, t, n, r, i) {
                    var s = e._readableState;
                    if (null === t) s.reading = !1, m(e, s);
                    else {
                        var d;
                        i || (d = l(s, t)), d ? e.emit("error", d) : s.objectMode || t && 0 < t.length ? ("string" != typeof t && Object.getPrototypeOf(t) !== q.prototype && !s.objectMode && (t = o(t)), r ? s.endEmitted ? e.emit("error", new Error("stream.unshift() after end event")) : p(e, s, t, !0) : s.ended ? e.emit("error", new Error("stream.push() after EOF")) : (s.reading = !1, s.decoder && !n ? (t = s.decoder.write(t), s.objectMode || 0 !== t.length ? p(e, s, t, !1) : y(e, s)) : p(e, s, t, !1))) : !r && (s.reading = !1)
                    }
                    return u(s)
                }

                function p(e, t, n, r) {
                    t.flowing && 0 === t.length && !t.sync ? (e.emit("data", n), e.read(0)) : (t.length += t.objectMode ? 1 : n.length, r ? t.buffer.unshift(n) : t.buffer.push(n), t.needReadable && g(e)), y(e, t)
                }

                function l(e, t) {
                    var n;
                    return i(t) || "string" == typeof t || void 0 === t || e.objectMode || (n = new TypeError("Invalid non-string/buffer chunk")), n
                }

                function u(e) {
                    return !e.ended && (e.needReadable || e.length < e.highWaterMark || 0 === e.length)
                }

                function f(e) {
                    return e >= G ? e = G : (e--, e |= e >>> 1, e |= e >>> 2, e |= e >>> 4, e |= e >>> 8, e |= e >>> 16, e++), e
                }

                function h(e, t) {
                    return 0 >= e || 0 === t.length && t.ended ? 0 : t.objectMode ? 1 : e === e ? (e > t.highWaterMark && (t.highWaterMark = f(e)), e <= t.length ? e : t.ended ? t.length : (t.needReadable = !0, 0)) : t.flowing && t.length ? t.buffer.head.data.length : t.length
                }

                function m(e, t) {
                    if (!t.ended) {
                        if (t.decoder) {
                            var n = t.decoder.end();
                            n && n.length && (t.buffer.push(n), t.length += t.objectMode ? 1 : n.length)
                        }
                        t.ended = !0, g(e)
                    }
                }

                function g(e) {
                    var t = e._readableState;
                    t.needReadable = !1, t.emittedReadable || (D("emitReadable", t.flowing), t.emittedReadable = !0, t.sync ? U(_, e) : _(e))
                }

                function _(e) {
                    D("emit readable"), e.emit("readable"), S(e)
                }

                function y(e, t) {
                    t.readingMore || (t.readingMore = !0, U(b, e, t))
                }

                function b(e, t) {
                    for (var n = t.length; !t.reading && !t.flowing && !t.ended && t.length < t.highWaterMark && (D("maybeReadMore read 0"), e.read(0), n !== t.length);) n = t.length;
                    t.readingMore = !1
                }

                function w(e) {
                    return function() {
                        var t = e._readableState;
                        D("pipeOnDrain", t.awaitDrain), t.awaitDrain && t.awaitDrain--, 0 === t.awaitDrain && H(e, "data") && (t.flowing = !0, S(e))
                    }
                }

                function k(e) {
                    D("readable nexttick read 0"), e.read(0)
                }

                function x(e, t) {
                    t.resumeScheduled || (t.resumeScheduled = !0, U(v, e, t))
                }

                function v(e, t) {
                    t.reading || (D("resume read 0"), e.read(0)), t.resumeScheduled = !1, t.awaitDrain = 0, e.emit("resume"), S(e), t.flowing && !t.reading && e.read(0)
                }

                function S(e) {
                    var t = e._readableState;
                    for (D("flow", t.flowing); t.flowing && null !== e.read(););
                }

                function E(e, t) {
                    if (0 === t.length) return null;
                    var r;
                    return t.objectMode ? r = t.buffer.shift() : !e || e >= t.length ? (r = t.decoder ? t.buffer.join("") : 1 === t.buffer.length ? t.buffer.head.data : t.buffer.concat(t.length), t.buffer.clear()) : r = B(e, t.buffer, t.decoder), r
                }

                function B(e, t, n) {
                    var r;
                    return e < t.head.data.length ? (r = t.head.data.slice(0, e), t.head.data = t.head.data.slice(e)) : e === t.head.data.length ? r = t.shift() : r = n ? I(e, t) : C(e, t), r
                }

                function I(e, t) {
                    var n = t.head,
                        r = 1,
                        o = n.data;
                    for (e -= o.length; n = n.next;) {
                        var i = n.data,
                            s = e > i.length ? i.length : e;
                        if (o += s === i.length ? i : i.slice(0, e), e -= s, 0 === e) {
                            s === i.length ? (++r, t.head = n.next ? n.next : t.tail = null) : (t.head = n, n.data = i.slice(s));
                            break
                        }++r
                    }
                    return t.length -= r, o
                }

                function C(e, t) {
                    var n = q.allocUnsafe(e),
                        r = t.head,
                        o = 1;
                    for (r.data.copy(n), e -= r.data.length; r = r.next;) {
                        var i = r.data,
                            s = e > i.length ? i.length : e;
                        if (i.copy(n, n.length - e, 0, s), e -= s, 0 === e) {
                            s === i.length ? (++o, t.head = r.next ? r.next : t.tail = null) : (t.head = r, r.data = i.slice(s));
                            break
                        }++o
                    }
                    return t.length -= o, n
                }

                function L(e) {
                    var t = e._readableState;
                    if (0 < t.length) throw new Error("\"endReadable()\" called on non-empty stream");
                    t.endEmitted || (t.ended = !0, U(T, t, e))
                }

                function T(e, t) {
                    e.endEmitted || 0 !== e.length || (e.endEmitted = !0, t.readable = !1, t.emit("end"))
                }

                function A(e, t) {
                    for (var n = 0, r = e.length; n < r; n++)
                        if (e[n] === t) return n;
                    return -1
                }
                var U = e("process-nextick-args");
                t.exports = a;
                var R = e("isarray"),
                    P;
                a.ReadableState = d;
                var O = e("events").EventEmitter,
                    H = function(e, t) {
                        return e.listeners(t).length
                    },
                    M = e("./internal/streams/stream"),
                    q = e("safe-buffer").Buffer,
                    j = e("core-util-is");
                j.inherits = e("inherits");
                var N = e("util"),
                    D;
                D = N && N.debuglog ? N.debuglog("stream") : function() {};
                var W = e("./internal/streams/BufferList"),
                    z = e("./internal/streams/destroy"),
                    F;
                j.inherits(a, M);
                var V = ["error", "close", "destroy", "pause", "resume"];
                Object.defineProperty(a.prototype, "destroyed", {
                    get: function() {
                        return void 0 !== this._readableState && this._readableState.destroyed
                    },
                    set: function(e) {
                        this._readableState && (this._readableState.destroyed = e)
                    }
                }), a.prototype.destroy = z.destroy, a.prototype._undestroy = z.undestroy, a.prototype._destroy = function(e, t) {
                    this.push(null), t(e)
                }, a.prototype.push = function(e, t) {
                    var n = this._readableState,
                        r;
                    return n.objectMode ? r = !0 : "string" == typeof e && (t = t || n.defaultEncoding, t !== n.encoding && (e = q.from(e, t), t = ""), r = !0), c(this, e, t, !1, r)
                }, a.prototype.unshift = function(e) {
                    return c(this, e, null, !0, !1)
                }, a.prototype.isPaused = function() {
                    return !1 === this._readableState.flowing
                }, a.prototype.setEncoding = function(t) {
                    return F || (F = e("string_decoder/").StringDecoder), this._readableState.decoder = new F(t), this._readableState.encoding = t, this
                };
                var G = 8388608;
                a.prototype.read = function(e) {
                    D("read", e), e = parseInt(e, 10);
                    var t = this._readableState,
                        n = e;
                    if (0 !== e && (t.emittedReadable = !1), 0 === e && t.needReadable && (t.length >= t.highWaterMark || t.ended)) return D("read: emitReadable", t.length, t.ended), 0 === t.length && t.ended ? L(this) : g(this), null;
                    if (e = h(e, t), 0 === e && t.ended) return 0 === t.length && L(this), null;
                    var r = t.needReadable;
                    D("need readable", r), (0 === t.length || t.length - e < t.highWaterMark) && (r = !0, D("length less than watermark", r)), t.ended || t.reading ? (r = !1, D("reading or ended", r)) : r && (D("do read"), t.reading = !0, t.sync = !0, 0 === t.length && (t.needReadable = !0), this._read(t.highWaterMark), t.sync = !1, !t.reading && (e = h(n, t)));
                    var o;
                    return o = 0 < e ? E(e, t) : null, null === o ? (t.needReadable = !0, e = 0) : t.length -= e, 0 === t.length && (!t.ended && (t.needReadable = !0), n !== e && t.ended && L(this)), null !== o && this.emit("data", o), o
                }, a.prototype._read = function() {
                    this.emit("error", new Error("_read() is not implemented"))
                }, a.prototype.pipe = function(e, t) {
                    function r(e, t) {
                        D("onunpipe"), e === u && t && !1 === t.hasUnpiped && (t.hasUnpiped = !0, i())
                    }

                    function o() {
                        D("onend"), e.end()
                    }

                    function i() {
                        D("cleanup"), e.removeListener("close", c), e.removeListener("finish", p), e.removeListener("drain", g), e.removeListener("error", a), e.removeListener("unpipe", r), u.removeListener("end", o), u.removeListener("end", l), u.removeListener("data", d), _ = !0, f.awaitDrain && (!e._writableState || e._writableState.needDrain) && g()
                    }

                    function d(t) {
                        D("ondata"), y = !1;
                        var n = e.write(t);
                        !1 !== n || y || ((1 === f.pipesCount && f.pipes === e || 1 < f.pipesCount && -1 !== A(f.pipes, e)) && !_ && (D("false write response, pause", u._readableState.awaitDrain), u._readableState.awaitDrain++, y = !0), u.pause())
                    }

                    function a(t) {
                        D("onerror", t), l(), e.removeListener("error", a), 0 === H(e, "error") && e.emit("error", t)
                    }

                    function c() {
                        e.removeListener("finish", p), l()
                    }

                    function p() {
                        D("onfinish"), e.removeListener("close", c), l()
                    }

                    function l() {
                        D("unpipe"), u.unpipe(e)
                    }
                    var u = this,
                        f = this._readableState;
                    switch (f.pipesCount) {
                        case 0:
                            f.pipes = e;
                            break;
                        case 1:
                            f.pipes = [f.pipes, e];
                            break;
                        default:
                            f.pipes.push(e);
                    }
                    f.pipesCount += 1, D("pipe count=%d opts=%j", f.pipesCount, t);
                    var h = (!t || !1 !== t.end) && e !== n.stdout && e !== n.stderr,
                        m = h ? o : l;
                    f.endEmitted ? U(m) : u.once("end", m), e.on("unpipe", r);
                    var g = w(u);
                    e.on("drain", g);
                    var _ = !1,
                        y = !1;
                    return u.on("data", d), s(e, "error", a), e.once("close", c), e.once("finish", p), e.emit("pipe", u), f.flowing || (D("pipe resume"), u.resume()), e
                }, a.prototype.unpipe = function(e) {
                    var t = this._readableState,
                        n = {
                            hasUnpiped: !1
                        };
                    if (0 === t.pipesCount) return this;
                    if (1 === t.pipesCount) return e && e !== t.pipes ? this : (e || (e = t.pipes), t.pipes = null, t.pipesCount = 0, t.flowing = !1, e && e.emit("unpipe", this, n), this);
                    if (!e) {
                        var r = t.pipes,
                            o = t.pipesCount;
                        t.pipes = null, t.pipesCount = 0, t.flowing = !1;
                        for (var s = 0; s < o; s++) r[s].emit("unpipe", this, n);
                        return this
                    }
                    var i = A(t.pipes, e);
                    return -1 === i ? this : (t.pipes.splice(i, 1), t.pipesCount -= 1, 1 === t.pipesCount && (t.pipes = t.pipes[0]), e.emit("unpipe", this, n), this)
                }, a.prototype.on = function(e, t) {
                    var n = M.prototype.on.call(this, e, t);
                    if ("data" === e) !1 !== this._readableState.flowing && this.resume();
                    else if ("readable" === e) {
                        var r = this._readableState;
                        r.endEmitted || r.readableListening || (r.readableListening = r.needReadable = !0, r.emittedReadable = !1, r.reading ? r.length && g(this) : U(k, this))
                    }
                    return n
                }, a.prototype.addListener = a.prototype.on, a.prototype.resume = function() {
                    var e = this._readableState;
                    return e.flowing || (D("resume"), e.flowing = !0, x(this, e)), this
                }, a.prototype.pause = function() {
                    return D("call pause flowing=%j", this._readableState.flowing), !1 !== this._readableState.flowing && (D("pause"), this._readableState.flowing = !1, this.emit("pause")), this
                }, a.prototype.wrap = function(e) {
                    var t = this._readableState,
                        r = !1,
                        o = this;
                    for (var s in e.on("end", function() {
                            if (D("wrapped end"), t.decoder && !t.ended) {
                                var e = t.decoder.end();
                                e && e.length && o.push(e)
                            }
                            o.push(null)
                        }), e.on("data", function(n) {
                            if ((D("wrapped data"), t.decoder && (n = t.decoder.write(n)), !(t.objectMode && (null === n || void 0 === n))) && (t.objectMode || n && n.length)) {
                                var i = o.push(n);
                                i || (r = !0, e.pause())
                            }
                        }), e) void 0 === this[s] && "function" == typeof e[s] && (this[s] = function(t) {
                        return function() {
                            return e[t].apply(e, arguments)
                        }
                    }(s));
                    for (var i = 0; i < V.length; i++) e.on(V[i], o.emit.bind(o, V[i]));
                    return o._read = function(t) {
                        D("wrapped _read", t), r && (r = !1, e.resume())
                    }, o
                }, a._fromList = E
            }).call(this, e("_process"))
        }, {
            "./_stream_duplex": 74,
            "./internal/streams/BufferList": 79,
            "./internal/streams/destroy": 80,
            "./internal/streams/stream": 81,
            _process: 65,
            "core-util-is": 27,
            events: 33,
            inherits: 40,
            isarray: 45,
            "process-nextick-args": 64,
            "safe-buffer": 88,
            "string_decoder/": 102,
            util: 21
        }],
        77: [function(e, t) {
            "use strict";

            function n(e) {
                this.afterTransform = function(t, n) {
                    return r(e, t, n)
                }, this.needTransform = !1, this.transforming = !1, this.writecb = null, this.writechunk = null, this.writeencoding = null
            }

            function r(e, t, n) {
                var r = e._transformState;
                r.transforming = !1;
                var o = r.writecb;
                if (!o) return e.emit("error", new Error("write callback called multiple times"));
                r.writechunk = null, r.writecb = null, null !== n && n !== void 0 && e.push(n), o(t);
                var i = e._readableState;
                i.reading = !1, (i.needReadable || i.length < i.highWaterMark) && e._read(i.highWaterMark)
            }

            function o(e) {
                if (!(this instanceof o)) return new o(e);
                s.call(this, e), this._transformState = new n(this);
                var t = this;
                this._readableState.needReadable = !0, this._readableState.sync = !1, e && ("function" == typeof e.transform && (this._transform = e.transform), "function" == typeof e.flush && (this._flush = e.flush)), this.once("prefinish", function() {
                    "function" == typeof this._flush ? this._flush(function(e, n) {
                        i(t, e, n)
                    }) : i(t)
                })
            }

            function i(e, t, n) {
                if (t) return e.emit("error", t);
                null !== n && n !== void 0 && e.push(n);
                var r = e._writableState,
                    o = e._transformState;
                if (r.length) throw new Error("Calling transform done when ws.length != 0");
                if (o.transforming) throw new Error("Calling transform done when still transforming");
                return e.push(null)
            }
            t.exports = o;
            var s = e("./_stream_duplex"),
                d = e("core-util-is");
            d.inherits = e("inherits"), d.inherits(o, s), o.prototype.push = function(e, t) {
                return this._transformState.needTransform = !1, s.prototype.push.call(this, e, t)
            }, o.prototype._transform = function() {
                throw new Error("_transform() is not implemented")
            }, o.prototype._write = function(e, t, n) {
                var r = this._transformState;
                if (r.writecb = n, r.writechunk = e, r.writeencoding = t, !r.transforming) {
                    var o = this._readableState;
                    (r.needTransform || o.needReadable || o.length < o.highWaterMark) && this._read(o.highWaterMark)
                }
            }, o.prototype._read = function() {
                var e = this._transformState;
                null !== e.writechunk && e.writecb && !e.transforming ? (e.transforming = !0, this._transform(e.writechunk, e.writeencoding, e.afterTransform)) : e.needTransform = !0
            }, o.prototype._destroy = function(e, t) {
                var n = this;
                s.prototype._destroy.call(this, e, function(e) {
                    t(e), n.emit("close")
                })
            }
        }, {
            "./_stream_duplex": 74,
            "core-util-is": 27,
            inherits: 40
        }],
        78: [function(e, t) {
            (function(n) {
                "use strict";

                function o(e) {
                    var t = this;
                    this.next = null, this.entry = null, this.finish = function() {
                        B(t, e)
                    }
                }

                function i(e) {
                    return R.from(e)
                }

                function s(e) {
                    return "[object Uint8Array]" === Object.prototype.toString.call(e) || R.isBuffer(e)
                }

                function d() {}

                function a(t, n) {
                    L = L || e("./_stream_duplex"), t = t || {}, this.objectMode = !!t.objectMode, n instanceof L && (this.objectMode = this.objectMode || !!t.writableObjectMode);
                    var i = t.highWaterMark,
                        s = this.objectMode ? 16 : 16384;
                    this.highWaterMark = i || 0 === i ? i : s, this.highWaterMark = r(this.highWaterMark), this.finalCalled = !1, this.needDrain = !1, this.ending = !1, this.ended = !1, this.finished = !1, this.destroyed = !1;
                    var d = !1 === t.decodeStrings;
                    this.decodeStrings = !d, this.defaultEncoding = t.defaultEncoding || "utf8", this.length = 0, this.writing = !1, this.corked = 0, this.sync = !0, this.bufferProcessing = !1, this.onwrite = function(e) {
                        _(n, e)
                    }, this.writecb = null, this.writelen = 0, this.bufferedRequest = null, this.lastBufferedRequest = null, this.pendingcb = 0, this.prefinished = !1, this.errorEmitted = !1, this.bufferedRequestCount = 0, this.corkedRequestsFree = new o(this)
                }

                function c(t) {
                    return L = L || e("./_stream_duplex"), O.call(c, this) || this instanceof L ? void(this._writableState = new a(t, this), this.writable = !0, t && ("function" == typeof t.write && (this._write = t.write), "function" == typeof t.writev && (this._writev = t.writev), "function" == typeof t.destroy && (this._destroy = t.destroy), "function" == typeof t.final && (this._final = t.final)), U.call(this)) : new c(t)
                }

                function p(e, t) {
                    var n = new Error("write after end");
                    e.emit("error", n), I(t, n)
                }

                function l(e, t, n, r) {
                    var o = !0,
                        i = !1;
                    return null === n ? i = new TypeError("May not write null values to stream") : "string" != typeof n && void 0 !== n && !t.objectMode && (i = new TypeError("Invalid non-string/buffer chunk")), i && (e.emit("error", i), I(r, i), o = !1), o
                }

                function u(e, t, n) {
                    return e.objectMode || !1 === e.decodeStrings || "string" != typeof t || (t = R.from(t, n)), t
                }

                function f(e, t, n, r, o, i) {
                    if (!n) {
                        var s = u(t, r, o);
                        r !== s && (n = !0, o = "buffer", r = s)
                    }
                    var d = t.objectMode ? 1 : r.length;
                    t.length += d;
                    var a = t.length < t.highWaterMark;
                    if (a || (t.needDrain = !0), t.writing || t.corked) {
                        var c = t.lastBufferedRequest;
                        t.lastBufferedRequest = {
                            chunk: r,
                            encoding: o,
                            isBuf: n,
                            callback: i,
                            next: null
                        }, c ? c.next = t.lastBufferedRequest : t.bufferedRequest = t.lastBufferedRequest, t.bufferedRequestCount += 1
                    } else h(e, t, !1, d, r, o, i);
                    return a
                }

                function h(e, t, n, r, o, i, s) {
                    t.writelen = r, t.writecb = s, t.writing = !0, t.sync = !0, n ? e._writev(o, t.onwrite) : e._write(o, i, t.onwrite), t.sync = !1
                }

                function m(e, t, n, r, o) {
                    --t.pendingcb, n ? (I(o, r), I(S, e, t), e._writableState.errorEmitted = !0, e.emit("error", r)) : (o(r), e._writableState.errorEmitted = !0, e.emit("error", r), S(e, t))
                }

                function g(e) {
                    e.writing = !1, e.writecb = null, e.length -= e.writelen, e.writelen = 0
                }

                function _(e, t) {
                    var n = e._writableState,
                        r = n.sync,
                        o = n.writecb;
                    if (g(n), t) m(e, n, r, t, o);
                    else {
                        var i = k(n);
                        i || n.corked || n.bufferProcessing || !n.bufferedRequest || w(e, n), r ? C(y, e, n, i, o) : y(e, n, i, o)
                    }
                }

                function y(e, t, n, r) {
                    n || b(e, t), t.pendingcb--, r(), S(e, t)
                }

                function b(e, t) {
                    0 === t.length && t.needDrain && (t.needDrain = !1, e.emit("drain"))
                }

                function w(e, t) {
                    t.bufferProcessing = !0;
                    var n = t.bufferedRequest;
                    if (e._writev && n && n.next) {
                        var r = t.bufferedRequestCount,
                            i = Array(r),
                            s = t.corkedRequestsFree;
                        s.entry = n;
                        for (var d = 0, a = !0; n;) i[d] = n, n.isBuf || (a = !1), n = n.next, d += 1;
                        i.allBuffers = a, h(e, t, !0, t.length, i, "", s.finish), t.pendingcb++, t.lastBufferedRequest = null, s.next ? (t.corkedRequestsFree = s.next, s.next = null) : t.corkedRequestsFree = new o(t)
                    } else {
                        for (; n;) {
                            var c = n.chunk,
                                p = n.encoding,
                                l = n.callback,
                                u = t.objectMode ? 1 : c.length;
                            if (h(e, t, !1, u, c, p, l), n = n.next, t.writing) break
                        }
                        null === n && (t.lastBufferedRequest = null)
                    }
                    t.bufferedRequestCount = 0, t.bufferedRequest = n, t.bufferProcessing = !1
                }

                function k(e) {
                    return e.ending && 0 === e.length && null === e.bufferedRequest && !e.finished && !e.writing
                }

                function x(e, t) {
                    e._final(function(n) {
                        t.pendingcb--, n && e.emit("error", n), t.prefinished = !0, e.emit("prefinish"), S(e, t)
                    })
                }

                function v(e, t) {
                    t.prefinished || t.finalCalled || ("function" == typeof e._final ? (t.pendingcb++, t.finalCalled = !0, I(x, e, t)) : (t.prefinished = !0, e.emit("prefinish")))
                }

                function S(e, t) {
                    var n = k(t);
                    return n && (v(e, t), 0 === t.pendingcb && (t.finished = !0, e.emit("finish"))), n
                }

                function E(e, t, n) {
                    t.ending = !0, S(e, t), n && (t.finished ? I(n) : e.once("finish", n)), t.ended = !0, e.writable = !1
                }

                function B(e, t, n) {
                    var r = e.entry;
                    for (e.entry = null; r;) {
                        var o = r.callback;
                        t.pendingcb--, o(n), r = r.next
                    }
                    t.corkedRequestsFree ? t.corkedRequestsFree.next = e : t.corkedRequestsFree = e
                }
                var I = e("process-nextick-args");
                t.exports = c;
                var C = !n.browser && -1 < ["v0.10", "v0.9."].indexOf(n.version.slice(0, 5)) ? setImmediate : I,
                    L;
                c.WritableState = a;
                var T = e("core-util-is");
                T.inherits = e("inherits");
                var A = {
                        deprecate: e("util-deprecate")
                    },
                    U = e("./internal/streams/stream"),
                    R = e("safe-buffer").Buffer,
                    P = e("./internal/streams/destroy");
                T.inherits(c, U), a.prototype.getBuffer = function() {
                        for (var e = this.bufferedRequest, t = []; e;) t.push(e), e = e.next;
                        return t
                    },
                    function() {
                        try {
                            Object.defineProperty(a.prototype, "buffer", {
                                get: A.deprecate(function() {
                                    return this.getBuffer()
                                }, "_writableState.buffer is deprecated. Use _writableState.getBuffer instead.", "DEP0003")
                            })
                        } catch (e) {}
                    }();
                var O;
                "function" == typeof Symbol && Symbol.hasInstance && "function" == typeof Function.prototype[Symbol.hasInstance] ? (O = Function.prototype[Symbol.hasInstance], Object.defineProperty(c, Symbol.hasInstance, {
                    value: function(e) {
                        return !!O.call(this, e) || e && e._writableState instanceof a
                    }
                })) : O = function(e) {
                    return e instanceof this
                }, c.prototype.pipe = function() {
                    this.emit("error", new Error("Cannot pipe, not readable"))
                }, c.prototype.write = function(e, t, n) {
                    var r = this._writableState,
                        o = !1,
                        a = s(e) && !r.objectMode;
                    return a && !R.isBuffer(e) && (e = i(e)), "function" == typeof t && (n = t, t = null), a ? t = "buffer" : !t && (t = r.defaultEncoding), "function" != typeof n && (n = d), r.ended ? p(this, n) : (a || l(this, r, e, n)) && (r.pendingcb++, o = f(this, r, a, e, t, n)), o
                }, c.prototype.cork = function() {
                    var e = this._writableState;
                    e.corked++
                }, c.prototype.uncork = function() {
                    var e = this._writableState;
                    e.corked && (e.corked--, !e.writing && !e.corked && !e.finished && !e.bufferProcessing && e.bufferedRequest && w(this, e))
                }, c.prototype.setDefaultEncoding = function(e) {
                    if ("string" == typeof e && (e = e.toLowerCase()), !(-1 < ["hex", "utf8", "utf-8", "ascii", "binary", "base64", "ucs2", "ucs-2", "utf16le", "utf-16le", "raw"].indexOf((e + "").toLowerCase()))) throw new TypeError("Unknown encoding: " + e);
                    return this._writableState.defaultEncoding = e, this
                }, c.prototype._write = function(e, t, n) {
                    n(new Error("_write() is not implemented"))
                }, c.prototype._writev = null, c.prototype.end = function(e, t, n) {
                    var r = this._writableState;
                    "function" == typeof e ? (n = e, e = null, t = null) : "function" == typeof t && (n = t, t = null), null !== e && e !== void 0 && this.write(e, t), r.corked && (r.corked = 1, this.uncork()), r.ending || r.finished || E(this, r, n)
                }, Object.defineProperty(c.prototype, "destroyed", {
                    get: function() {
                        return void 0 !== this._writableState && this._writableState.destroyed
                    },
                    set: function(e) {
                        this._writableState && (this._writableState.destroyed = e)
                    }
                }), c.prototype.destroy = P.destroy, c.prototype._undestroy = P.undestroy, c.prototype._destroy = function(e, t) {
                    this.end(), t(e)
                }
            }).call(this, e("_process"))
        }, {
            "./_stream_duplex": 74,
            "./internal/streams/destroy": 80,
            "./internal/streams/stream": 81,
            _process: 65,
            "core-util-is": 27,
            inherits: 40,
            "process-nextick-args": 64,
            "safe-buffer": 88,
            "util-deprecate": 115
        }],
        79: [function(e, t) {
            "use strict";

            function n(e, t) {
                if (!(e instanceof t)) throw new TypeError("Cannot call a class as a function")
            }

            function r(e, t, n) {
                e.copy(t, n)
            }
            var o = e("safe-buffer").Buffer;
            t.exports = function() {
                function e() {
                    n(this, e), this.head = null, this.tail = null, this.length = 0
                }
                return e.prototype.push = function(e) {
                    var t = {
                        data: e,
                        next: null
                    };
                    0 < this.length ? this.tail.next = t : this.head = t, this.tail = t, ++this.length
                }, e.prototype.unshift = function(e) {
                    var t = {
                        data: e,
                        next: this.head
                    };
                    0 === this.length && (this.tail = t), this.head = t, ++this.length
                }, e.prototype.shift = function() {
                    if (0 !== this.length) {
                        var e = this.head.data;
                        return this.head = 1 === this.length ? this.tail = null : this.head.next, --this.length, e
                    }
                }, e.prototype.clear = function() {
                    this.head = this.tail = null, this.length = 0
                }, e.prototype.join = function(e) {
                    if (0 === this.length) return "";
                    for (var t = this.head, n = "" + t.data; t = t.next;) n += e + t.data;
                    return n
                }, e.prototype.concat = function(e) {
                    if (0 === this.length) return o.alloc(0);
                    if (1 === this.length) return this.head.data;
                    for (var t = o.allocUnsafe(e >>> 0), n = this.head, s = 0; n;) r(n.data, t, s), s += n.data.length, n = n.next;
                    return t
                }, e
            }()
        }, {
            "safe-buffer": 88
        }],
        80: [function(e, t) {
            "use strict";

            function n(e, t) {
                e.emit("error", t)
            }
            var r = e("process-nextick-args");
            t.exports = {
                destroy: function(e, t) {
                    var o = this,
                        i = this._readableState && this._readableState.destroyed,
                        s = this._writableState && this._writableState.destroyed;
                    return i || s ? void(t ? t(e) : e && (!this._writableState || !this._writableState.errorEmitted) && r(n, this, e)) : void(this._readableState && (this._readableState.destroyed = !0), this._writableState && (this._writableState.destroyed = !0), this._destroy(e || null, function(e) {
                        !t && e ? (r(n, o, e), o._writableState && (o._writableState.errorEmitted = !0)) : t && t(e)
                    }))
                },
                undestroy: function() {
                    this._readableState && (this._readableState.destroyed = !1, this._readableState.reading = !1, this._readableState.ended = !1, this._readableState.endEmitted = !1), this._writableState && (this._writableState.destroyed = !1, this._writableState.ended = !1, this._writableState.ending = !1, this._writableState.finished = !1, this._writableState.errorEmitted = !1)
                }
            }
        }, {
            "process-nextick-args": 64
        }],
        81: [function(e, t) {
            t.exports = e("events").EventEmitter
        }, {
            events: 33
        }],
        82: [function(e, t, n) {
            n = t.exports = e("./lib/_stream_readable.js"), n.Stream = n, n.Readable = n, n.Writable = e("./lib/_stream_writable.js"), n.Duplex = e("./lib/_stream_duplex.js"), n.Transform = e("./lib/_stream_transform.js"), n.PassThrough = e("./lib/_stream_passthrough.js")
        }, {
            "./lib/_stream_duplex.js": 74,
            "./lib/_stream_passthrough.js": 75,
            "./lib/_stream_readable.js": 76,
            "./lib/_stream_transform.js": 77,
            "./lib/_stream_writable.js": 78
        }],
        83: [function(e, t, n) {
            function r(e, t, n, r) {
                function i() {
                    S.removeEventListener("loadstart", i), n.autoplay && S.play()
                }

                function d() {
                    S.removeEventListener("canplay", d), r(null, S)
                }

                function u() {
                    S = t("iframe"), o(e, function(e, t) {
                        return e ? w(e) : void(S.src = t, ".pdf" !== x && (S.sandbox = "allow-forms allow-scripts"), r(null, S))
                    })
                }

                function w(t) {
                    t.message = "Error rendering file \"" + e.name + "\": " + t.message, a(t.message), r(t)
                }
                var x = l.extname(e.name).toLowerCase(),
                    v = 0,
                    S;
                0 <= g.indexOf(x) ? function() {
                    function r() {
                        a("Use MediaSource API for " + e.name), g(), S.addEventListener("error", u), S.addEventListener("loadstart", i), S.addEventListener("canplay", d);
                        var t = new p(S),
                            n = t.createWriteStream(s(e.name));
                        e.createReadStream().pipe(n), v && (S.currentTime = v)
                    }

                    function c() {
                        a("Use Blob URL for " + e.name), g(), S.addEventListener("error", w), S.addEventListener("loadstart", i), S.addEventListener("canplay", d), o(e, function(e, t) {
                            return e ? w(e) : void(S.src = t, v && (S.currentTime = v))
                        })
                    }

                    function l(e) {
                        a("videostream error: fallback to MediaSource API: %o", e.message || e), S.removeEventListener("error", l), S.removeEventListener("canplay", d), r()
                    }

                    function u(t) {
                        return a("MediaSource API error: fallback to Blob URL: %o", t.message || t), "number" == typeof e.length && e.length > n.maxBlobLength ? (a("File length too large for Blob URL approach: %d (max: %d)", e.length, n.maxBlobLength), w(new Error("File length too large for Blob URL approach: " + e.length + " (max: " + n.maxBlobLength + ")"))) : void(S.removeEventListener("error", u), S.removeEventListener("canplay", d), c())
                    }

                    function g() {
                        S || (S = t(_), S.addEventListener("progress", function() {
                            v = S.currentTime
                        }))
                    }
                    var _ = 0 <= m.indexOf(x) ? "video" : "audio";
                    k ? 0 <= h.indexOf(x) ? function() {
                        a("Use `videostream` package for " + e.name), g(), S.addEventListener("error", l), S.addEventListener("loadstart", i), S.addEventListener("canplay", d), f(e, S)
                    }() : r() : c()
                }() : 0 <= _.indexOf(x) ? function() {
                    S = t("audio"), o(e, function(e, t) {
                        return e ? w(e) : void(S.addEventListener("error", w), S.addEventListener("loadstart", i), S.addEventListener("canplay", d), S.src = t)
                    })
                }() : 0 <= y.indexOf(x) ? function() {
                    S = t("img"), o(e, function(t, n) {
                        return t ? w(t) : void(S.src = n, S.alt = e.name, r(null, S))
                    })
                }() : 0 <= b.indexOf(x) ? u() : function() {
                    a("Unknown file extension \"%s\" - will attempt to render into iframe", x);
                    var t = "";
                    e.createReadStream({
                        start: 0,
                        end: 1e3
                    }).setEncoding("utf8").on("data", function(e) {
                        t += e
                    }).on("end", function() {
                        c(t) ? (a("File extension \"%s\" appears ascii, so will render.", x), u()) : (a("File extension \"%s\" appears non-ascii, will not render.", x), r(new Error("Unsupported file type \"" + x + "\": Cannot append to DOM")))
                    }).on("error", r)
                }()
            }

            function o(e, t) {
                var r = l.extname(e.name).toLowerCase();
                u(e.createReadStream(), n.mime[r], t)
            }

            function i(e) {
                if (null == e) throw new Error("file cannot be null or undefined");
                if ("string" != typeof e.name) throw new Error("missing or invalid file.name property");
                if ("function" != typeof e.createReadStream) throw new Error("missing or invalid file.createReadStream property")
            }

            function s(e) {
                var t = l.extname(e).toLowerCase();
                return {
                    ".m4a": "audio/mp4; codecs=\"mp4a.40.5\"",
                    ".m4v": "video/mp4; codecs=\"avc1.640029, mp4a.40.5\"",
                    ".mkv": "video/webm; codecs=\"avc1.640029, mp4a.40.5\"",
                    ".mp3": "audio/mpeg",
                    ".mp4": "video/mp4; codecs=\"avc1.640029, mp4a.40.5\"",
                    ".webm": "video/webm; codecs=\"vorbis, vp8\""
                }[t]
            }

            function d(e) {
                null == e.autoplay && (e.autoplay = !0), null == e.controls && (e.controls = !0), null == e.maxBlobLength && (e.maxBlobLength = w)
            }
            n.render = function(e, t, n, o) {
                "function" == typeof n && (o = n, n = {}), n || (n = {}), o || (o = function() {}), i(e), d(n), "string" == typeof t && (t = document.querySelector(t)), r(e, function(n) {
                    if (t.nodeName !== n.toUpperCase()) {
                        var r = l.extname(e.name).toLowerCase();
                        throw new Error("Cannot render \"" + r + "\" inside a \"" + t.nodeName.toLowerCase() + "\" element, expected \"" + n + "\"")
                    }
                    return t
                }, n, o)
            }, n.append = function(e, t, n, o) {
                function s(e) {
                    var r = a(e);
                    return n.controls && (r.controls = !0), n.autoplay && (r.autoplay = !0), t.appendChild(r), r
                }

                function a(e) {
                    var n = document.createElement(e);
                    return t.appendChild(n), n
                }
                if ("function" == typeof n && (o = n, n = {}), n || (n = {}), o || (o = function() {}), i(e), d(n), "string" == typeof t && (t = document.querySelector(t)), t && ("VIDEO" === t.nodeName || "AUDIO" === t.nodeName)) throw new Error("Invalid video/audio node argument. Argument must be root element that video/audio tag will be appended to.");
                r(e, function(e) {
                    return "video" === e || "audio" === e ? s(e) : a(e)
                }, n, function(e, t) {
                    e && t && t.remove(), o(e, t)
                })
            }, n.mime = e("./lib/mime.json");
            var a = e("debug")("render-media"),
                c = e("is-ascii"),
                p = e("mediasource"),
                l = e("path"),
                u = e("stream-to-blob-url"),
                f = e("videostream"),
                h = [".m4a", ".m4v", ".mp4"],
                m = [".m4v", ".mkv", ".mp4", ".webm"],
                g = [].concat(m, [".m4a", ".mp3"]),
                _ = [".aac", ".oga", ".ogg", ".wav"],
                y = [".bmp", ".gif", ".jpeg", ".jpg", ".png", ".svg"],
                b = [".css", ".html", ".js", ".md", ".pdf", ".txt"],
                w = 200000000,
                k = "undefined" != typeof window && window.MediaSource
        }, {
            "./lib/mime.json": 84,
            debug: 29,
            "is-ascii": 41,
            mediasource: 48,
            path: 62,
            "stream-to-blob-url": 99,
            videostream: 117
        }],
        84: [function(e, t) {
            t.exports = {
                ".3gp": "video/3gpp",
                ".aac": "audio/aac",
                ".aif": "audio/x-aiff",
                ".aiff": "audio/x-aiff",
                ".atom": "application/atom+xml",
                ".avi": "video/x-msvideo",
                ".bmp": "image/bmp",
                ".bz2": "application/x-bzip2",
                ".conf": "text/plain",
                ".css": "text/css",
                ".csv": "text/plain",
                ".diff": "text/x-diff",
                ".doc": "application/msword",
                ".flv": "video/x-flv",
                ".gif": "image/gif",
                ".gz": "application/x-gzip",
                ".htm": "text/html",
                ".html": "text/html",
                ".ico": "image/vnd.microsoft.icon",
                ".ics": "text/calendar",
                ".iso": "application/octet-stream",
                ".jar": "application/java-archive",
                ".jpeg": "image/jpeg",
                ".jpg": "image/jpeg",
                ".js": "application/javascript",
                ".json": "application/json",
                ".less": "text/css",
                ".log": "text/plain",
                ".m3u": "audio/x-mpegurl",
                ".m4a": "audio/mp4",
                ".m4v": "video/mp4",
                ".manifest": "text/cache-manifest",
                ".markdown": "text/x-markdown",
                ".mathml": "application/mathml+xml",
                ".md": "text/x-markdown",
                ".mid": "audio/midi",
                ".midi": "audio/midi",
                ".mov": "video/quicktime",
                ".mp3": "audio/mpeg",
                ".mp4": "video/mp4",
                ".mp4v": "video/mp4",
                ".mpeg": "video/mpeg",
                ".mpg": "video/mpeg",
                ".odp": "application/vnd.oasis.opendocument.presentation",
                ".ods": "application/vnd.oasis.opendocument.spreadsheet",
                ".odt": "application/vnd.oasis.opendocument.text",
                ".oga": "audio/ogg",
                ".ogg": "application/ogg",
                ".pdf": "application/pdf",
                ".png": "image/png",
                ".pps": "application/vnd.ms-powerpoint",
                ".ppt": "application/vnd.ms-powerpoint",
                ".ps": "application/postscript",
                ".psd": "image/vnd.adobe.photoshop",
                ".qt": "video/quicktime",
                ".rar": "application/x-rar-compressed",
                ".rdf": "application/rdf+xml",
                ".rss": "application/rss+xml",
                ".rtf": "application/rtf",
                ".svg": "image/svg+xml",
                ".svgz": "image/svg+xml",
                ".swf": "application/x-shockwave-flash",
                ".tar": "application/x-tar",
                ".tbz": "application/x-bzip-compressed-tar",
                ".text": "text/plain",
                ".tif": "image/tiff",
                ".tiff": "image/tiff",
                ".torrent": "application/x-bittorrent",
                ".ttf": "application/x-font-ttf",
                ".txt": "text/plain",
                ".wav": "audio/wav",
                ".webm": "video/webm",
                ".wma": "audio/x-ms-wma",
                ".wmv": "video/x-ms-wmv",
                ".xls": "application/vnd.ms-excel",
                ".xml": "application/xml",
                ".yaml": "text/yaml",
                ".yml": "text/yaml",
                ".zip": "application/zip"
            }
        }, {}],
        85: [function(e, t) {
            (function(e) {
                t.exports = function(t, n, r) {
                    function o(t) {
                        function n() {
                            r && r(t, d), r = null
                        }
                        i ? e.nextTick(n) : n()
                    }

                    function s(e, n, r) {
                        if (d[e] = r, n && (l = !0), 0 == --c || n) o(n);
                        else if (!l && u < a) {
                            var i;
                            p ? (i = p[u], u += 1, t[i](function(e, t) {
                                s(i, e, t)
                            })) : (i = u, u += 1, t[i](function(e, t) {
                                s(i, e, t)
                            }))
                        }
                    }
                    if ("number" != typeof n) throw new Error("second argument must be a Number");
                    var i = !0,
                        d, a, c, p, l;
                    Array.isArray(t) ? (d = [], c = a = t.length) : (p = Object.keys(t), d = {}, c = a = p.length);
                    var u = n;
                    c ? p ? p.some(function(e, r) {
                        if (t[e](function(t, n) {
                                s(e, t, n)
                            }), r === n - 1) return !0
                    }) : t.some(function(e, t) {
                        if (e(function(e, n) {
                                s(t, e, n)
                            }), t === n - 1) return !0
                    }) : o(null), i = !1
                }
            }).call(this, e("_process"))
        }, {
            _process: 65
        }],
        86: [function(e, t) {
            (function(e) {
                t.exports = function(t, n) {
                    function r(t) {
                        function r() {
                            n && n(t, s), n = null
                        }
                        i ? e.nextTick(r) : r()
                    }

                    function o(e, t, n) {
                        s[e] = n, (0 == --d || t) && r(t)
                    }
                    var i = !0,
                        s, d, a;
                    Array.isArray(t) ? (s = [], d = t.length) : (a = Object.keys(t), s = {}, d = a.length), d ? a ? a.forEach(function(e) {
                        t[e](function(t, n) {
                            o(e, t, n)
                        })
                    }) : t.forEach(function(e, t) {
                        e(function(e, n) {
                            o(t, e, n)
                        })
                    }) : r(null), i = !1
                }
            }).call(this, e("_process"))
        }, {
            _process: 65
        }],
        87: [function(e, t) {
            (function(e) {
                (function() {
                    function n(e) {
                        "use strict";
                        for (var t = {
                                fill: 0
                            }, s = function(e) {
                                for (e += 9; 0 < e % 64; e += 1);
                                return e
                            }, a = function(e, t) {
                                var n = new Uint8Array(e.buffer),
                                    r = t % 4,
                                    o = t - r;
                                switch (r) {
                                    case 0:
                                        n[o + 3] = 0;
                                    case 1:
                                        n[o + 2] = 0;
                                    case 2:
                                        n[o + 1] = 0;
                                    case 3:
                                        n[o + 0] = 0;
                                }
                                for (var i = (t >> 2) + 1; i < e.length; i++) e[i] = 0
                            }, c = function(e, t, n) {
                                e[t >> 2] |= 128 << 24 - (t % 4 << 3), e[(-16 & (t >> 2) + 2) + 14] = 0 | n / 536870912, e[(-16 & (t >> 2) + 2) + 15] = n << 3
                            }, p = function(e, t, n, r, o) {
                                var i = this,
                                    s = o % 4,
                                    d = (r + s) % 4,
                                    a = r - d,
                                    c;
                                switch (s) {
                                    case 0:
                                        e[o] = i.charCodeAt(n + 3);
                                    case 1:
                                        e[0 | o + 1 - (s << 1)] = i.charCodeAt(n + 2);
                                    case 2:
                                        e[0 | o + 2 - (s << 1)] = i.charCodeAt(n + 1);
                                    case 3:
                                        e[0 | o + 3 - (s << 1)] = i.charCodeAt(n);
                                }
                                if (!(r < d + s)) {
                                    for (c = 4 - s; c < a; c = 0 | c + 4) t[o + c >> 2] = i.charCodeAt(n + c) << 24 | i.charCodeAt(n + c + 1) << 16 | i.charCodeAt(n + c + 2) << 8 | i.charCodeAt(n + c + 3);
                                    switch (d) {
                                        case 3:
                                            e[0 | o + a + 1] = i.charCodeAt(n + a + 2);
                                        case 2:
                                            e[0 | o + a + 2] = i.charCodeAt(n + a + 1);
                                        case 1:
                                            e[0 | o + a + 3] = i.charCodeAt(n + a);
                                    }
                                }
                            }, l = function(e, t, n, r, o) {
                                var i = this,
                                    s = o % 4,
                                    d = (r + s) % 4,
                                    a = r - d,
                                    c;
                                switch (s) {
                                    case 0:
                                        e[o] = i[n + 3];
                                    case 1:
                                        e[0 | o + 1 - (s << 1)] = i[n + 2];
                                    case 2:
                                        e[0 | o + 2 - (s << 1)] = i[n + 1];
                                    case 3:
                                        e[0 | o + 3 - (s << 1)] = i[n];
                                }
                                if (!(r < d + s)) {
                                    for (c = 4 - s; c < a; c = 0 | c + 4) t[0 | o + c >> 2] = i[n + c] << 24 | i[n + c + 1] << 16 | i[n + c + 2] << 8 | i[n + c + 3];
                                    switch (d) {
                                        case 3:
                                            e[0 | o + a + 1] = i[n + a + 2];
                                        case 2:
                                            e[0 | o + a + 2] = i[n + a + 1];
                                        case 1:
                                            e[0 | o + a + 3] = i[n + a];
                                    }
                                }
                            }, u = function(e, t, n, r, i) {
                                var s = this,
                                    d = i % 4,
                                    a = (r + d) % 4,
                                    c = r - a,
                                    p = new Uint8Array(o.readAsArrayBuffer(s.slice(n, n + r))),
                                    l;
                                switch (d) {
                                    case 0:
                                        e[i] = p[3];
                                    case 1:
                                        e[0 | i + 1 - (d << 1)] = p[2];
                                    case 2:
                                        e[0 | i + 2 - (d << 1)] = p[1];
                                    case 3:
                                        e[0 | i + 3 - (d << 1)] = p[0];
                                }
                                if (!(r < a + d)) {
                                    for (l = 4 - d; l < c; l = 0 | l + 4) t[0 | i + l >> 2] = p[l] << 24 | p[l + 1] << 16 | p[l + 2] << 8 | p[l + 3];
                                    switch (a) {
                                        case 3:
                                            e[0 | i + c + 1] = p[c + 2];
                                        case 2:
                                            e[0 | i + c + 2] = p[c + 1];
                                        case 1:
                                            e[0 | i + c + 3] = p[c];
                                    }
                                }
                            }, f = function(e) {
                                switch (r.getDataType(e)) {
                                    case "string":
                                        return p.bind(e);
                                    case "array":
                                        return l.bind(e);
                                    case "buffer":
                                        return l.bind(e);
                                    case "arraybuffer":
                                        return l.bind(new Uint8Array(e));
                                    case "view":
                                        return l.bind(new Uint8Array(e.buffer, e.byteOffset, e.byteLength));
                                    case "blob":
                                        return u.bind(e);
                                }
                            }, h = Array(256), m = 0; 256 > m; m++) h[m] = (16 > m ? "0" : "") + m.toString(16);
                        var i = function(e) {
                                for (var t = new Uint8Array(e), n = Array(e.byteLength), r = 0; r < n.length; r++) n[r] = h[t[r]];
                                return n.join("")
                            },
                            g = function(e) {
                                var t;
                                if (65536 >= e) return 65536;
                                if (16777216 > e)
                                    for (t = 1; t < e; t <<= 1);
                                else
                                    for (t = 16777216; t < e; t += 16777216);
                                return t
                            };
                        (function(e) {
                            if (0 < e % 64) throw new Error("Chunk size must be a multiple of 128 bit");
                            t.offset = 0, t.maxChunkLen = e, t.padMaxChunkLen = s(e), t.heap = new ArrayBuffer(g(t.padMaxChunkLen + 320 + 20)), t.h32 = new Int32Array(t.heap), t.h8 = new Int8Array(t.heap), t.core = new n._core({
                                Int32Array: Int32Array,
                                DataView: DataView
                            }, {}, t.heap), t.buffer = null
                        })(e || 65536);
                        var _ = function(e, n) {
                                t.offset = 0;
                                var r = new Int32Array(e, n + 320, 5);
                                r[0] = 1732584193, r[1] = -271733879, r[2] = -1732584194, r[3] = 271733878, r[4] = -1009589776
                            },
                            y = function(e, n) {
                                var r = s(e),
                                    o = new Int32Array(t.heap, 0, r >> 2);
                                return a(o, e), c(o, e, n), r
                            },
                            b = function(e, n, r, o) {
                                f(e)(t.h8, t.h32, n, r, o || 0)
                            },
                            w = function(e, n, r, o, i) {
                                var s = r;
                                b(e, n, r), i && (s = y(r, o)), t.core.hash(s, t.padMaxChunkLen)
                            },
                            k = function(e, t) {
                                var n = new Int32Array(e, t + 320, 5),
                                    r = new Int32Array(5),
                                    o = new DataView(r.buffer);
                                return o.setInt32(0, n[0], !1), o.setInt32(4, n[1], !1), o.setInt32(8, n[2], !1), o.setInt32(12, n[3], !1), o.setInt32(16, n[4], !1), r
                            },
                            x = this.rawDigest = function(e) {
                                var n = e.byteLength || e.length || e.size || 0;
                                _(t.heap, t.padMaxChunkLen);
                                var r = 0,
                                    o = t.maxChunkLen;
                                for (r = 0; n > r + o; r += o) w(e, r, o, n, !1);
                                return w(e, r, n - r, n, !0), k(t.heap, t.padMaxChunkLen)
                            };
                        this.digest = this.digestFromString = this.digestFromBuffer = this.digestFromArrayBuffer = function(e) {
                            return i(x(e).buffer)
                        }, this.resetState = function() {
                            return _(t.heap, t.padMaxChunkLen), this
                        }, this.append = function(e) {
                            var n = 0,
                                r = e.byteLength || e.length || e.size || 0,
                                o = t.offset % t.maxChunkLen,
                                i;
                            for (t.offset += r; n < r;) i = d(r - n, t.maxChunkLen - o), b(e, n, i, o), o += i, n += i, o === t.maxChunkLen && (t.core.hash(t.maxChunkLen, t.padMaxChunkLen), o = 0);
                            return this
                        }, this.getState = function() {
                            var e = t.offset % t.maxChunkLen,
                                n;
                            if (!e) {
                                var r = new Int32Array(t.heap, t.padMaxChunkLen + 320, 5);
                                n = r.buffer.slice(r.byteOffset, r.byteOffset + r.byteLength)
                            } else n = t.heap.slice(0);
                            return {
                                offset: t.offset,
                                heap: n
                            }
                        }, this.setState = function(e) {
                            if (t.offset = e.offset, 20 === e.heap.byteLength) {
                                var n = new Int32Array(t.heap, t.padMaxChunkLen + 320, 5);
                                n.set(new Int32Array(e.heap))
                            } else t.h32.set(new Int32Array(e.heap));
                            return this
                        };
                        var v = this.rawEnd = function() {
                            var e = t.offset,
                                n = e % t.maxChunkLen,
                                r = y(n, e);
                            t.core.hash(r, t.padMaxChunkLen);
                            var o = k(t.heap, t.padMaxChunkLen);
                            return _(t.heap, t.padMaxChunkLen), o
                        };
                        this.end = function() {
                            return i(v().buffer)
                        }
                    }
                    var r = {
                        getDataType: function(t) {
                            if ("string" == typeof t) return "string";
                            if (t instanceof Array) return "array";
                            if ("undefined" != typeof e && e.Buffer && e.Buffer.isBuffer(t)) return "buffer";
                            if (t instanceof ArrayBuffer) return "arraybuffer";
                            if (t.buffer instanceof ArrayBuffer) return "view";
                            if (t instanceof Blob) return "blob";
                            throw new Error("Unsupported data type.")
                        }
                    };
                    if (n._core = function(e, t, n) {
                            "use asm";
                            var r = new e.Int32Array(n);
                            return {
                                hash: function(e, t) {
                                    e |= 0, t |= 0;
                                    var n = 0,
                                        o = 0,
                                        i = 0,
                                        s = 0,
                                        d = 0,
                                        a = 0,
                                        c = 0,
                                        p = 0,
                                        l = 0,
                                        u = 0,
                                        f = 0,
                                        h = 0,
                                        m = 0,
                                        g = 0;
                                    for (i = 0 | r[t + 320 >> 2], d = 0 | r[t + 324 >> 2], c = 0 | r[t + 328 >> 2], l = 0 | r[t + 332 >> 2], f = 0 | r[t + 336 >> 2], n = 0;
                                        (0 | n) < (0 | e); n = 0 | n + 64) {
                                        for (s = i, a = d, p = c, u = l, h = f, o = 0; 64 > (0 | o); o = 0 | o + 4) g = 0 | r[n + o >> 2], m = 0 | (0 | (i << 5 | i >>> 27) + (d & c | ~d & l)) + (0 | (0 | g + f) + 1518500249), f = l, l = c, c = d << 30 | d >>> 2, d = i, i = m, r[e + o >> 2] = g;
                                        for (o = 0 | e + 64;
                                            (0 | o) < (0 | e + 80); o = 0 | o + 4) g = (r[o - 12 >> 2] ^ r[o - 32 >> 2] ^ r[o - 56 >> 2] ^ r[o - 64 >> 2]) << 1 | (r[o - 12 >> 2] ^ r[o - 32 >> 2] ^ r[o - 56 >> 2] ^ r[o - 64 >> 2]) >>> 31, m = 0 | (0 | (i << 5 | i >>> 27) + (d & c | ~d & l)) + (0 | (0 | g + f) + 1518500249), f = l, l = c, c = d << 30 | d >>> 2, d = i, i = m, r[o >> 2] = g;
                                        for (o = 0 | e + 80;
                                            (0 | o) < (0 | e + 160); o = 0 | o + 4) g = (r[o - 12 >> 2] ^ r[o - 32 >> 2] ^ r[o - 56 >> 2] ^ r[o - 64 >> 2]) << 1 | (r[o - 12 >> 2] ^ r[o - 32 >> 2] ^ r[o - 56 >> 2] ^ r[o - 64 >> 2]) >>> 31, m = 0 | (0 | (i << 5 | i >>> 27) + (d ^ c ^ l)) + (0 | (0 | g + f) + 1859775393), f = l, l = c, c = d << 30 | d >>> 2, d = i, i = m, r[o >> 2] = g;
                                        for (o = 0 | e + 160;
                                            (0 | o) < (0 | e + 240); o = 0 | o + 4) g = (r[o - 12 >> 2] ^ r[o - 32 >> 2] ^ r[o - 56 >> 2] ^ r[o - 64 >> 2]) << 1 | (r[o - 12 >> 2] ^ r[o - 32 >> 2] ^ r[o - 56 >> 2] ^ r[o - 64 >> 2]) >>> 31, m = 0 | (0 | (i << 5 | i >>> 27) + (d & c | d & l | c & l)) + (0 | (0 | g + f) - 1894007588), f = l, l = c, c = d << 30 | d >>> 2, d = i, i = m, r[o >> 2] = g;
                                        for (o = 0 | e + 240;
                                            (0 | o) < (0 | e + 320); o = 0 | o + 4) g = (r[o - 12 >> 2] ^ r[o - 32 >> 2] ^ r[o - 56 >> 2] ^ r[o - 64 >> 2]) << 1 | (r[o - 12 >> 2] ^ r[o - 32 >> 2] ^ r[o - 56 >> 2] ^ r[o - 64 >> 2]) >>> 31, m = 0 | (0 | (i << 5 | i >>> 27) + (d ^ c ^ l)) + (0 | (0 | g + f) - 899497514), f = l, l = c, c = d << 30 | d >>> 2, d = i, i = m, r[o >> 2] = g;
                                        i = 0 | i + s, d = 0 | d + a, c = 0 | c + p, l = 0 | l + u, f = 0 | f + h
                                    }
                                    r[t + 320 >> 2] = i, r[t + 324 >> 2] = d, r[t + 328 >> 2] = c, r[t + 332 >> 2] = l, r[t + 336 >> 2] = f
                                }
                            }
                        }, "undefined" == typeof t ? "undefined" != typeof window && (window.Rusha = n) : t.exports = n, "undefined" != typeof FileReaderSync) {
                        var o = new FileReaderSync,
                            i = function(e, t, n) {
                                try {
                                    return n(null, e.digest(t))
                                } catch (t) {
                                    return n(t)
                                }
                            },
                            s = function(e, t, n, r, o) {
                                var i = new self.FileReader;
                                i.onloadend = function() {
                                    var d = i.result;
                                    t += i.result.byteLength;
                                    try {
                                        e.append(d)
                                    } catch (t) {
                                        return void o(t)
                                    }
                                    t < r.size ? s(e, t, n, r, o) : o(null, e.end())
                                }, i.readAsArrayBuffer(r.slice(t, t + n))
                            };
                        self.onmessage = function(e) {
                            var t = e.data.data,
                                r = e.data.file,
                                o = e.data.id;
                            if ("undefined" != typeof o && (r || t)) {
                                var d = e.data.blockSize || 4194304,
                                    a = new n(d);
                                a.resetState();
                                var c = function(e, t) {
                                    e ? self.postMessage({
                                        id: o,
                                        error: e.name
                                    }) : self.postMessage({
                                        id: o,
                                        hash: t
                                    })
                                };
                                t && i(a, t, c), r && s(a, 0, d, r, c)
                            }
                        }
                    }
                })()
            }).call(this, "undefined" == typeof global ? "undefined" == typeof self ? "undefined" == typeof window ? {} : window : self : global)
        }, {}],
        88: [function(e, t, n) {
            function r(e, t) {
                for (var n in e) t[n] = e[n]
            }

            function o(e, t, n) {
                return s(e, t, n)
            }
            var i = e("buffer"),
                s = i.Buffer;
            s.from && s.alloc && s.allocUnsafe && s.allocUnsafeSlow ? t.exports = i : (r(i, n), n.Buffer = o), r(s, o), o.from = function(e, t, n) {
                if ("number" == typeof e) throw new TypeError("Argument must not be a number");
                return s(e, t, n)
            }, o.alloc = function(e, t, n) {
                if ("number" != typeof e) throw new TypeError("Argument must be a number");
                var r = s(e);
                return void 0 === t ? r.fill(0) : "string" == typeof n ? r.fill(t, n) : r.fill(t), r
            }, o.allocUnsafe = function(e) {
                if ("number" != typeof e) throw new TypeError("Argument must be a number");
                return s(e)
            }, o.allocUnsafeSlow = function(e) {
                if ("number" != typeof e) throw new TypeError("Argument must be a number");
                return i.SlowBuffer(e)
            }
        }, {
            buffer: 23
        }],
        89: [function(e, t) {
            (function(e) {
                t.exports = function(t, n) {
                    var r = [];
                    t.on("data", function(e) {
                        r.push(e)
                    }), t.once("end", function() {
                        n && n(null, e.concat(r)), n = null
                    }), t.once("error", function(e) {
                        n && n(e), n = null
                    })
                }
            }).call(this, e("buffer").Buffer)
        }, {
            buffer: 23
        }],
        90: [function(e, t) {
            (function(n) {
                function r(e, t) {
                    e = "string" == typeof e ? {
                        url: e
                    } : Object.assign({}, e), t = c(t), e.url && o(e), null == e.headers && (e.headers = {}), null == e.maxRedirects && (e.maxRedirects = 10);
                    var s;
                    e.form && (s = "string" == typeof e.form ? e.form : p.stringify(e.form)), e.body && (s = e.json ? JSON.stringify(e.body) : e.body), e.json && (e.headers.accept = "application/json"), e.json && s && (e.headers["content-type"] = "application/json"), e.form && (e.headers["content-type"] = "application/x-www-form-urlencoded"), s && !i(s) && (e.headers["content-length"] = n.byteLength(s)), delete e.body, delete e.form, s && !e.method && (e.method = "POST"), e.method && (e.method = e.method.toUpperCase());
                    var u = Object.keys(e.headers).some(function(e) {
                        return "accept-encoding" === e.toLowerCase()
                    });
                    u || (e.headers["accept-encoding"] = "gzip, deflate");
                    var f = "https:" === e.protocol ? a : d,
                        h = f.request(e, function(n) {
                            if (300 <= n.statusCode && 400 > n.statusCode && "location" in n.headers) return e.url = n.headers.location, n.resume(), void(0 < e.maxRedirects ? (e.maxRedirects -= 1, r(e, t)) : t(new Error("too many redirects")));
                            var o = "function" == typeof l && "HEAD" !== e.method;
                            t(null, o ? l(n) : n)
                        });
                    return h.on("timeout", function() {
                        h.abort(), t(new Error("Request timed out"))
                    }), h.on("error", t), s && i(s) ? s.on("error", t).pipe(h) : h.end(s), h
                }

                function o(e) {
                    var t = u.parse(e.url);
                    t.hostname && (e.hostname = t.hostname), t.port && (e.port = t.port), t.protocol && (e.protocol = t.protocol), t.auth && (e.auth = t.auth), e.path = t.path, delete e.url
                }

                function i(e) {
                    return "function" == typeof e.pipe
                }
                t.exports = r;
                var s = e("simple-concat"),
                    d = e("http"),
                    a = e("https"),
                    c = e("once"),
                    p = e("querystring"),
                    l = e("unzip-response"),
                    u = e("url");
                r.concat = function(e, t) {
                    return r(e, function(n, r) {
                        return n ? t(n) : void s(r, function(n, o) {
                            if (n) return t(n);
                            if (e.json) try {
                                o = JSON.parse(o.toString())
                            } catch (e) {
                                return t(e, r, o)
                            }
                            t(null, r, o)
                        })
                    })
                }, ["get", "post", "put", "patch", "head", "delete"].forEach(function(e) {
                    r[e] = function(t, n) {
                        return "string" == typeof t && (t = {
                            url: t
                        }), t.method = e.toUpperCase(), r(t, n)
                    }
                })
            }).call(this, e("buffer").Buffer)
        }, {
            buffer: 23,
            http: 95,
            https: 37,
            once: 59,
            querystring: 70,
            "simple-concat": 89,
            "unzip-response": 21,
            url: 112
        }],
        91: [function(e, t) {
            (function(n) {
                function r(e) {
                    var t = this;
                    if (!(t instanceof r)) return new r(e);
                    if (t._id = a(4).toString("hex").slice(0, 7), t._debug("new peer %o", e), e = Object.assign({
                            allowHalfOpen: !1
                        }, e), c.Duplex.call(t, e), t.channelName = e.initiator ? e.channelName || a(20).toString("hex") : null, t._isChromium = "undefined" != typeof window && !!window.webkitRTCPeerConnection, t.initiator = e.initiator || !1, t.channelConfig = e.channelConfig || r.channelConfig, t.config = e.config || r.config, t.constraints = t._transformConstraints(e.constraints || r.constraints), t.offerConstraints = t._transformConstraints(e.offerConstraints || {}), t.answerConstraints = t._transformConstraints(e.answerConstraints || {}), t.reconnectTimer = e.reconnectTimer || !1, t.sdpTransform = e.sdpTransform || function(e) {
                            return e
                        }, t.stream = e.stream || !1, t.trickle = void 0 === e.trickle || e.trickle, t._earlyMessage = null, t.destroyed = !1, t.connected = !1, t.remoteAddress = void 0, t.remoteFamily = void 0, t.remotePort = void 0, t.localAddress = void 0, t.localPort = void 0, t._wrtc = e.wrtc && "object" == typeof e.wrtc ? e.wrtc : s(), !t._wrtc)
                        if ("undefined" == typeof window) throw new Error("No WebRTC support: Specify `opts.wrtc` option in this environment");
                        else throw new Error("No WebRTC support: Not a supported browser");
                    if (t._pcReady = !1, t._channelReady = !1, t._iceComplete = !1, t._channel = null, t._pendingCandidates = [], t._previousStreams = [], t._chunk = null, t._cb = null, t._interval = null, t._reconnectTimeout = null, t._pc = new t._wrtc.RTCPeerConnection(t.config, t.constraints), t._isWrtc = Array.isArray(t._pc.RTCIceConnectionStates), t._isReactNativeWebrtc = "number" == typeof t._pc._peerConnectionId, t._pc.oniceconnectionstatechange = function() {
                            t._onIceStateChange()
                        }, t._pc.onicegatheringstatechange = function() {
                            t._onIceStateChange()
                        }, t._pc.onsignalingstatechange = function() {
                            t._onSignalingStateChange()
                        }, t._pc.onicecandidate = function(e) {
                            t._onIceCandidate(e)
                        }, t.initiator) {
                        var n = !1;
                        t._pc.onnegotiationneeded = function() {
                            n || t._createOffer(), n = !0
                        }, t._setupData({
                            channel: t._pc.createDataChannel(t.channelName, t.channelConfig)
                        })
                    } else t._pc.ondatachannel = function(e) {
                        t._setupData(e)
                    };
                    "addTrack" in t._pc ? (t.stream && t.stream.getTracks().forEach(function(e) {
                        t._pc.addTrack(e, t.stream)
                    }), t._pc.ontrack = function(e) {
                        t._onTrack(e)
                    }) : (t.stream && t._pc.addStream(t.stream), t._pc.onaddstream = function(e) {
                        t._onAddStream(e)
                    }), t.initiator && t._isWrtc && t._pc.onnegotiationneeded(), t._onFinishBound = function() {
                        t._onFinish()
                    }, t.once("finish", t._onFinishBound)
                }

                function o() {}
                t.exports = r;
                var i = e("debug")("simple-peer"),
                    s = e("get-browser-rtc"),
                    d = e("inherits"),
                    a = e("randombytes"),
                    c = e("readable-stream"),
                    p = 65536;
                d(r, c.Duplex), r.WEBRTC_SUPPORT = !!s(), r.config = {
                    iceServers: [{
                        urls: "stun:stun.l.google.com:19302"
                    }, {
                        urls: "stun:global.stun.twilio.com:3478?transport=udp"
                    }]
                }, r.constraints = {}, r.channelConfig = {}, Object.defineProperty(r.prototype, "bufferSize", {
                    get: function() {
                        var e = this;
                        return e._channel && e._channel.bufferedAmount || 0
                    }
                }), r.prototype.address = function() {
                    var e = this;
                    return {
                        port: e.localPort,
                        family: "IPv4",
                        address: e.localAddress
                    }
                }, r.prototype.signal = function(e) {
                    var t = this;
                    if (t.destroyed) throw new Error("cannot signal after peer is destroyed");
                    if ("string" == typeof e) try {
                        e = JSON.parse(e)
                    } catch (t) {
                        e = {}
                    }
                    t._debug("signal()"), e.candidate && (t._pc.remoteDescription ? t._addIceCandidate(e.candidate) : t._pendingCandidates.push(e.candidate)), e.sdp && t._pc.setRemoteDescription(new t._wrtc.RTCSessionDescription(e), function() {
                        t.destroyed || (t._pendingCandidates.forEach(function(e) {
                            t._addIceCandidate(e)
                        }), t._pendingCandidates = [], "offer" === t._pc.remoteDescription.type && t._createAnswer())
                    }, function(e) {
                        t._destroy(e)
                    }), e.sdp || e.candidate || t._destroy(new Error("signal() called with invalid signal data"))
                }, r.prototype._addIceCandidate = function(e) {
                    var t = this;
                    try {
                        t._pc.addIceCandidate(new t._wrtc.RTCIceCandidate(e), o, function(e) {
                            t._destroy(e)
                        })
                    } catch (e) {
                        t._destroy(new Error("error adding candidate: " + e.message))
                    }
                }, r.prototype.send = function(e) {
                    var t = this;
                    t._isWrtc && n.isBuffer(e) && (e = new Uint8Array(e)), t._channel.send(e)
                }, r.prototype.destroy = function(e) {
                    var t = this;
                    t._destroy(null, e)
                }, r.prototype._destroy = function(e, t) {
                    var n = this;
                    if (!n.destroyed) {
                        if (t && n.once("close", t), n._debug("destroy (error: %s)", e && (e.message || e)), n.readable = n.writable = !1, n._readableState.ended || n.push(null), n._writableState.finished || n.end(), n.destroyed = !0, n.connected = !1, n._pcReady = !1, n._channelReady = !1, n._previousStreams = null, n._earlyMessage = null, clearInterval(n._interval), clearTimeout(n._reconnectTimeout), n._interval = null, n._reconnectTimeout = null, n._chunk = null, n._cb = null, n._onFinishBound && n.removeListener("finish", n._onFinishBound), n._onFinishBound = null, n._pc) {
                            try {
                                n._pc.close()
                            } catch (e) {}
                            n._pc.oniceconnectionstatechange = null, n._pc.onicegatheringstatechange = null, n._pc.onsignalingstatechange = null, n._pc.onicecandidate = null, "addTrack" in n._pc ? n._pc.ontrack = null : n._pc.onaddstream = null, n._pc.onnegotiationneeded = null, n._pc.ondatachannel = null
                        }
                        if (n._channel) {
                            try {
                                n._channel.close()
                            } catch (e) {}
                            n._channel.onmessage = null, n._channel.onopen = null, n._channel.onclose = null, n._channel.onerror = null
                        }
                        n._pc = null, n._channel = null, e && n.emit("error", e), n.emit("close")
                    }
                }, r.prototype._setupData = function(e) {
                    var t = this;
                    return e.channel ? void(t._channel = e.channel, t._channel.binaryType = "arraybuffer", "number" == typeof t._channel.bufferedAmountLowThreshold && (t._channel.bufferedAmountLowThreshold = p), t.channelName = t._channel.label, t._channel.onmessage = function(e) {
                        t._channelReady ? t._onChannelMessage(e) : (t._earlyMessage = e, t._onChannelOpen())
                    }, t._channel.onbufferedamountlow = function() {
                        t._onChannelBufferedAmountLow()
                    }, t._channel.onopen = function() {
                        t._channelReady || t._onChannelOpen()
                    }, t._channel.onclose = function() {
                        t._onChannelClose()
                    }, t._channel.onerror = function(e) {
                        t._destroy(e)
                    }) : t._destroy(new Error("Data channel event is missing `channel` property"))
                }, r.prototype._read = function() {}, r.prototype._write = function(e, t, n) {
                    var r = this;
                    if (r.destroyed) return n(new Error("cannot write after peer is destroyed"));
                    if (r.connected) {
                        try {
                            r.send(e)
                        } catch (e) {
                            return r._destroy(e)
                        }
                        r._channel.bufferedAmount > p ? (r._debug("start backpressure: bufferedAmount %d", r._channel.bufferedAmount), r._cb = n) : n(null)
                    } else r._debug("write before connect"), r._chunk = e, r._cb = n
                }, r.prototype._onFinish = function() {
                    function e() {
                        setTimeout(function() {
                            t._destroy()
                        }, 1e3)
                    }
                    var t = this;
                    t.destroyed || (t.connected ? e() : t.once("connect", e))
                }, r.prototype._createOffer = function() {
                    var e = this;
                    e.destroyed || e._pc.createOffer(function(t) {
                        function n() {
                            var n = e._pc.localDescription || t;
                            e._debug("signal"), e.emit("signal", {
                                type: n.type,
                                sdp: n.sdp
                            })
                        }
                        e.destroyed || (t.sdp = e.sdpTransform(t.sdp), e._pc.setLocalDescription(t, function() {
                            e.destroyed || (e.trickle || e._iceComplete ? n() : e.once("_iceComplete", n))
                        }, function(t) {
                            e._destroy(t)
                        }))
                    }, function(t) {
                        e._destroy(t)
                    }, e.offerConstraints)
                }, r.prototype._createAnswer = function() {
                    var e = this;
                    e.destroyed || e._pc.createAnswer(function(t) {
                        function n() {
                            var n = e._pc.localDescription || t;
                            e._debug("signal"), e.emit("signal", {
                                type: n.type,
                                sdp: n.sdp
                            })
                        }
                        e.destroyed || (t.sdp = e.sdpTransform(t.sdp), e._pc.setLocalDescription(t, function() {
                            e.destroyed || (e.trickle || e._iceComplete ? n() : e.once("_iceComplete", n))
                        }, function(t) {
                            e._destroy(t)
                        }))
                    }, function(t) {
                        e._destroy(t)
                    }, e.answerConstraints)
                }, r.prototype._onIceStateChange = function() {
                    var e = this;
                    if (!e.destroyed) {
                        var t = e._pc.iceConnectionState,
                            n = e._pc.iceGatheringState;
                        e._debug("iceStateChange (connection: %s) (gathering: %s)", t, n), e.emit("iceStateChange", t, n), ("connected" === t || "completed" === t) && (clearTimeout(e._reconnectTimeout), e._pcReady = !0, e._maybeReady()), "disconnected" === t && (e.reconnectTimer ? (clearTimeout(e._reconnectTimeout), e._reconnectTimeout = setTimeout(function() {
                            e._destroy()
                        }, e.reconnectTimer)) : e._destroy()), "failed" === t && e._destroy(new Error("Ice connection failed.")), "closed" === t && e._destroy()
                    }
                }, r.prototype.getStats = function(e) {
                    var t = this;
                    0 === t._pc.getStats.length ? t._pc.getStats().then(function(t) {
                        var n = [];
                        t.forEach(function(e) {
                            n.push(e)
                        }), e(null, n)
                    }, function(t) {
                        e(t)
                    }) : t._isReactNativeWebrtc ? t._pc.getStats(null, function(t) {
                        var n = [];
                        t.forEach(function(e) {
                            n.push(e)
                        }), e(null, n)
                    }, function(t) {
                        e(t)
                    }) : 0 < t._pc.getStats.length ? t._pc.getStats(function(t) {
                        var n = [];
                        t.result().forEach(function(e) {
                            var t = {};
                            e.names().forEach(function(n) {
                                t[n] = e.stat(n)
                            }), t.id = e.id, t.type = e.type, t.timestamp = e.timestamp, n.push(t)
                        }), e(null, n)
                    }, function(t) {
                        e(t)
                    }) : e(null, [])
                }, r.prototype._maybeReady = function() {
                    var e = this;
                    e._debug("maybeReady pc %s channel %s", e._pcReady, e._channelReady);
                    e.connected || e._connecting || !e._pcReady || !e._channelReady || (e._connecting = !0, e.getStats(function(t, n) {
                        function r(t) {
                            var n = i[t.localCandidateId];
                            n && n.ip ? (e.localAddress = n.ip, e.localPort = +n.port) : n && n.ipAddress ? (e.localAddress = n.ipAddress, e.localPort = +n.portNumber) : "string" == typeof t.googLocalAddress && (n = t.googLocalAddress.split(":"), e.localAddress = n[0], e.localPort = +n[1]);
                            var r = o[t.remoteCandidateId];
                            r && r.ip ? (e.remoteAddress = r.ip, e.remotePort = +r.port) : r && r.ipAddress ? (e.remoteAddress = r.ipAddress, e.remotePort = +r.portNumber) : "string" == typeof t.googRemoteAddress && (r = t.googRemoteAddress.split(":"), e.remoteAddress = r[0], e.remotePort = +r[1]), e.remoteFamily = "IPv4", e._debug("connect local: %s:%s remote: %s:%s", e.localAddress, e.localPort, e.remoteAddress, e.remotePort)
                        }
                        if (!e.destroyed) {
                            t && (n = []), e._connecting = !1, e.connected = !0;
                            var o = {},
                                i = {},
                                s = {};
                            if (n.forEach(function(e) {
                                    ("remotecandidate" === e.type || "remote-candidate" === e.type) && (o[e.id] = e), ("localcandidate" === e.type || "local-candidate" === e.type) && (i[e.id] = e), ("candidatepair" === e.type || "candidate-pair" === e.type) && (s[e.id] = e)
                                }), n.forEach(function(e) {
                                    "transport" === e.type && r(s[e.selectedCandidatePairId]), ("googCandidatePair" === e.type && "true" === e.googActiveConnection || ("candidatepair" === e.type || "candidate-pair" === e.type) && e.selected) && r(e)
                                }), e._chunk) {
                                try {
                                    e.send(e._chunk)
                                } catch (t) {
                                    return e._destroy(t)
                                }
                                e._chunk = null, e._debug("sent chunk from \"write before connect\"");
                                var d = e._cb;
                                e._cb = null, d(null)
                            }
                            "number" != typeof e._channel.bufferedAmountLowThreshold && (e._interval = setInterval(function() {
                                e._onInterval()
                            }, 150), e._interval.unref && e._interval.unref()), e._debug("connect"), e.emit("connect"), e._earlyMessage && (e._onChannelMessage(e._earlyMessage), e._earlyMessage = null)
                        }
                    }))
                }, r.prototype._onInterval = function() {
                    this._cb && this._channel && !(this._channel.bufferedAmount > p) && this._onChannelBufferedAmountLow()
                }, r.prototype._onSignalingStateChange = function() {
                    var e = this;
                    e.destroyed || (e._debug("signalingStateChange %s", e._pc.signalingState), e.emit("signalingStateChange", e._pc.signalingState))
                }, r.prototype._onIceCandidate = function(e) {
                    var t = this;
                    t.destroyed || (e.candidate && t.trickle ? t.emit("signal", {
                        candidate: {
                            candidate: e.candidate.candidate,
                            sdpMLineIndex: e.candidate.sdpMLineIndex,
                            sdpMid: e.candidate.sdpMid
                        }
                    }) : !e.candidate && (t._iceComplete = !0, t.emit("_iceComplete")))
                }, r.prototype._onChannelMessage = function(e) {
                    var t = this;
                    if (!t.destroyed) {
                        var r = e.data;
                        r instanceof ArrayBuffer && (r = n.from(r)), t.push(r)
                    }
                }, r.prototype._onChannelBufferedAmountLow = function() {
                    var e = this;
                    if (!e.destroyed && e._cb) {
                        e._debug("ending backpressure: bufferedAmount %d", e._channel.bufferedAmount);
                        var t = e._cb;
                        e._cb = null, t(null)
                    }
                }, r.prototype._onChannelOpen = function() {
                    var e = this;
                    e.connected || e.destroyed || (e._debug("on channel open"), e._channelReady = !0, e._maybeReady())
                }, r.prototype._onChannelClose = function() {
                    var e = this;
                    e.destroyed || (e._debug("on channel close"), e._destroy())
                }, r.prototype._onAddStream = function(e) {
                    var t = this;
                    t.destroyed || (t._debug("on add stream"), t.emit("stream", e.stream))
                }, r.prototype._onTrack = function(e) {
                    var t = this;
                    if (!t.destroyed) {
                        t._debug("on track");
                        var n = e.streams[0].id; - 1 !== t._previousStreams.indexOf(n) || (t._previousStreams.push(n), t.emit("stream", e.streams[0]))
                    }
                }, r.prototype._debug = function() {
                    var e = this,
                        t = [].slice.call(arguments);
                    t[0] = "[" + e._id + "] " + t[0], i.apply(null, t)
                }, r.prototype._transformConstraints = function(e) {
                    var t = this;
                    if (0 === Object.keys(e).length) return e;
                    if ((e.mandatory || e.optional) && !t._isChromium) {
                        var n = Object.assign({}, e.optional, e.mandatory);
                        return void 0 !== n.OfferToReceiveVideo && (n.offerToReceiveVideo = n.OfferToReceiveVideo, delete n.OfferToReceiveVideo), void 0 !== n.OfferToReceiveAudio && (n.offerToReceiveAudio = n.OfferToReceiveAudio, delete n.OfferToReceiveAudio), n
                    }
                    return e.mandatory || e.optional || !t._isChromium ? e : (void 0 !== e.offerToReceiveVideo && (e.OfferToReceiveVideo = e.offerToReceiveVideo, delete e.offerToReceiveVideo), void 0 !== e.offerToReceiveAudio && (e.OfferToReceiveAudio = e.offerToReceiveAudio, delete e.offerToReceiveAudio), {
                        mandatory: e
                    })
                }
            }).call(this, e("buffer").Buffer)
        }, {
            buffer: 23,
            debug: 29,
            "get-browser-rtc": 36,
            inherits: 40,
            randombytes: 72,
            "readable-stream": 82
        }],
        92: [function(e, t) {
            function n(e) {
                return s.digest(e)
            }

            function r(e) {
                for (var t = e.length, n = new Uint8Array(t), r = 0; r < t; r++) n[r] = e.charCodeAt(r);
                return n
            }

            function o(e) {
                for (var t = e.length, n = [], r = 0, o; r < t; r++) o = e[r], n.push((o >>> 4).toString(16)), n.push((15 & o).toString(16));
                return n.join("")
            }
            var i = e("rusha"),
                s = new i,
                d = "undefined" == typeof window ? self : window,
                a = d.crypto || d.msCrypto || {},
                c = a.subtle || a.webkitSubtle;
            try {
                c.digest({
                    name: "sha-1"
                }, new Uint8Array).catch(function() {
                    c = !1
                })
            } catch (e) {
                c = !1
            }
            t.exports = function(e, t) {
                return c ? void("string" == typeof e && (e = r(e)), c.digest({
                    name: "sha-1"
                }, e).then(function(e) {
                    t(o(new Uint8Array(e)))
                }, function() {
                    t(n(e))
                })) : void setTimeout(t, 0, n(e))
            }, t.exports.sync = n
        }, {
            rusha: 87
        }],
        93: [function(e, t) {
            (function(n) {
                function r(e) {
                    var t = this;
                    if (!(t instanceof r)) return new r(e);
                    if (e || (e = {}), "string" == typeof e && (e = {
                            url: e
                        }), null == e.url && null == e.socket) throw new Error("Missing required `url` or `socket` option");
                    if (null != e.url && null != e.socket) throw new Error("Must specify either `url` or `socket` option, not both");
                    if (t._id = d(4).toString("hex").slice(0, 7), t._debug("new websocket: %o", e), e = Object.assign({
                            allowHalfOpen: !1
                        }, e), a.Duplex.call(t, e), t.connected = !1, t.destroyed = !1, t._chunk = null, t._cb = null, t._interval = null, e.socket) t.url = e.socket.url, t._ws = e.socket;
                    else {
                        t.url = e.url;
                        try {
                            t._ws = "function" == typeof c ? new p(e.url, e) : new p(e.url)
                        } catch (e) {
                            return void n.nextTick(function() {
                                t._destroy(e)
                            })
                        }
                    }
                    t._ws.binaryType = "arraybuffer", t._ws.onopen = function() {
                        t._onOpen()
                    }, t._ws.onmessage = function(e) {
                        t._onMessage(e)
                    }, t._ws.onclose = function() {
                        t._onClose()
                    }, t._ws.onerror = function() {
                        t._destroy(new Error("connection error to " + t.url))
                    }, t._onFinishBound = function() {
                        t._onFinish()
                    }, t.once("finish", t._onFinishBound)
                }
                t.exports = r;
                var o = e("safe-buffer").Buffer,
                    i = e("debug")("simple-websocket"),
                    s = e("inherits"),
                    d = e("randombytes"),
                    a = e("readable-stream"),
                    c = e("ws"),
                    p = "function" == typeof c ? c : WebSocket,
                    l = 65536;
                s(r, a.Duplex), r.WEBSOCKET_SUPPORT = !!p, r.prototype.send = function(e) {
                    this._ws.send(e)
                }, r.prototype.destroy = function(e) {
                    this._destroy(null, e)
                }, r.prototype._destroy = function(e, t) {
                    var n = this;
                    if (!n.destroyed) {
                        if (t && n.once("close", t), n._debug("destroy (error: %s)", e && (e.message || e)), n.readable = n.writable = !1, n._readableState.ended || n.push(null), n._writableState.finished || n.end(), n.connected = !1, n.destroyed = !0, clearInterval(n._interval), n._interval = null, n._chunk = null, n._cb = null, n._onFinishBound && n.removeListener("finish", n._onFinishBound), n._onFinishBound = null, n._ws) {
                            var r = n._ws,
                                o = function() {
                                    r.onclose = null
                                };
                            if (r.readyState === p.CLOSED) o();
                            else try {
                                r.onclose = o, r.close()
                            } catch (e) {
                                o()
                            }
                            r.onopen = null, r.onmessage = null, r.onerror = null
                        }
                        n._ws = null, e && n.emit("error", e), n.emit("close")
                    }
                }, r.prototype._read = function() {}, r.prototype._write = function(e, t, n) {
                    if (this.destroyed) return n(new Error("cannot write after socket is destroyed"));
                    if (this.connected) {
                        try {
                            this.send(e)
                        } catch (e) {
                            return this._destroy(e)
                        }
                        "function" != typeof c && this._ws.bufferedAmount > l ? (this._debug("start backpressure: bufferedAmount %d", this._ws.bufferedAmount), this._cb = n) : n(null)
                    } else this._debug("write before connect"), this._chunk = e, this._cb = n
                }, r.prototype._onFinish = function() {
                    function e() {
                        setTimeout(function() {
                            t._destroy()
                        }, 1e3)
                    }
                    var t = this;
                    t.destroyed || (t.connected ? e() : t.once("connect", e))
                }, r.prototype._onMessage = function(e) {
                    if (!this.destroyed) {
                        var t = e.data;
                        t instanceof ArrayBuffer && (t = o.from(t)), this.push(t)
                    }
                }, r.prototype._onOpen = function() {
                    var e = this;
                    if (!(e.connected || e.destroyed)) {
                        if (e.connected = !0, e._chunk) {
                            try {
                                e.send(e._chunk)
                            } catch (t) {
                                return e._destroy(t)
                            }
                            e._chunk = null, e._debug("sent chunk from \"write before connect\"");
                            var t = e._cb;
                            e._cb = null, t(null)
                        }
                        "function" != typeof c && (e._interval = setInterval(function() {
                            e._onInterval()
                        }, 150), e._interval.unref && e._interval.unref()), e._debug("connect"), e.emit("connect")
                    }
                }, r.prototype._onInterval = function() {
                    if (this._cb && this._ws && !(this._ws.bufferedAmount > l)) {
                        this._debug("ending backpressure: bufferedAmount %d", this._ws.bufferedAmount);
                        var e = this._cb;
                        this._cb = null, e(null)
                    }
                }, r.prototype._onClose = function() {
                    this.destroyed || (this._debug("on close"), this._destroy())
                }, r.prototype._debug = function() {
                    var e = [].slice.call(arguments);
                    e[0] = "[" + this._id + "] " + e[0], i.apply(null, e)
                }
            }).call(this, e("_process"))
        }, {
            _process: 65,
            debug: 29,
            inherits: 40,
            randombytes: 72,
            "readable-stream": 82,
            "safe-buffer": 88,
            ws: 21
        }],
        94: [function(e, t) {
            var n = 1,
                r = 65535,
                o = 4,
                i = setInterval(function() {
                    n = n + 1 & r
                }, 0 | 1e3 / o);
            i.unref && i.unref(), t.exports = function(e) {
                var t = o * (e || 5),
                    i = [0],
                    s = 1,
                    d = n - 1 & r;
                return function(e) {
                    var a = n - d & r;
                    for (a > t && (a = t), d = n; a--;) s == t && (s = 0), i[s] = i[0 == s ? t - 1 : s - 1], s++;
                    e && (i[s - 1] += e);
                    var c = i[s - 1],
                        p = i.length < t ? 0 : i[s == t ? 0 : s];
                    return i.length < o ? c : (c - p) * o / i.length
                }
            }
        }, {}],
        95: [function(e, t, n) {
            (function(t) {
                var r = e("./lib/request"),
                    o = e("xtend"),
                    i = e("builtin-status-codes"),
                    s = e("url"),
                    d = n;
                d.request = function(e, n) {
                    e = "string" == typeof e ? s.parse(e) : o(e);
                    var i = -1 === t.location.protocol.search(/^https?:$/) ? "http:" : "",
                        d = e.protocol || i,
                        a = e.hostname || e.host,
                        c = e.port,
                        p = e.path || "/";
                    a && -1 !== a.indexOf(":") && (a = "[" + a + "]"), e.url = (a ? d + "//" + a : "") + (c ? ":" + c : "") + p, e.method = (e.method || "GET").toUpperCase(), e.headers = e.headers || {};
                    var l = new r(e);
                    return n && l.on("response", n), l
                }, d.get = function(e, t) {
                    var n = d.request(e, t);
                    return n.end(), n
                }, d.Agent = function() {}, d.Agent.defaultMaxSockets = 4, d.STATUS_CODES = i, d.METHODS = ["CHECKOUT", "CONNECT", "COPY", "DELETE", "GET", "HEAD", "LOCK", "M-SEARCH", "MERGE", "MKACTIVITY", "MKCOL", "MOVE", "NOTIFY", "OPTIONS", "PATCH", "POST", "PROPFIND", "PROPPATCH", "PURGE", "PUT", "REPORT", "SEARCH", "SUBSCRIBE", "TRACE", "UNLOCK", "UNSUBSCRIBE"]
            }).call(this, "undefined" == typeof global ? "undefined" == typeof self ? "undefined" == typeof window ? {} : window : self : global)
        }, {
            "./lib/request": 97,
            "builtin-status-codes": 24,
            url: 112,
            xtend: 119
        }],
        96: [function(e, t, n) {
            (function(e) {
                function t() {
                    if (d != void 0) return d;
                    if (e.XMLHttpRequest) {
                        d = new e.XMLHttpRequest;
                        try {
                            d.open("GET", e.XDomainRequest ? "/" : "https://example.com")
                        } catch (t) {
                            d = null
                        }
                    } else d = null;
                    return d
                }

                function r(e) {
                    var n = t();
                    if (!n) return !1;
                    try {
                        return n.responseType = e, n.responseType === e
                    } catch (t) {}
                    return !1
                }

                function o(e) {
                    return "function" == typeof e
                }
                n.fetch = o(e.fetch) && o(e.ReadableStream), n.blobConstructor = !1;
                try {
                    new Blob([new ArrayBuffer(1)]), n.blobConstructor = !0
                } catch (t) {}
                var i = "undefined" != typeof e.ArrayBuffer,
                    s = i && o(e.ArrayBuffer.prototype.slice),
                    d;
                n.arraybuffer = n.fetch || i && r("arraybuffer"), n.msstream = !n.fetch && s && r("ms-stream"), n.mozchunkedarraybuffer = !n.fetch && i && r("moz-chunked-arraybuffer"), n.overrideMimeType = n.fetch || !!t() && o(t().overrideMimeType), n.vbArray = o(e.VBArray), d = null
            }).call(this, "undefined" == typeof global ? "undefined" == typeof self ? "undefined" == typeof window ? {} : window : self : global)
        }, {}],
        97: [function(e, t) {
            (function(n, r, o) {
                function i(e, t) {
                    return d.fetch && t ? "fetch" : d.mozchunkedarraybuffer ? "moz-chunked-arraybuffer" : d.msstream ? "ms-stream" : d.arraybuffer && e ? "arraybuffer" : d.vbArray && e ? "text:vbarray" : "text"
                }

                function s(e) {
                    try {
                        var t = e.status;
                        return null !== t && 0 !== t
                    } catch (t) {
                        return !1
                    }
                }
                var d = e("./capability"),
                    a = e("inherits"),
                    c = e("./response"),
                    p = e("readable-stream"),
                    l = e("to-arraybuffer"),
                    u = c.IncomingMessage,
                    f = c.readyStates,
                    h = t.exports = function(e) {
                        var t = this;
                        p.Writable.call(t), t._opts = e, t._body = [], t._headers = {}, e.auth && t.setHeader("Authorization", "Basic " + new o(e.auth).toString("base64")), Object.keys(e.headers).forEach(function(n) {
                            t.setHeader(n, e.headers[n])
                        });
                        var n = !0,
                            r;
                        if ("disable-fetch" === e.mode || "timeout" in e) n = !1, r = !0;
                        else if ("prefer-streaming" === e.mode) r = !1;
                        else if ("allow-wrong-content-type" === e.mode) r = !d.overrideMimeType;
                        else if (!e.mode || "default" === e.mode || "prefer-fast" === e.mode) r = !0;
                        else throw new Error("Invalid value for opts.mode");
                        t._mode = i(r, n), t.on("finish", function() {
                            t._onFinish()
                        })
                    };
                a(h, p.Writable), h.prototype.setHeader = function(e, t) {
                    var n = this,
                        r = e.toLowerCase(); - 1 !== m.indexOf(r) || (n._headers[r] = {
                        name: e,
                        value: t
                    })
                }, h.prototype.getHeader = function(e) {
                    var t = this._headers[e.toLowerCase()];
                    return t ? t.value : null
                }, h.prototype.removeHeader = function(e) {
                    var t = this;
                    delete t._headers[e.toLowerCase()]
                }, h.prototype._onFinish = function() {
                    var e = this;
                    if (!e._destroyed) {
                        var t = e._opts,
                            i = e._headers,
                            s = null;
                        "GET" !== t.method && "HEAD" !== t.method && (d.blobConstructor ? s = new r.Blob(e._body.map(function(e) {
                            return l(e)
                        }), {
                            type: (i["content-type"] || {}).value || ""
                        }) : s = o.concat(e._body).toString());
                        var a = [];
                        if (Object.keys(i).forEach(function(e) {
                                var t = i[e].name,
                                    n = i[e].value;
                                Array.isArray(n) ? n.forEach(function(e) {
                                    a.push([t, e])
                                }) : a.push([t, n])
                            }), "fetch" === e._mode) r.fetch(e._opts.url, {
                            method: e._opts.method,
                            headers: a,
                            body: s || void 0,
                            mode: "cors",
                            credentials: t.withCredentials ? "include" : "same-origin"
                        }).then(function(t) {
                            e._fetchResponse = t, e._connect()
                        }, function(t) {
                            e.emit("error", t)
                        });
                        else {
                            var c = e._xhr = new r.XMLHttpRequest;
                            try {
                                c.open(e._opts.method, e._opts.url, !0)
                            } catch (t) {
                                return void n.nextTick(function() {
                                    e.emit("error", t)
                                })
                            }
                            "responseType" in c && (c.responseType = e._mode.split(":")[0]), "withCredentials" in c && (c.withCredentials = !!t.withCredentials), "text" === e._mode && "overrideMimeType" in c && c.overrideMimeType("text/plain; charset=x-user-defined"), "timeout" in t && (c.timeout = t.timeout, c.ontimeout = function() {
                                e.emit("timeout")
                            }), a.forEach(function(e) {
                                c.setRequestHeader(e[0], e[1])
                            }), e._response = null, c.onreadystatechange = function() {
                                switch (c.readyState) {
                                    case f.LOADING:
                                    case f.DONE:
                                        e._onXHRProgress();
                                }
                            }, "moz-chunked-arraybuffer" === e._mode && (c.onprogress = function() {
                                e._onXHRProgress()
                            }), c.onerror = function() {
                                e._destroyed || e.emit("error", new Error("XHR error"))
                            };
                            try {
                                c.send(s)
                            } catch (t) {
                                return void n.nextTick(function() {
                                    e.emit("error", t)
                                })
                            }
                        }
                    }
                }, h.prototype._onXHRProgress = function() {
                    var e = this;
                    !s(e._xhr) || e._destroyed || (!e._response && e._connect(), e._response._onXHRProgress())
                }, h.prototype._connect = function() {
                    var e = this;
                    e._destroyed || (e._response = new u(e._xhr, e._fetchResponse, e._mode), e._response.on("error", function(t) {
                        e.emit("error", t)
                    }), e.emit("response", e._response))
                }, h.prototype._write = function(e, t, n) {
                    var r = this;
                    r._body.push(e), n()
                }, h.prototype.abort = h.prototype.destroy = function() {
                    var e = this;
                    e._destroyed = !0, e._response && (e._response._destroyed = !0), e._xhr && e._xhr.abort()
                }, h.prototype.end = function(e, t, n) {
                    var r = this;
                    "function" == typeof e && (n = e, e = void 0), p.Writable.prototype.end.call(r, e, t, n)
                }, h.prototype.flushHeaders = function() {}, h.prototype.setTimeout = function() {}, h.prototype.setNoDelay = function() {}, h.prototype.setSocketKeepAlive = function() {};
                var m = ["accept-charset", "accept-encoding", "access-control-request-headers", "access-control-request-method", "connection", "content-length", "cookie", "cookie2", "date", "dnt", "expect", "host", "keep-alive", "origin", "referer", "te", "trailer", "transfer-encoding", "upgrade", "user-agent", "via"]
            }).call(this, e("_process"), "undefined" == typeof global ? "undefined" == typeof self ? "undefined" == typeof window ? {} : window : self : global, e("buffer").Buffer)
        }, {
            "./capability": 96,
            "./response": 98,
            _process: 65,
            buffer: 23,
            inherits: 40,
            "readable-stream": 82,
            "to-arraybuffer": 105
        }],
        98: [function(e, t, n) {
            (function(t, r, o) {
                var i = e("./capability"),
                    s = e("inherits"),
                    d = e("readable-stream"),
                    a = n.readyStates = {
                        UNSENT: 0,
                        OPENED: 1,
                        HEADERS_RECEIVED: 2,
                        LOADING: 3,
                        DONE: 4
                    },
                    c = n.IncomingMessage = function(e, n, r) {
                        var s = this;
                        if (d.Readable.call(s), s._mode = r, s.headers = {}, s.rawHeaders = [], s.trailers = {}, s.rawTrailers = [], s.on("end", function() {
                                t.nextTick(function() {
                                    s.emit("close")
                                })
                            }), "fetch" === r) {
                            function e() {
                                a.read().then(function(t) {
                                    return s._destroyed ? void 0 : t.done ? void s.push(null) : void(s.push(new o(t.value)), e())
                                }).catch(function(e) {
                                    s.emit("error", e)
                                })
                            }
                            s._fetchResponse = n, s.url = n.url, s.statusCode = n.status, s.statusMessage = n.statusText, n.headers.forEach(function(e, t) {
                                s.headers[t.toLowerCase()] = e, s.rawHeaders.push(t, e)
                            });
                            var a = n.body.getReader();
                            e()
                        } else {
                            s._xhr = e, s._pos = 0, s.url = e.responseURL, s.statusCode = e.status, s.statusMessage = e.statusText;
                            var c = e.getAllResponseHeaders().split(/\r?\n/);
                            if (c.forEach(function(e) {
                                    var t = e.match(/^([^:]+):\s*(.*)/);
                                    if (t) {
                                        var n = t[1].toLowerCase();
                                        "set-cookie" === n ? (void 0 === s.headers[n] && (s.headers[n] = []), s.headers[n].push(t[2])) : void 0 === s.headers[n] ? s.headers[n] = t[2] : s.headers[n] += ", " + t[2], s.rawHeaders.push(t[1], t[2])
                                    }
                                }), s._charset = "x-user-defined", !i.overrideMimeType) {
                                var p = s.rawHeaders["mime-type"];
                                if (p) {
                                    var l = p.match(/;\s*charset=([^;])(;|$)/);
                                    l && (s._charset = l[1].toLowerCase())
                                }
                                s._charset || (s._charset = "utf-8")
                            }
                        }
                    };
                s(c, d.Readable), c.prototype._read = function() {}, c.prototype._onXHRProgress = function() {
                    var e = this,
                        t = e._xhr,
                        n = null;
                    switch (e._mode) {
                        case "text:vbarray":
                            if (t.readyState !== a.DONE) break;
                            try {
                                n = new r.VBArray(t.responseBody).toArray()
                            } catch (t) {}
                            if (null !== n) {
                                e.push(new o(n));
                                break
                            }
                        case "text":
                            try {
                                n = t.responseText
                            } catch (t) {
                                e._mode = "text:vbarray";
                                break
                            }
                            if (n.length > e._pos) {
                                var s = n.substr(e._pos);
                                if ("x-user-defined" === e._charset) {
                                    for (var d = new o(s.length), c = 0; c < s.length; c++) d[c] = 255 & s.charCodeAt(c);
                                    e.push(d)
                                } else e.push(s, e._charset);
                                e._pos = n.length
                            }
                            break;
                        case "arraybuffer":
                            if (t.readyState !== a.DONE || !t.response) break;
                            n = t.response, e.push(new o(new Uint8Array(n)));
                            break;
                        case "moz-chunked-arraybuffer":
                            if (n = t.response, t.readyState !== a.LOADING || !n) break;
                            e.push(new o(new Uint8Array(n)));
                            break;
                        case "ms-stream":
                            if (n = t.response, t.readyState !== a.LOADING) break;
                            var i = new r.MSStreamReader;
                            i.onprogress = function() {
                                i.result.byteLength > e._pos && (e.push(new o(new Uint8Array(i.result.slice(e._pos)))), e._pos = i.result.byteLength)
                            }, i.onload = function() {
                                e.push(null)
                            }, i.readAsArrayBuffer(n);
                    }
                    e._xhr.readyState === a.DONE && "ms-stream" !== e._mode && e.push(null)
                }
            }).call(this, e("_process"), "undefined" == typeof global ? "undefined" == typeof self ? "undefined" == typeof window ? {} : window : self : global, e("buffer").Buffer)
        }, {
            "./capability": 96,
            _process: 65,
            buffer: 23,
            inherits: 40,
            "readable-stream": 82
        }],
        99: [function(e, t) {
            var n = e("stream-to-blob");
            t.exports = function e(t, r, o) {
                return "function" == typeof r ? e(t, null, r) : void n(t, r, function(e, t) {
                    if (e) return o(e);
                    var n = URL.createObjectURL(t);
                    o(null, n)
                })
            }
        }, {
            "stream-to-blob": 100
        }],
        100: [function(e, t) {
            var n = e("once");
            t.exports = function e(t, r, o) {
                if ("function" == typeof r) return e(t, null, r);
                o = n(o);
                var i = [];
                t.on("data", function(e) {
                    i.push(e)
                }).on("end", function() {
                    var e = r ? new Blob(i, {
                        type: r
                    }) : new Blob(i);
                    o(null, e)
                }).on("error", o)
            }
        }, {
            once: 59
        }],
        101: [function(e, t) {
            (function(n) {
                var r = e("once");
                t.exports = function(e, t, o) {
                    o = r(o);
                    var i = new n(t),
                        s = 0;
                    e.on("data", function(e) {
                        e.copy(i, s), s += e.length
                    }).on("end", function() {
                        o(null, i)
                    }).on("error", o)
                }
            }).call(this, e("buffer").Buffer)
        }, {
            buffer: 23,
            once: 59
        }],
        102: [function(e, t, n) {
            "use strict";

            function r(e) {
                if (!e) return "utf8";
                for (var t;;) switch (e) {
                    case "utf8":
                    case "utf-8":
                        return "utf8";
                    case "ucs2":
                    case "ucs-2":
                    case "utf16le":
                    case "utf-16le":
                        return "utf16le";
                    case "latin1":
                    case "binary":
                        return "latin1";
                    case "base64":
                    case "ascii":
                    case "hex":
                        return e;
                    default:
                        if (t) return;
                        e = ("" + e).toLowerCase(), t = !0;
                }
            }

            function o(e) {
                var t = r(e);
                if ("string" != typeof t && (g.isEncoding === _ || !_(e))) throw new Error("Unknown encoding: " + e);
                return t || e
            }

            function i(e) {
                this.encoding = o(e);
                var t;
                switch (this.encoding) {
                    case "utf16le":
                        this.text = p, this.end = l, t = 4;
                        break;
                    case "utf8":
                        this.fillLast = c, t = 4;
                        break;
                    case "base64":
                        this.text = u, this.end = f, t = 3;
                        break;
                    default:
                        return this.write = h, void(this.end = m);
                }
                this.lastNeed = 0, this.lastTotal = 0, this.lastChar = g.allocUnsafe(t)
            }

            function s(e) {
                if (127 >= e) return 0;
                return 6 == e >> 5 ? 2 : 14 == e >> 4 ? 3 : 30 == e >> 3 ? 4 : -1
            }

            function d(e, t, n) {
                var r = t.length - 1;
                if (r < n) return 0;
                var o = s(t[r]);
                return 0 <= o ? (0 < o && (e.lastNeed = o - 1), o) : --r < n ? 0 : (o = s(t[r]), 0 <= o) ? (0 < o && (e.lastNeed = o - 2), o) : --r < n ? 0 : (o = s(t[r]), 0 <= o ? (0 < o && (2 === o ? o = 0 : e.lastNeed = o - 3), o) : 0)
            }

            function a(e, t, n) {
                if (128 != (192 & t[0])) return e.lastNeed = 0, "\uFFFD".repeat(n);
                if (1 < e.lastNeed && 1 < t.length) {
                    if (128 != (192 & t[1])) return e.lastNeed = 1, "\uFFFD".repeat(n + 1);
                    if (2 < e.lastNeed && 2 < t.length && 128 != (192 & t[2])) return e.lastNeed = 2, "\uFFFD".repeat(n + 2)
                }
            }

            function c(e) {
                var t = this.lastTotal - this.lastNeed,
                    n = a(this, e, t);
                return void 0 === n ? this.lastNeed <= e.length ? (e.copy(this.lastChar, t, 0, this.lastNeed), this.lastChar.toString(this.encoding, 0, this.lastTotal)) : void(e.copy(this.lastChar, t, 0, e.length), this.lastNeed -= e.length) : n
            }

            function p(e, t) {
                if (0 == (e.length - t) % 2) {
                    var n = e.toString("utf16le", t);
                    if (n) {
                        var r = n.charCodeAt(n.length - 1);
                        if (55296 <= r && 56319 >= r) return this.lastNeed = 2, this.lastTotal = 4, this.lastChar[0] = e[e.length - 2], this.lastChar[1] = e[e.length - 1], n.slice(0, -1)
                    }
                    return n
                }
                return this.lastNeed = 1, this.lastTotal = 2, this.lastChar[0] = e[e.length - 1], e.toString("utf16le", t, e.length - 1)
            }

            function l(e) {
                var t = e && e.length ? this.write(e) : "";
                if (this.lastNeed) {
                    var n = this.lastTotal - this.lastNeed;
                    return t + this.lastChar.toString("utf16le", 0, n)
                }
                return t
            }

            function u(e, t) {
                var r = (e.length - t) % 3;
                return 0 == r ? e.toString("base64", t) : (this.lastNeed = 3 - r, this.lastTotal = 3, 1 == r ? this.lastChar[0] = e[e.length - 1] : (this.lastChar[0] = e[e.length - 2], this.lastChar[1] = e[e.length - 1]), e.toString("base64", t, e.length - r))
            }

            function f(e) {
                var t = e && e.length ? this.write(e) : "";
                return this.lastNeed ? t + this.lastChar.toString("base64", 0, 3 - this.lastNeed) : t
            }

            function h(e) {
                return e.toString(this.encoding)
            }

            function m(e) {
                return e && e.length ? this.write(e) : ""
            }
            var g = e("safe-buffer").Buffer,
                _ = g.isEncoding || function(e) {
                    switch (e = "" + e, e && e.toLowerCase()) {
                        case "hex":
                        case "utf8":
                        case "utf-8":
                        case "ascii":
                        case "binary":
                        case "base64":
                        case "ucs2":
                        case "ucs-2":
                        case "utf16le":
                        case "utf-16le":
                        case "raw":
                            return !0;
                        default:
                            return !1;
                    }
                };
            n.StringDecoder = i, i.prototype.write = function(e) {
                if (0 === e.length) return "";
                var t, n;
                if (this.lastNeed) {
                    if (t = this.fillLast(e), void 0 === t) return "";
                    n = this.lastNeed, this.lastNeed = 0
                } else n = 0;
                return n < e.length ? t ? t + this.text(e, n) : this.text(e, n) : t || ""
            }, i.prototype.end = function(e) {
                var t = e && e.length ? this.write(e) : "";
                return this.lastNeed ? t + "\uFFFD".repeat(this.lastTotal - this.lastNeed) : t
            }, i.prototype.text = function(e, t) {
                var n = d(this, e, t);
                if (!this.lastNeed) return e.toString("utf8", t);
                this.lastTotal = n;
                var r = e.length - (n - this.lastNeed);
                return e.copy(this.lastChar, 0, r), e.toString("utf8", t, r)
            }, i.prototype.fillLast = function(e) {
                return this.lastNeed <= e.length ? (e.copy(this.lastChar, this.lastTotal - this.lastNeed, 0, this.lastNeed), this.lastChar.toString(this.encoding, 0, this.lastTotal)) : void(e.copy(this.lastChar, this.lastTotal - this.lastNeed, 0, e.length), this.lastNeed -= e.length)
            }
        }, {
            "safe-buffer": 88
        }],
        103: [function(e, t, n) {
            var r = e("./thirty-two");
            n.encode = r.encode, n.decode = r.decode
        }, {
            "./thirty-two": 104
        }],
        104: [function(e, t, n) {
            (function(e) {
                "use strict";

                function t(e) {
                    var t = r(e.length / 5);
                    return 0 == e.length % 5 ? t : t + 1
                }
                var s = [255, 255, 26, 27, 28, 29, 30, 31, 255, 255, 255, 255, 255, 255, 255, 255, 255, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 255, 255, 255, 255, 255, 255, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 255, 255, 255, 255, 255];
                n.encode = function(n) {
                    e.isBuffer(n) || (n = new e(n));
                    for (var r = 0, o = 0, i = 0, s = 0, d = new e(8 * t(n)); r < n.length;) {
                        var a = n[r];
                        3 < i ? (s = a & 255 >> i, i = (i + 5) % 8, s = s << i | (r + 1 < n.length ? n[r + 1] : 0) >> 8 - i, r++) : (s = 31 & a >> 8 - (i + 5), i = (i + 5) % 8, 0 == i && r++), d[o] = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567".charCodeAt(s), o++
                    }
                    for (r = o; r < d.length; r++) d[r] = 61;
                    return d
                }, n.decode = function(t) {
                    var n = 0,
                        r = 0,
                        d = 0,
                        a;
                    e.isBuffer(t) || (t = new e(t));
                    for (var c = new e(o(5 * t.length / 8)), p = 0; p < t.length && !(61 === t[p]); p++) {
                        var i = t[p] - 48;
                        if (i < s.length) r = s[i], 3 >= n ? (n = (n + 5) % 8, 0 == n ? (a |= r, c[d] = a, d++, a = 0) : a |= 255 & r << 8 - n) : (n = (n + 5) % 8, a |= 255 & r >>> n, c[d] = a, d++, a = 255 & r << 8 - n);
                        else throw new Error("Invalid input - it is not base32 encoded string")
                    }
                    return c.slice(0, d)
                }
            }).call(this, e("buffer").Buffer)
        }, {
            buffer: 23
        }],
        105: [function(e, t) {
            var n = e("buffer").Buffer;
            t.exports = function(e) {
                if (e instanceof Uint8Array) {
                    if (0 === e.byteOffset && e.byteLength === e.buffer.byteLength) return e.buffer;
                    if ("function" == typeof e.buffer.slice) return e.buffer.slice(e.byteOffset, e.byteOffset + e.byteLength)
                }
                if (n.isBuffer(e)) {
                    for (var t = new Uint8Array(e.length), r = e.length, o = 0; o < r; o++) t[o] = e[o];
                    return t.buffer
                }
                throw new Error("Argument must be a Buffer")
            }
        }, {
            buffer: 23
        }],
        106: [function(e, t) {
            (function(n) {
                function o(e) {
                    function t(e, t) {
                        var n = new s(t);
                        return n.on("warning", r._onWarning), n.on("error", r._onError), n.listen(e), r._internalDHT = !0, n
                    }
                    var r = this;
                    if (!(r instanceof o)) return new o(e);
                    if (d.call(r), !e.peerId) throw new Error("Option `peerId` is required");
                    if (!e.infoHash) throw new Error("Option `infoHash` is required");
                    if (!n.browser && !e.port) throw new Error("Option `port` is required");
                    r.peerId = "string" == typeof e.peerId ? e.peerId : e.peerId.toString("hex"), r.infoHash = "string" == typeof e.infoHash ? e.infoHash : e.infoHash.toString("hex"), r._port = e.port, r._userAgent = e.userAgent, r.destroyed = !1, r._announce = e.announce || [], r._intervalMs = e.intervalMs || 900000, r._trackerOpts = null, r._dhtAnnouncing = !1, r._dhtTimeout = !1, r._internalDHT = !1, r._onWarning = function(e) {
                        r.emit("warning", e)
                    }, r._onError = function(e) {
                        r.emit("error", e)
                    }, r._onDHTPeer = function(e, t) {
                        t.toString("hex") !== r.infoHash || r.emit("peer", e.host + ":" + e.port, "dht")
                    }, r._onTrackerPeer = function(e) {
                        r.emit("peer", e, "tracker")
                    }, r._onTrackerAnnounce = function() {
                        r.emit("trackerAnnounce")
                    }, !1 === e.tracker ? r.tracker = null : e.tracker && "object" == typeof e.tracker ? (r._trackerOpts = a(e.tracker), r.tracker = r._createTracker()) : r.tracker = r._createTracker(), r.dht = !1 === e.dht || "function" != typeof s ? null : e.dht && "function" == typeof e.dht.addNode ? e.dht : e.dht && "object" == typeof e.dht ? t(e.dhtPort, e.dht) : t(e.dhtPort), r.dht && (r.dht.on("peer", r._onDHTPeer), r._dhtAnnounce())
                }
                t.exports = o;
                var i = e("debug")("torrent-discovery"),
                    s = e("bittorrent-dht/client"),
                    d = e("events").EventEmitter,
                    a = e("xtend"),
                    c = e("inherits"),
                    p = e("run-parallel"),
                    l = e("bittorrent-tracker/client");
                c(o, d), o.prototype.updatePort = function(e) {
                    var t = this;
                    e === t._port || (t._port = e, t.dht && t._dhtAnnounce(), t.tracker && (t.tracker.stop(), t.tracker.destroy(function() {
                        t.tracker = t._createTracker()
                    })))
                }, o.prototype.complete = function(e) {
                    this.tracker && this.tracker.complete(e)
                }, o.prototype.destroy = function(e) {
                    var t = this;
                    if (!t.destroyed) {
                        t.destroyed = !0, clearTimeout(t._dhtTimeout);
                        var n = [];
                        t.tracker && (t.tracker.stop(), t.tracker.removeListener("warning", t._onWarning), t.tracker.removeListener("error", t._onError), t.tracker.removeListener("peer", t._onTrackerPeer), t.tracker.removeListener("update", t._onTrackerAnnounce), n.push(function(e) {
                            t.tracker.destroy(e)
                        })), t.dht && t.dht.removeListener("peer", t._onDHTPeer), t._internalDHT && (t.dht.removeListener("warning", t._onWarning), t.dht.removeListener("error", t._onError), n.push(function(e) {
                            t.dht.destroy(e)
                        })), p(n, e), t.dht = null, t.tracker = null, t._announce = null
                    }
                }, o.prototype._createTracker = function() {
                    var e = a(this._trackerOpts, {
                            infoHash: this.infoHash,
                            announce: this._announce,
                            peerId: this.peerId,
                            port: this._port,
                            userAgent: this._userAgent
                        }),
                        t = new l(e);
                    return t.on("warning", this._onWarning), t.on("error", this._onError), t.on("peer", this._onTrackerPeer), t.on("update", this._onTrackerAnnounce), t.setInterval(this._intervalMs), t.start(), t
                }, o.prototype._dhtAnnounce = function() {
                    function e() {
                        return t._intervalMs + r(Math.random() * t._intervalMs / 5)
                    }
                    var t = this;
                    t._dhtAnnouncing || (i("dht announce"), t._dhtAnnouncing = !0, clearTimeout(t._dhtTimeout), t.dht.announce(t.infoHash, t._port, function(n) {
                        t._dhtAnnouncing = !1, i("dht announce complete"), n && t.emit("warning", n), t.emit("dhtAnnounce"), t.destroyed || (t._dhtTimeout = setTimeout(function() {
                            t._dhtAnnounce()
                        }, e()), t._dhtTimeout.unref && t._dhtTimeout.unref())
                    }))
                }
            }).call(this, e("_process"))
        }, {
            _process: 65,
            "bittorrent-dht/client": 21,
            "bittorrent-tracker/client": 15,
            debug: 29,
            events: 33,
            inherits: 40,
            "run-parallel": 86,
            xtend: 119
        }],
        107: [function(e, t) {
            (function(e) {
                function n(e) {
                    return this instanceof n ? void(this.length = e, this.missing = e, this.sources = null, this._chunks = o(e / r), this._remainder = e % r || r, this._buffered = 0, this._buffer = null, this._cancellations = null, this._reservations = 0, this._flushed = !1) : new n(e)
                }
                t.exports = n;
                var r = 16384;
                n.BLOCK_LENGTH = r, n.prototype.chunkLength = function(e) {
                    return e === this._chunks - 1 ? this._remainder : r
                }, n.prototype.chunkLengthRemaining = function(e) {
                    return this.length - e * r
                }, n.prototype.chunkOffset = function(e) {
                    return e * r
                }, n.prototype.reserve = function() {
                    return this.init() ? this._cancellations.length ? this._cancellations.pop() : this._reservations < this._chunks ? this._reservations++ : -1 : -1
                }, n.prototype.reserveRemaining = function() {
                    if (!this.init()) return -1;
                    if (this._reservations < this._chunks) {
                        var e = this._reservations;
                        return this._reservations = this._chunks, e
                    }
                    return -1
                }, n.prototype.cancel = function(e) {
                    this.init() && this._cancellations.push(e)
                }, n.prototype.cancelRemaining = function(e) {
                    this.init() && (this._reservations = e)
                }, n.prototype.get = function(e) {
                    return this.init() ? this._buffer[e] : null
                }, n.prototype.set = function(e, t, n) {
                    if (!this.init()) return !1;
                    for (var i = t.length, s = o(i / r), d = 0; d < s; d++)
                        if (!this._buffer[e + d]) {
                            var a = d * r,
                                c = t.slice(a, a + r);
                            this._buffered++, this._buffer[e + d] = c, this.missing -= c.length, -1 === this.sources.indexOf(n) && this.sources.push(n)
                        }
                    return this._buffered === this._chunks
                }, n.prototype.flush = function() {
                    if (!this._buffer || this._chunks !== this._buffered) return null;
                    var t = e.concat(this._buffer, this.length);
                    return this._buffer = null, this._cancellations = null, this.sources = null, this._flushed = !0, t
                }, n.prototype.init = function() {
                    return !this._flushed && (!!this._buffer || (this._buffer = Array(this._chunks), this._cancellations = [], this.sources = [], !0))
                }
            }).call(this, e("buffer").Buffer)
        }, {
            buffer: 23
        }],
        108: [function(e, t) {
            (function(n) {
                var r = e("is-typedarray").strict;
                t.exports = function(e) {
                    if (r(e)) {
                        var t = new n(e.buffer);
                        return e.byteLength !== e.buffer.byteLength && (t = t.slice(e.byteOffset, e.byteOffset + e.byteLength)), t
                    }
                    return new n(e)
                }
            }).call(this, e("buffer").Buffer)
        }, {
            buffer: 23,
            "is-typedarray": 44
        }],
        109: [function(e, t, n) {
            (function(e) {
                var t = 4294967295;
                n.encodingLength = function() {
                    return 8
                }, n.encode = function(n, o, i) {
                    o || (o = new e(8)), i || (i = 0);
                    var s = r(n / t);
                    return o.writeUInt32BE(s, i), o.writeUInt32BE(n - s * t, i + 4), o
                }, n.decode = function(n, r) {
                    r || (r = 0), n || (n = new e(4)), r || (r = 0);
                    var o = n.readUInt32BE(r),
                        i = n.readUInt32BE(r + 4);
                    return o * t + i
                }, n.encode.bytes = 8, n.decode.bytes = 8
            }).call(this, e("buffer").Buffer)
        }, {
            buffer: 23
        }],
        110: [function(e, t) {
            "use strict";

            function n(e, t) {
                for (var n = 1, r = e.length, o = e[0], s = e[0], d = 1; d < r; ++d)
                    if (s = o, o = e[d], t(o, s)) {
                        if (d === n) {
                            n++;
                            continue
                        }
                        e[n++] = o
                    }
                return e.length = n, e
            }

            function r(e) {
                for (var t = 1, n = e.length, r = e[0], o = e[0], s = 1; s < n; ++s, o = r)
                    if (o = r, r = e[s], r !== o) {
                        if (s === t) {
                            t++;
                            continue
                        }
                        e[t++] = r
                    }
                return e.length = t, e
            }
            t.exports = function(e, t, o) {
                return 0 === e.length ? e : t ? (o || e.sort(t), n(e, t)) : (o || e.sort(), r(e))
            }
        }, {}],
        111: [function(e, t) {
            t.exports = function(e, t) {
                if (!(t >= e.length || 0 > t)) {
                    var n = e.pop();
                    if (t < e.length) {
                        var r = e[t];
                        return e[t] = n, r
                    }
                    return n
                }
            }
        }, {}],
        112: [function(e, t, n) {
            "use strict";

            function r() {
                this.protocol = null, this.slashes = null, this.auth = null, this.host = null, this.port = null, this.hostname = null, this.hash = null, this.search = null, this.query = null, this.pathname = null, this.path = null, this.href = null
            }

            function o(e, t, n) {
                if (e && d.isObject(e) && e instanceof r) return e;
                var o = new r;
                return o.parse(e, t, n), o
            }
            var s = e("punycode"),
                d = e("./util");
            n.parse = o, n.resolve = function(e, t) {
                return o(e, !1, !0).resolve(t)
            }, n.resolveObject = function(e, t) {
                return e ? o(e, !1, !0).resolveObject(t) : t
            }, n.format = function(e) {
                return d.isString(e) && (e = o(e)), e instanceof r ? e.format() : r.prototype.format.call(e)
            }, n.Url = r;
            var a = /^([a-z0-9.+-]+:)/i,
                i = /:[0-9]*$/,
                c = /^(\/\/?(?!\/)[^\?\s]*)(\?[^\s]*)?$/,
                p = ["{", "}", "|", "\\", "^", "`"].concat(["<", ">", "\"", "`", " ", "\r", "\n", "\t"]),
                u = ["'"].concat(p),
                l = ["%", "/", "?", ";", "#"].concat(u),
                f = ["/", "?", "#"],
                h = /^[+a-z0-9A-Z_-]{0,63}$/,
                m = /^([+a-z0-9A-Z_-]{0,63})(.*)$/,
                g = {
                    javascript: !0,
                    "javascript:": !0
                },
                _ = {
                    javascript: !0,
                    "javascript:": !0
                },
                y = {
                    http: !0,
                    https: !0,
                    ftp: !0,
                    gopher: !0,
                    file: !0,
                    "http:": !0,
                    "https:": !0,
                    "ftp:": !0,
                    "gopher:": !0,
                    "file:": !0
                },
                b = e("querystring");
            r.prototype.parse = function(e, t, n) {
                if (!d.isString(e)) throw new TypeError("Parameter 'url' must be a string, not " + typeof e);
                var r = e.indexOf("?"),
                    o = -1 !== r && r < e.indexOf("#") ? "?" : "#",
                    w = e.split(o),
                    x = /\\/g;
                w[0] = w[0].replace(x, "/"), e = w.join(o);
                var v = e;
                if (v = v.trim(), !n && 1 === e.split("#").length) {
                    var S = c.exec(v);
                    if (S) return this.path = v, this.href = v, this.pathname = S[1], S[2] ? (this.search = S[2], this.query = t ? b.parse(this.search.substr(1)) : this.search.substr(1)) : t && (this.search = "", this.query = {}), this
                }
                var E = a.exec(v);
                if (E) {
                    E = E[0];
                    var B = E.toLowerCase();
                    this.protocol = B, v = v.substr(E.length)
                }
                if (n || E || v.match(/^\/\/[^@\/]+@[^@\/]+/)) {
                    var I = "//" === v.substr(0, 2);
                    I && !(E && _[E]) && (v = v.substr(2), this.slashes = !0)
                }
                if (!_[E] && (I || E && !y[E])) {
                    for (var C = -1, L = 0, i; L < f.length; L++) i = v.indexOf(f[L]), -1 !== i && (-1 == C || i < C) && (C = i);
                    var T, A;
                    A = -1 === C ? v.lastIndexOf("@") : v.lastIndexOf("@", C), -1 !== A && (T = v.slice(0, A), v = v.slice(A + 1), this.auth = decodeURIComponent(T)), C = -1;
                    for (var L = 0, i; L < l.length; L++) i = v.indexOf(l[L]), -1 !== i && (-1 === C || i < C) && (C = i); - 1 === C && (C = v.length), this.host = v.slice(0, C), v = v.slice(C), this.parseHost(), this.hostname = this.hostname || "";
                    var U = "[" === this.hostname[0] && "]" === this.hostname[this.hostname.length - 1];
                    if (!U)
                        for (var R = this.hostname.split(/\./), L = 0, P = R.length, O; L < P; L++)
                            if (O = R[L], O && !O.match(h)) {
                                for (var H = "", M = 0, q = O.length; M < q; M++) H += 127 < O.charCodeAt(M) ? "x" : O[M];
                                if (!H.match(h)) {
                                    var k = R.slice(0, L),
                                        j = R.slice(L + 1),
                                        N = O.match(m);
                                    N && (k.push(N[1]), j.unshift(N[2])), j.length && (v = "/" + j.join(".") + v), this.hostname = k.join(".");
                                    break
                                }
                            }
                    this.hostname = this.hostname.length > 255 ? "" : this.hostname.toLowerCase(), U || (this.hostname = s.toASCII(this.hostname));
                    var D = this.port ? ":" + this.port : "",
                        p = this.hostname || "";
                    this.host = p + D, this.href += this.host, U && (this.hostname = this.hostname.substr(1, this.hostname.length - 2), "/" !== v[0] && (v = "/" + v))
                }
                if (!g[B])
                    for (var L = 0, P = u.length, W; L < P; L++)
                        if (W = u[L], -1 !== v.indexOf(W)) {
                            var z = encodeURIComponent(W);
                            z === W && (z = escape(W)), v = v.split(W).join(z)
                        }
                var F = v.indexOf("#"); - 1 !== F && (this.hash = v.substr(F), v = v.slice(0, F));
                var V = v.indexOf("?");
                if (-1 === V ? t && (this.search = "", this.query = {}) : (this.search = v.substr(V), this.query = v.substr(V + 1), t && (this.query = b.parse(this.query)), v = v.slice(0, V)), v && (this.pathname = v), y[B] && this.hostname && !this.pathname && (this.pathname = "/"), this.pathname || this.search) {
                    var D = this.pathname || "",
                        G = this.search || "";
                    this.path = D + G
                }
                return this.href = this.format(), this
            }, r.prototype.format = function() {
                var e = this.auth || "";
                e && (e = encodeURIComponent(e), e = e.replace(/%3A/i, ":"), e += "@");
                var t = this.protocol || "",
                    n = this.pathname || "",
                    r = this.hash || "",
                    o = !1,
                    i = "";
                this.host ? o = e + this.host : this.hostname && (o = e + (-1 === this.hostname.indexOf(":") ? this.hostname : "[" + this.hostname + "]"), this.port && (o += ":" + this.port)), this.query && d.isObject(this.query) && Object.keys(this.query).length && (i = b.stringify(this.query));
                var s = this.search || i && "?" + i || "";
                return t && ":" !== t.substr(-1) && (t += ":"), this.slashes || (!t || y[t]) && !1 !== o ? (o = "//" + (o || ""), n && "/" !== n.charAt(0) && (n = "/" + n)) : !o && (o = ""), r && "#" !== r.charAt(0) && (r = "#" + r), s && "?" !== s.charAt(0) && (s = "?" + s), n = n.replace(/[?#]/g, function(e) {
                    return encodeURIComponent(e)
                }), s = s.replace("#", "%23"), t + o + n + s + r
            }, r.prototype.resolve = function(e) {
                return this.resolveObject(o(e, !1, !0)).format()
            }, r.prototype.resolveObject = function(e) {
                if (d.isString(e)) {
                    var t = new r;
                    t.parse(e, !1, !0), e = t
                }
                for (var n = new r, o = Object.keys(this), a = 0, c; a < o.length; a++) c = o[a], n[c] = this[c];
                if (n.hash = e.hash, "" === e.href) return n.href = n.format(), n;
                if (e.slashes && !e.protocol) {
                    for (var l = Object.keys(e), u = 0, f; u < l.length; u++) f = l[u], "protocol" !== f && (n[f] = e[f]);
                    return y[n.protocol] && n.hostname && !n.pathname && (n.path = n.pathname = "/"), n.href = n.format(), n
                }
                if (e.protocol && e.protocol !== n.protocol) {
                    if (!y[e.protocol]) {
                        for (var h = Object.keys(e), m = 0, g; m < h.length; m++) g = h[m], n[g] = e[g];
                        return n.href = n.format(), n
                    }
                    if (n.protocol = e.protocol, !e.host && !_[e.protocol]) {
                        for (var b = (e.pathname || "").split("/"); b.length && !(e.host = b.shift()););
                        e.host || (e.host = ""), e.hostname || (e.hostname = ""), "" !== b[0] && b.unshift(""), 2 > b.length && b.unshift(""), n.pathname = b.join("/")
                    } else n.pathname = e.pathname;
                    if (n.search = e.search, n.query = e.query, n.host = e.host || "", n.auth = e.auth, n.hostname = e.hostname || e.host, n.port = e.port, n.pathname || n.search) {
                        var w = n.pathname || "",
                            p = n.search || "";
                        n.path = w + p
                    }
                    return n.slashes = n.slashes || e.slashes, n.href = n.format(), n
                }
                var s = n.pathname && "/" === n.pathname.charAt(0),
                    k = e.host || e.pathname && "/" === e.pathname.charAt(0),
                    x = k || s || n.host && e.pathname,
                    v = x,
                    S = n.pathname && n.pathname.split("/") || [],
                    b = e.pathname && e.pathname.split("/") || [],
                    E = n.protocol && !y[n.protocol];
                if (E && (n.hostname = "", n.port = null, n.host && ("" === S[0] ? S[0] = n.host : S.unshift(n.host)), n.host = "", e.protocol && (e.hostname = null, e.port = null, e.host && ("" === b[0] ? b[0] = e.host : b.unshift(e.host)), e.host = null), x = x && ("" === b[0] || "" === S[0])), k) n.host = e.host || "" === e.host ? e.host : n.host, n.hostname = e.hostname || "" === e.hostname ? e.hostname : n.hostname, n.search = e.search, n.query = e.query, S = b;
                else if (b.length) S || (S = []), S.pop(), S = S.concat(b), n.search = e.search, n.query = e.query;
                else if (!d.isNullOrUndefined(e.search)) {
                    if (E) {
                        n.hostname = n.host = S.shift();
                        var B = n.host && 0 < n.host.indexOf("@") && n.host.split("@");
                        B && (n.auth = B.shift(), n.host = n.hostname = B.shift())
                    }
                    return n.search = e.search, n.query = e.query, d.isNull(n.pathname) && d.isNull(n.search) || (n.path = (n.pathname ? n.pathname : "") + (n.search ? n.search : "")), n.href = n.format(), n
                }
                if (!S.length) return n.pathname = null, n.path = n.search ? "/" + n.search : null, n.href = n.format(), n;
                for (var I = S.slice(-1)[0], C = (n.host || e.host || 1 < S.length) && ("." === I || ".." === I) || "" === I, L = 0, T = S.length; 0 <= T; T--) I = S[T], "." === I ? S.splice(T, 1) : ".." === I ? (S.splice(T, 1), L++) : L && (S.splice(T, 1), L--);
                if (!x && !v)
                    for (; L--; L) S.unshift("..");
                x && "" !== S[0] && (!S[0] || "/" !== S[0].charAt(0)) && S.unshift(""), C && "/" !== S.join("/").substr(-1) && S.push("");
                var i = "" === S[0] || S[0] && "/" === S[0].charAt(0);
                if (E) {
                    n.hostname = n.host = i ? "" : S.length ? S.shift() : "";
                    var B = n.host && 0 < n.host.indexOf("@") && n.host.split("@");
                    B && (n.auth = B.shift(), n.host = n.hostname = B.shift())
                }
                return x = x || n.host && S.length, x && !i && S.unshift(""), S.length ? n.pathname = S.join("/") : (n.pathname = null, n.path = null), d.isNull(n.pathname) && d.isNull(n.search) || (n.path = (n.pathname ? n.pathname : "") + (n.search ? n.search : "")), n.auth = e.auth || n.auth, n.slashes = n.slashes || e.slashes, n.href = n.format(), n
            }, r.prototype.parseHost = function() {
                var e = this.host,
                    t = i.exec(e);
                t && (t = t[0], ":" !== t && (this.port = t.substr(1)), e = e.substr(0, e.length - t.length)), e && (this.hostname = e)
            }
        }, {
            "./util": 113,
            punycode: 67,
            querystring: 70
        }],
        113: [function(e, t) {
            "use strict";
            t.exports = {
                isString: function(e) {
                    return "string" == typeof e
                },
                isObject: function(e) {
                    return "object" == typeof e && null !== e
                },
                isNull: function(e) {
                    return null === e
                },
                isNullOrUndefined: function(e) {
                    return null == e
                }
            }
        }, {}],
        114: [function(e, t) {
            var n = e("bencode"),
                r = e("bitfield"),
                i = e("safe-buffer").Buffer,
                s = e("debug")("ut_metadata"),
                d = e("events").EventEmitter,
                a = e("inherits"),
                c = e("simple-sha1"),
                p = 1e3,
                l = 16384;
            t.exports = function(e) {
                function t(t) {
                    d.call(this), this._wire = t, this._metadataComplete = !1, this._metadataSize = null, this._remainingRejects = null, this._fetching = !1, this._bitfield = new r(0, {
                        grow: p
                    }), i.isBuffer(e) && this.setMetadata(e)
                }
                return a(t, d), t.prototype.name = "ut_metadata", t.prototype.onHandshake = function(e) {
                    this._infoHash = e
                }, t.prototype.onExtendedHandshake = function(e) {
                    return e.m && e.m.ut_metadata ? e.metadata_size ? "number" != typeof e.metadata_size || 1e7 < e.metadata_size || 0 >= e.metadata_size ? this.emit("warning", new Error("Peer gave invalid metadata size")) : void(this._metadataSize = e.metadata_size, this._numPieces = o(this._metadataSize / l), this._remainingRejects = 2 * this._numPieces, this._fetching && this._requestPieces()) : this.emit("warning", new Error("Peer does not have metadata")) : this.emit("warning", new Error("Peer does not support ut_metadata"))
                }, t.prototype.onMessage = function(e) {
                    var t, r;
                    try {
                        var o = e.toString(),
                            i = o.indexOf("ee") + 2;
                        t = n.decode(o.substring(0, i)), r = e.slice(i)
                    } catch (e) {
                        return
                    }
                    switch (t.msg_type) {
                        case 0:
                            this._onRequest(t.piece);
                            break;
                        case 1:
                            this._onData(t.piece, r, t.total_size);
                            break;
                        case 2:
                            this._onReject(t.piece);
                    }
                }, t.prototype.fetch = function() {
                    this._metadataComplete || (this._fetching = !0, this._metadataSize && this._requestPieces())
                }, t.prototype.cancel = function() {
                    this._fetching = !1
                }, t.prototype.setMetadata = function(e) {
                    if (this._metadataComplete) return !0;
                    s("set metadata");
                    try {
                        var t = n.decode(e).info;
                        t && (e = n.encode(t))
                    } catch (e) {}
                    return this._infoHash && this._infoHash !== c.sync(e) ? !1 : (this.cancel(), this.metadata = e, this._metadataComplete = !0, this._metadataSize = this.metadata.length, this._wire.extendedHandshake.metadata_size = this._metadataSize, this.emit("metadata", n.encode({
                        info: n.decode(this.metadata)
                    })), !0)
                }, t.prototype._send = function(e, t) {
                    var r = n.encode(e);
                    i.isBuffer(t) && (r = i.concat([r, t])), this._wire.extended("ut_metadata", r)
                }, t.prototype._request = function(e) {
                    this._send({
                        msg_type: 0,
                        piece: e
                    })
                }, t.prototype._data = function(e, t, n) {
                    var r = {
                        msg_type: 1,
                        piece: e
                    };
                    "number" == typeof n && (r.total_size = n), this._send(r, t)
                }, t.prototype._reject = function(e) {
                    this._send({
                        msg_type: 2,
                        piece: e
                    })
                }, t.prototype._onRequest = function(e) {
                    if (!this._metadataComplete) return void this._reject(e);
                    var t = e * l,
                        n = t + l;
                    n > this._metadataSize && (n = this._metadataSize);
                    var r = this.metadata.slice(t, n);
                    this._data(e, r, this._metadataSize)
                }, t.prototype._onData = function(e, t) {
                    t.length > l || (t.copy(this.metadata, e * l), this._bitfield.set(e), this._checkDone())
                }, t.prototype._onReject = function(e) {
                    0 < this._remainingRejects && this._fetching ? (this._request(e), this._remainingRejects -= 1) : this.emit("warning", new Error("Peer sent \"reject\" too much"))
                }, t.prototype._requestPieces = function() {
                    this.metadata = i.alloc(this._metadataSize);
                    for (var e = 0; e < this._numPieces; e++) this._request(e)
                }, t.prototype._checkDone = function() {
                    for (var e = !0, t = 0; t < this._numPieces; t++)
                        if (!this._bitfield.get(t)) {
                            e = !1;
                            break
                        }
                    if (e) {
                        var n = this.setMetadata(this.metadata);
                        n || this._failedMetadata()
                    }
                }, t.prototype._failedMetadata = function() {
                    this._bitfield = new r(0, {
                        grow: p
                    }), this._remainingRejects -= this._numPieces, 0 < this._remainingRejects ? this._requestPieces() : this.emit("warning", new Error("Peer sent invalid metadata"))
                }, t
            }
        }, {
            bencode: 11,
            bitfield: 13,
            debug: 29,
            events: 33,
            inherits: 40,
            "safe-buffer": 88,
            "simple-sha1": 92
        }],
        115: [function(e, t) {
            (function(e) {
                function n(t) {
                    try {
                        if (!e.localStorage) return !1
                    } catch (e) {
                        return !1
                    }
                    var n = e.localStorage[t];
                    return null != n && "true" === (n + "").toLowerCase()
                }
                t.exports = function(e, t) {
                    if (n("noDeprecation")) return e;
                    var r = !1;
                    return function() {
                        if (!r) {
                            if (n("throwDeprecation")) throw new Error(t);
                            else n("traceDeprecation") ? console.trace(t) : console.warn(t);
                            r = !0
                        }
                        return e.apply(this, arguments)
                    }
                }
            }).call(this, "undefined" == typeof global ? "undefined" == typeof self ? "undefined" == typeof window ? {} : window : self : global)
        }, {}],
        116: [function(e, t) {
            (function(n) {
                function o(e) {
                    var t = this;
                    a.call(t), t._tracks = [], t._fragmentSequence = 1, t._file = e, t._decoder = null, t._findMoov(0)
                }

                function s(e, t) {
                    var n = this;
                    n._entries = e, n._countName = t || "count", n._index = 0, n._offset = 0, n.value = n._entries[0]
                }

                function d() {
                    return {
                        version: 0,
                        flags: 0,
                        entries: []
                    }
                }
                var i = e("binary-search"),
                    a = e("events").EventEmitter,
                    c = e("inherits"),
                    p = e("mp4-stream"),
                    l = e("mp4-box-encoding"),
                    u = e("range-slice-stream");
                t.exports = o, c(o, a), o.prototype._findMoov = function(e) {
                    var t = this;
                    t._decoder && t._decoder.destroy(), t._decoder = p.decode();
                    var n = t._file.createReadStream({
                        start: e
                    });
                    n.pipe(t._decoder), t._decoder.once("box", function(r) {
                        "moov" === r.type ? t._decoder.decode(function(e) {
                            n.destroy();
                            try {
                                t._processMoov(e)
                            } catch (e) {
                                e.message = "Cannot parse mp4 file: " + e.message, t.emit("error", e)
                            }
                        }) : (n.destroy(), t._findMoov(e + r.length))
                    })
                }, s.prototype.inc = function() {
                    var e = this;
                    e._offset++, e._offset >= e._entries[e._index][e._countName] && (e._index++, e._offset = 0), e.value = e._entries[e._index]
                }, o.prototype._processMoov = function(e) {
                    var t = this,
                        r = e.traks;
                    t._tracks = [], t._hasVideo = !1, t._hasAudio = !1;
                    for (var o = 0; o < r.length; o++) {
                        var i = r[o],
                            a = i.mdia.minf.stbl,
                            c = a.stsd.entries[0],
                            p = i.mdia.hdlr.handlerType,
                            u, f;
                        if ("vide" === p && "avc1" === c.type) {
                            if (t._hasVideo) continue;
                            t._hasVideo = !0, u = "avc1", c.avcC && (u += "." + c.avcC.mimeCodec), f = "video/mp4; codecs=\"" + u + "\""
                        } else if ("soun" === p && "mp4a" === c.type) {
                            if (t._hasAudio) continue;
                            t._hasAudio = !0, u = "mp4a", c.esds && c.esds.mimeCodec && (u += "." + c.esds.mimeCodec), f = "audio/mp4; codecs=\"" + u + "\""
                        } else continue;
                        var h = [],
                            m = 0,
                            g = 0,
                            _ = 0,
                            y = 0,
                            b = 0,
                            w = 0,
                            k = new s(a.stts.entries),
                            x = null;
                        a.ctts && (x = new s(a.ctts.entries));
                        for (var v = 0;;) {
                            var S = a.stsc.entries[b],
                                E = a.stsz.entries[m],
                                B = k.value.duration,
                                I = x ? x.value.compositionOffset : 0,
                                C = !0;
                            if (a.stss && (C = a.stss.entries[v] === m + 1), h.push({
                                    size: E,
                                    duration: B,
                                    dts: w,
                                    presentationOffset: I,
                                    sync: C,
                                    offset: y + a.stco.entries[_]
                                }), m++, m >= a.stsz.entries.length) break;
                            if (g++, y += E, g >= S.samplesPerChunk) {
                                g = 0, y = 0, _++;
                                var L = a.stsc.entries[b + 1];
                                L && _ + 1 >= L.firstChunk && b++
                            }
                            w += B, k.inc(), x && x.inc(), C && v++
                        }
                        i.mdia.mdhd.duration = 0, i.tkhd.duration = 0;
                        var T = S.sampleDescriptionId,
                            A = {
                                type: "moov",
                                mvhd: e.mvhd,
                                traks: [{
                                    tkhd: i.tkhd,
                                    mdia: {
                                        mdhd: i.mdia.mdhd,
                                        hdlr: i.mdia.hdlr,
                                        elng: i.mdia.elng,
                                        minf: {
                                            vmhd: i.mdia.minf.vmhd,
                                            smhd: i.mdia.minf.smhd,
                                            dinf: i.mdia.minf.dinf,
                                            stbl: {
                                                stsd: a.stsd,
                                                stts: d(),
                                                ctts: d(),
                                                stsc: d(),
                                                stsz: d(),
                                                stco: d(),
                                                stss: d()
                                            }
                                        }
                                    }
                                }],
                                mvex: {
                                    mehd: {
                                        fragmentDuration: e.mvhd.duration
                                    },
                                    trexs: [{
                                        trackId: i.tkhd.trackId,
                                        defaultSampleDescriptionIndex: T,
                                        defaultSampleDuration: 0,
                                        defaultSampleSize: 0,
                                        defaultSampleFlags: 0
                                    }]
                                }
                            };
                        t._tracks.push({
                            trackId: i.tkhd.trackId,
                            timeScale: i.mdia.mdhd.timeScale,
                            samples: h,
                            currSample: null,
                            currTime: null,
                            moov: A,
                            mime: f
                        })
                    }
                    if (0 === t._tracks.length) return void t.emit("error", new Error("no playable tracks"));
                    e.mvhd.duration = 0, t._ftyp = {
                        type: "ftyp",
                        brand: "iso5",
                        brandVersion: 0,
                        compatibleBrands: ["iso5"]
                    };
                    var U = l.encode(t._ftyp),
                        R = t._tracks.map(function(e) {
                            var t = l.encode(e.moov);
                            return {
                                mime: e.mime,
                                init: n.concat([U, t])
                            }
                        });
                    t.emit("ready", R)
                }, o.prototype.seek = function(e) {
                    var t = this;
                    if (!t._tracks) throw new Error("Not ready yet; wait for 'ready' event");
                    t._fileStream && (t._fileStream.destroy(), t._fileStream = null);
                    var n = -1;
                    if (t._tracks.map(function(r, o) {
                            function i(e) {
                                s.destroyed || s.box(e.moof, function(n) {
                                    if (n) return t.emit("error", n);
                                    if (!s.destroyed) {
                                        var d = r.inStream.slice(e.ranges);
                                        d.pipe(s.mediaData(e.length, function(e) {
                                            if (e) return t.emit("error", e);
                                            if (!s.destroyed) {
                                                var n = t._generateFragment(o);
                                                return n ? void i(n) : s.finalize()
                                            }
                                        }))
                                    }
                                })
                            }
                            r.outStream && r.outStream.destroy(), r.inStream && (r.inStream.destroy(), r.inStream = null);
                            var s = r.outStream = p.encode(),
                                d = t._generateFragment(o, e);
                            return d ? void((-1 == n || d.ranges[0].start < n) && (n = d.ranges[0].start), i(d)) : s.finalize()
                        }), 0 <= n) {
                        var r = t._fileStream = t._file.createReadStream({
                            start: n
                        });
                        t._tracks.forEach(function(e) {
                            e.inStream = new u(n, {
                                highWaterMark: 1e7
                            }), r.pipe(e.inStream)
                        })
                    }
                    return t._tracks.map(function(e) {
                        return e.outStream
                    })
                }, o.prototype._findSampleBefore = function(e, t) {
                    var n = this,
                        o = n._tracks[e],
                        s = r(o.timeScale * t),
                        d = i(o.samples, s, function(e, n) {
                            var t = e.dts + e.presentationOffset;
                            return t - n
                        });
                    for (-1 === d ? d = 0 : 0 > d && (d = -d - 2); !o.samples[d].sync;) d--;
                    return d
                };
                o.prototype._generateFragment = function(e, t) {
                    var n = this,
                        r = n._tracks[e],
                        o;
                    if (o = void 0 === t ? r.currSample : n._findSampleBefore(e, t), o >= r.samples.length) return null;
                    for (var i = r.samples[o].dts, s = 0, d = [], a = o, c; a < r.samples.length && (c = r.samples[a], !(c.sync && c.dts - i >= r.timeScale * 1)); a++) {
                        s += c.size;
                        var p = d.length - 1;
                        0 > p || d[p].end !== c.offset ? d.push({
                            start: c.offset,
                            end: c.offset + c.size
                        }) : d[p].end += c.size
                    }
                    return r.currSample = a, {
                        moof: n._generateMoof(e, o, a),
                        ranges: d,
                        length: s
                    }
                }, o.prototype._generateMoof = function(e, t, n) {
                    for (var r = this, o = r._tracks[e], i = [], s = t, d; s < n; s++) d = o.samples[s], i.push({
                        sampleDuration: d.duration,
                        sampleSize: d.size,
                        sampleFlags: d.sync ? 33554432 : 16842752,
                        sampleCompositionTimeOffset: d.presentationOffset
                    });
                    var a = {
                        type: "moof",
                        mfhd: {
                            sequenceNumber: r._fragmentSequence++
                        },
                        trafs: [{
                            tfhd: {
                                flags: 131072,
                                trackId: o.trackId
                            },
                            tfdt: {
                                baseMediaDecodeTime: o.samples[t].dts
                            },
                            trun: {
                                flags: 3841,
                                dataOffset: 8,
                                entries: i
                            }
                        }]
                    };
                    return a.trafs[0].trun.dataOffset += l.encodingLength(a), a
                }
            }).call(this, e("buffer").Buffer)
        }, {
            "binary-search": 12,
            buffer: 23,
            events: 33,
            inherits: 40,
            "mp4-box-encoding": 52,
            "mp4-stream": 55,
            "range-slice-stream": 73
        }],
        117: [function(e, t) {
            function n(e, t, o) {
                var i = this;
                return this instanceof n ? void(o = o || {}, i.detailedError = null, i._elem = t, i._elemWrapper = new r(t), i._waitingFired = !1, i._trackMeta = null, i._file = e, i._tracks = null, "none" !== i._elem.preload && i._createMuxer(), i._onError = function() {
                    i.detailedError = i._elemWrapper.detailedError, i.destroy()
                }, i._onWaiting = function() {
                    i._waitingFired = !0, i._muxer ? i._tracks && i._pump() : i._createMuxer()
                }, i._elem.addEventListener("waiting", i._onWaiting), i._elem.addEventListener("error", i._onError)) : new n(e, t, o)
            }
            var r = e("mediasource"),
                o = e("pump"),
                i = e("./mp4-remuxer");
            t.exports = n, n.prototype._createMuxer = function() {
                var e = this;
                e._muxer = new i(e._file), e._muxer.on("ready", function(t) {
                    e._tracks = t.map(function(t) {
                        var n = e._elemWrapper.createWriteStream(t.mime);
                        n.on("error", function(t) {
                            e._elemWrapper.error(t)
                        });
                        var r = {
                            muxed: null,
                            mediaSource: n,
                            initFlushed: !1,
                            onInitFlushed: null
                        };
                        return n.write(t.init, function(e) {
                            r.initFlushed = !0, r.onInitFlushed && r.onInitFlushed(e)
                        }), r
                    }), (e._waitingFired || "auto" === e._elem.preload) && e._pump()
                }), e._muxer.on("error", function(t) {
                    e._elemWrapper.error(t)
                })
            }, n.prototype._pump = function() {
                var e = this,
                    t = e._muxer.seek(e._elem.currentTime, !e._tracks);
                e._tracks.forEach(function(n, r) {
                    var i = function() {
                        n.muxed && (n.muxed.destroy(), n.mediaSource = e._elemWrapper.createWriteStream(n.mediaSource), n.mediaSource.on("error", function(t) {
                            e._elemWrapper.error(t)
                        })), n.muxed = t[r], o(n.muxed, n.mediaSource)
                    };
                    n.initFlushed ? i() : n.onInitFlushed = function(t) {
                        return t ? void e._elemWrapper.error(t) : void i()
                    }
                })
            }, n.prototype.destroy = function() {
                var e = this;
                e.destroyed || (e.destroyed = !0, e._elem.removeEventListener("waiting", e._onWaiting), e._elem.removeEventListener("error", e._onError), e._tracks && e._tracks.forEach(function(e) {
                    e.muxed.destroy()
                }), e._elem.src = "")
            }
        }, {
            "./mp4-remuxer": 116,
            mediasource: 48,
            pump: 66
        }],
        118: [function(e, t) {
            function n(e, t) {
                function r() {
                    for (var t = Array(arguments.length), n = 0; n < t.length; n++) t[n] = arguments[n];
                    var r = e.apply(this, t),
                        o = t[t.length - 1];
                    return "function" == typeof r && r !== o && Object.keys(o).forEach(function(e) {
                        r[e] = o[e]
                    }), r
                }
                if (e && t) return n(e)(t);
                if ("function" != typeof e) throw new TypeError("need wrapper function");
                return Object.keys(e).forEach(function(t) {
                    r[t] = e[t]
                }), r
            }
            t.exports = n
        }, {}],
        119: [function(e, t) {
            t.exports = function() {
                for (var e = {}, t = 0, r; t < arguments.length; t++)
                    for (var o in r = arguments[t], r) n.call(r, o) && (e[o] = r[o]);
                return e
            };
            var n = Object.prototype.hasOwnProperty
        }, {}],
        120: [function(e, t) {
            t.exports = function(e) {
                for (var t = 1, r; t < arguments.length; t++)
                    for (var o in r = arguments[t], r) n.call(r, o) && (e[o] = r[o]);
                return e
            };
            var n = Object.prototype.hasOwnProperty
        }, {}],
        121: [function(e, t) {
            t.exports = function e(t, n, r) {
                return void 0 === n ? function(n, r) {
                    return e(t, n, r)
                } : (void 0 === r && (r = "0"), t -= n.toString().length, 0 < t ? Array(t + (/\./.test(n) ? 2 : 1)).join(r) + n : n + "")
            }
        }, {}],
        122: [function(e, t) {
            t.exports = {
                version: "0.98.19"
            }
        }, {}],
        123: [function(e, t) {
            (function(n, r) {
                function o(e) {
                    function t() {
                        i.destroyed || (i.ready = !0, i.emit("ready"))
                    }
                    var i = this;
                    return i instanceof o ? void(u.call(i), !e && (e = {}), i.peerId = "string" == typeof e.peerId ? e.peerId : d.isBuffer(e.peerId) ? e.peerId.toString("hex") : d.from(I + w(9).toString("base64")).toString("hex"), i.peerIdBuffer = d.from(i.peerId, "hex"), i.nodeId = "string" == typeof e.nodeId ? e.nodeId : d.isBuffer(e.nodeId) ? e.nodeId.toString("hex") : w(20).toString("hex"), i.nodeIdBuffer = d.from(i.nodeId, "hex"), i._debugId = i.peerId.toString("hex").substring(0, 7), i.destroyed = !1, i.listening = !1, i.torrentPort = e.torrentPort || 0, i.dhtPort = e.dhtPort || 0, i.tracker = e.tracker === void 0 ? {} : e.tracker, i.torrents = [], i.maxConns = +e.maxConns || 55, i._debug("new webtorrent (peerId %s, nodeId %s, port %s)", i.peerId, i.nodeId, i.torrentPort), i.tracker && ("object" != typeof i.tracker && (i.tracker = {}), e.rtcConfig && (console.warn("WebTorrent: opts.rtcConfig is deprecated. Use opts.tracker.rtcConfig instead"), i.tracker.rtcConfig = e.rtcConfig), e.wrtc && (console.warn("WebTorrent: opts.wrtc is deprecated. Use opts.tracker.wrtc instead"), i.tracker.wrtc = e.wrtc), r.WRTC && !i.tracker.wrtc && (i.tracker.wrtc = r.WRTC)), "function" == typeof v ? i._tcpPool = new v(i) : n.nextTick(function() {
                        i._onListening()
                    }), i._downloadSpeed = k(), i._uploadSpeed = k(), !1 !== e.dht && "function" == typeof l ? (i.dht = new l(f({
                        nodeId: i.nodeId
                    }, e.dht)), i.dht.once("error", function(e) {
                        i._destroy(e)
                    }), i.dht.once("listening", function() {
                        var e = i.dht.address();
                        e && (i.dhtPort = e.port)
                    }), i.dht.setMaxListeners(0), i.dht.listen(i.dhtPort)) : i.dht = !1, i.enableWebSeeds = !1 !== e.webSeeds, "function" == typeof m && null != e.blocklist ? m(e.blocklist, {
                        headers: {
                            "user-agent": "WebTorrent/" + E + " (https://webtorrent.io)"
                        }
                    }, function(e, n) {
                        return e ? i.error("Failed to load blocklist: " + e.message) : void(i.blocked = n, t())
                    }) : n.nextTick(t)) : new o(e)
                }

                function i(e) {
                    return "object" == typeof e && null != e && "function" == typeof e.pipe
                }

                function s(e) {
                    return "undefined" != typeof FileList && e instanceof FileList
                }
                t.exports = o;
                var d = e("safe-buffer").Buffer,
                    a = e("simple-concat"),
                    c = e("create-torrent"),
                    p = e("debug")("webtorrent"),
                    l = e("bittorrent-dht/client"),
                    u = e("events").EventEmitter,
                    f = e("xtend"),
                    h = e("inherits"),
                    m = e("load-ip-set"),
                    g = e("run-parallel"),
                    _ = e("parse-torrent"),
                    y = e("path"),
                    b = e("simple-peer"),
                    w = e("randombytes"),
                    k = e("speedometer"),
                    x = e("zero-fill"),
                    v = e("./lib/tcp-pool"),
                    S = e("./lib/torrent"),
                    E = e("./package.json").version,
                    B = E.match(/([0-9]+)/g).slice(0, 2).map(function(e) {
                        return x(2, e)
                    }).join(""),
                    I = "-WW" + B + "-";
                h(o, u), o.WEBRTC_SUPPORT = b.WEBRTC_SUPPORT, Object.defineProperty(o.prototype, "downloadSpeed", {
                    get: function() {
                        return this._downloadSpeed()
                    }
                }), Object.defineProperty(o.prototype, "uploadSpeed", {
                    get: function() {
                        return this._uploadSpeed()
                    }
                }), Object.defineProperty(o.prototype, "progress", {
                    get: function() {
                        var e = this.torrents.filter(function(e) {
                                return 1 !== e.progress
                            }),
                            t = e.reduce(function(e, t) {
                                return e + t.downloaded
                            }, 0),
                            n = e.reduce(function(e, t) {
                                return e + (t.length || 0)
                            }, 0) || 1;
                        return t / n
                    }
                }), Object.defineProperty(o.prototype, "ratio", {
                    get: function() {
                        var e = this.torrents.reduce(function(e, t) {
                                return e + t.uploaded
                            }, 0),
                            t = this.torrents.reduce(function(e, t) {
                                return e + t.received
                            }, 0) || 1;
                        return e / t
                    }
                }), o.prototype.get = function(e) {
                    var t = this,
                        n = t.torrents.length,
                        r, o;
                    if (e instanceof S) {
                        for (r = 0; r < n; r++)
                            if (o = t.torrents[r], o === e) return o;
                    } else {
                        var i;
                        try {
                            i = _(e)
                        } catch (e) {}
                        if (!i) return null;
                        if (!i.infoHash) throw new Error("Invalid torrent identifier");
                        for (r = 0; r < n; r++)
                            if (o = t.torrents[r], o.infoHash === i.infoHash) return o
                    }
                    return null
                }, o.prototype.download = function(e, t, n) {
                    return console.warn("WebTorrent: client.download() is deprecated. Use client.add() instead"), this.add(e, t, n)
                }, o.prototype.add = function(e, t, n) {
                    function r() {
                        if (!s.destroyed)
                            for (var e = 0, n = s.torrents.length, r; e < n; e++)
                                if (r = s.torrents[e], r.infoHash === d.infoHash && r !== d) return void d._destroy(new Error("Cannot add duplicate torrent " + d.infoHash))
                    }

                    function o() {
                        s.destroyed || ("function" == typeof n && n(d), s.emit("torrent", d))
                    }

                    function i() {
                        d.removeListener("_infoHash", r), d.removeListener("ready", o), d.removeListener("close", i)
                    }
                    var s = this;
                    if (s.destroyed) throw new Error("client is destroyed");
                    if ("function" == typeof t) return s.add(e, null, t);
                    s._debug("add"), t = t ? f(t) : {};
                    var d = new S(e, s, t);
                    return s.torrents.push(d), d.once("_infoHash", r), d.once("ready", o), d.once("close", i), d
                }, o.prototype.seed = function(e, t, n) {
                    function r(e) {
                        o._debug("on seed"), "function" == typeof n && n(e), e.emit("seed"), o.emit("seed", e)
                    }
                    var o = this;
                    if (o.destroyed) throw new Error("client is destroyed");
                    if ("function" == typeof t) return o.seed(e, null, t);
                    o._debug("seed"), t = t ? f(t) : {}, "string" == typeof e && (t.path = y.dirname(e)), t.createdBy || (t.createdBy = "WebTorrent/" + B);
                    var d = o.add(null, t, function(e) {
                            var t = [function(t) {
                                e.load(p, t)
                            }];
                            o.dht && t.push(function(t) {
                                e.once("dhtAnnounce", t)
                            }), g(t, function(t) {
                                return o.destroyed ? void 0 : t ? e._destroy(t) : void r(e)
                            })
                        }),
                        p;
                    return s(e) && (e = Array.prototype.slice.call(e)), Array.isArray(e) || (e = [e]), g(e.map(function(e) {
                        return function(t) {
                            i(e) ? a(e, t) : t(null, e)
                        }
                    }), function(e, n) {
                        return o.destroyed ? void 0 : e ? d._destroy(e) : void c.parseInput(n, t, function(e, r) {
                            return o.destroyed ? void 0 : e ? d._destroy(e) : void(p = r.map(function(e) {
                                return e.getStream
                            }), c(n, t, function(e, t) {
                                if (!o.destroyed) {
                                    if (e) return d._destroy(e);
                                    var n = o.get(t);
                                    n ? d._destroy(new Error("Cannot add duplicate torrent " + n.infoHash)) : d._onTorrentId(t)
                                }
                            }))
                        })
                    }), d
                }, o.prototype.remove = function(e, t) {
                    this._debug("remove");
                    var n = this.get(e);
                    if (!n) throw new Error("No torrent with id " + e);
                    this._remove(e, t)
                }, o.prototype._remove = function(e, t) {
                    var n = this.get(e);
                    n && (this.torrents.splice(this.torrents.indexOf(n), 1), n.destroy(t))
                }, o.prototype.address = function() {
                    return this.listening ? this._tcpPool ? this._tcpPool.server.address() : {
                        address: "0.0.0.0",
                        family: "IPv4",
                        port: 0
                    } : null
                }, o.prototype.destroy = function(e) {
                    if (this.destroyed) throw new Error("client already destroyed");
                    this._destroy(null, e)
                }, o.prototype._destroy = function(e, t) {
                    var n = this;
                    n._debug("client destroy"), n.destroyed = !0;
                    var r = n.torrents.map(function(e) {
                        return function(t) {
                            e.destroy(t)
                        }
                    });
                    n._tcpPool && r.push(function(e) {
                        n._tcpPool.destroy(e)
                    }), n.dht && r.push(function(e) {
                        n.dht.destroy(e)
                    }), g(r, t), e && n.emit("error", e), n.torrents = [], n._tcpPool = null, n.dht = null
                }, o.prototype._onListening = function() {
                    if (this._debug("listening"), this.listening = !0, this._tcpPool) {
                        var e = this._tcpPool.server.address();
                        e && (this.torrentPort = e.port)
                    }
                    this.emit("listening")
                }, o.prototype._debug = function() {
                    var e = [].slice.call(arguments);
                    e[0] = "[" + this._debugId + "] " + e[0], p.apply(null, e)
                }
            }).call(this, e("_process"), "undefined" == typeof global ? "undefined" == typeof self ? "undefined" == typeof window ? {} : window : self : global)
        }, {
            "./lib/tcp-pool": 21,
            "./lib/torrent": 5,
            "./package.json": 122,
            _process: 65,
            "bittorrent-dht/client": 21,
            "create-torrent": 28,
            debug: 29,
            events: 33,
            inherits: 40,
            "load-ip-set": 21,
            "parse-torrent": 61,
            path: 62,
            randombytes: 72,
            "run-parallel": 86,
            "safe-buffer": 88,
            "simple-concat": 89,
            "simple-peer": 91,
            speedometer: 94,
            xtend: 119,
            "zero-fill": 121
        }]
    }, {}, [123])(123)
});
