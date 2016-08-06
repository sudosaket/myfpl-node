"use strict"
var request = require('request');
var fs = require('fs');
var elasticsearch = require('elasticsearch');
var es = new elasticsearch.Client({
    host: 'localhost:9200'
});

/**
 * Delete an existing index
 */
function deleteIndex() {
    return es.indices.delete({
        index: "game"
    });
}
exports.deleteIndex = deleteIndex;

/**
* Create the index
*/
function initIndex() {
    return es.indices.create({
        index: "game"
    });
}
exports.initIndex = initIndex;

/**
 * Put mappings in the index
 */
function initMapping() {
    es.indices.putMapping({
        index: "game",
        type: "account",
        body: {
            "properties": {
                "email": {
                    "type": "string",
                    "index": "not_analyzed"
                },
                "name": {
                    "type": "string"
                },
                "password": {
                    "type": "string",
                    "index": "not_analyzed"
                },
                "team_name": {
                    "type": "string"
                },
                "username": {
                    "type": "string"
                },
                "transfer_limit": {
                    "type": "long"
                },
                "transfer_turn": {
                    "type": "boolean"
                }
            }
        }
    }).then(function () {
        return es.indices.putMapping({
            index: "game",
            type: "team",
            body: {
                "properties": {
                    "account": {
                        "type": "string"
                    },
                    "gw": {
                        "type": "long"
                    },
                    "players": {
                        "properties": {
                            "id": {
                                "type": "long"
                            },
                            "score": {
                                "type": "long"
                            }
                        }
                    },
                    "transfers": {
                        "properties": {
                            "in": {
                                "type": "long"
                            },
                            "out": {
                                "type": "long"
                            }
                        }
                    }
                }
            }
        });
    }).then(function () {
        return es.indices.putMapping({
            index: "game",
            type: "transfer_order",
            body: {
                "properties": {
                    "account": {
                        "type": "string"
                    },
                    "next": {
                        "type": "string"
                    }
                }
            }
        });
    }).then(function () {
        return es.indices.putMapping({
            index: "game",
            type: "player",
            body: {
                "properties": {
                    "is_available": {
                        "type": "boolean"
                    },
                    "team": {
                        "type": "string"
                    }
                }
            }
        });
    });
}
exports.initMapping = initMapping;

/**
 * Do a gameweek change
 */
function advanceGamesweek(gw) {
    es.search({
        index: "game",
        type: "team",
        body: {
            filter: {
                term: {
                    gw: gw
                }
            }
        }
    }, function (error, response) {
        if (error) throw error;
        var teams = response.hits.hits;
        for (var i = 0; i < teams.length; i++) {
            for (var j = 0; j < teams.length; j++) {
                teams[i]._source.players[j].score = 0;
            }
        }
        for (var i = 0; i < teams.length; i++) {
            es.create({
                index: "game",
                type: "team",
                id: teams[i]._source.account + "_" + (gw + 1),
                body: teams[i]._source
            }, function (error, response) {
                if (error) throw error;
            });
        }
    });
}
exports.advanceGamesweek = advanceGamesweek;