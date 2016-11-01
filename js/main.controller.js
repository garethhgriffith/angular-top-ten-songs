var app = angular.module('app', ['spotify', 'angularModalService', 'ngAnimate']);

app.config(['$compileProvider',
    function($compileProvider) {
        $compileProvider.aHrefSanitizationWhitelist(/^\s*(https?|ftp|mailto|tel|file|blob):/);
    }
]);

app.controller('ListController', ['$scope', '$http', 'ModalService', 'Spotify', function($scope, $http, ModalService, Spotify) {
    $scope.trackList = {
        title: "Top 10 List",
        songs: []
    };

    /**
     * Calls the Spotify API to seach for tracks using an album, band or track name
     */
    $scope.searchTrack = function() {
        Spotify.search($scope.searchtrack, 'track').then(function(data) {
            $scope.tracks = data.tracks.items;
        });
    };
    
    /**
     * Display the add a song modal. Allows the user to input a custom image URL and track notes.
     * Prevents the user from adding more than 10 songs to the list.
     * Additional error checking on the image URL to catch malformed URL's and XSS headers.
     */
    $scope.showAddSong = function(trackInfo) {
        ModalService.showModal({
            templateUrl: "fragments/addSongModal.html",
            controller: "AddSongModal",
            inputs: {
                title: "Add at Track",
                artist: trackInfo.$$watchers[1].last,
                album: trackInfo.$$watchers[0].last,
                track: trackInfo.$$watchers[2].last,
                image: trackInfo.$$watchers[4].last
            }
        }).then(function(modal) {
            modal.element.modal();
            modal.close.then(function(result) {
                if (Object.keys(result).length != 0) {
                    if ($scope.trackList.songs.length < 10) {
                        if (result.customImage != null) {
                            $http.get(result.customImage)
                                .then(function(response) {
                                        delete result.image;
                                        $scope.trackList.songs.push(result);
                                        updateList($scope.trackList);
                                    },
                                    function(response) {
                                        if (response.status == -1) {
                                            showErrorModal("There was an issue adding your image. Please make sure you have permission to use this file.");
                                        } else {
                                            showErrorModal("There was an issue adding your image. Please check the URL and try again.");
                                        }
                                    });
                        } else {
                            result.customImage = result.image;
                            delete result.image;
                            $scope.trackList.songs.push(result);
                            updateList($scope.trackList);
                        }
                    } else {
                        showErrorModal('You have already added the maximum number of songs (10) to your list.');
                    }
                }
            });
        });
    };
    
    /**
     * Upadates the JSON Blob and link
     * @param {JSON} jsonObj the updated JSON object
     */
    function updateList(jsonObj) {
        var saveListBtn = document.querySelector('#saveListBtn');
        var file = new Blob([JSON.stringify(jsonObj, null, 2)], { type: 'application/json' });
        $scope.url = URL.createObjectURL(file);
    };

    /**
     * Displays the edit title modal that allows the user to change the title of the list
     */
    $scope.showEditTitle = function() {
        ModalService.showModal({
            templateUrl: "fragments/editListTitle.html",
            controller: "EditListTitle",
            inputs: {
                listTitle: $scope.trackList.title
            }
        }).then(function(modal) {
            modal.element.modal();
            modal.close.then(function(result) {
                $scope.trackList.title = result.listTitle;
                updateList($scope.trackList);
            });
        });
    };

    /**
     * Displays an error modal with a custom message
     * @param {String} errorMsg the error message to be displayed
     */
    showErrorModal = function(errorMsg) {
        ModalService.showModal({
            templateUrl: "fragments/errorModal.html",
            controller: "ErrorModal",
            inputs: {
                errorMsg: errorMsg
            }
        }).then(function(modal) {
            modal.element.modal();
            modal.close.then(function(result) {});
        });
    };
}]);

app.controller('AddSongModal', [
    '$scope', '$element', 'title', 'artist', 'track', 'album', 'image', 'close',
    function($scope, $element, title, artist, track, album, image, close) {
        $scope.title = title;
        $scope.artist = artist;
        $scope.track = track;
        $scope.album = album;
        $scope.image = image;
        $scope.customImage = null;
        $scope.note = null;

        $scope.close = function() {
            close({}, 500);
        };
        $scope.save = function() {
            $element.modal('hide');
            close({
                track: $scope.track,
                artist: $scope.artist,
                album: $scope.album,
                note: $scope.note,
                image: $scope.image,
                customImage: $scope.customImage,
            }, 500);
        };
    }
]);

app.controller('EditListTitle', [
    '$scope', '$element', 'listTitle', 'close',
    function($scope, $element, listTitle, close) {
        $scope.listTitle = listTitle;
        $scope.close = function() {
            close({
                listTitle: listTitle
            }, 500);
        };
        $scope.save = function() {
            $element.modal('hide');
            close({
                listTitle: $scope.listTitle
            }, 500);
        };
    }
]);

app.controller('ErrorModal', [
    '$scope', '$element', 'errorMsg', 'close',
    function($scope, $element, errorMsg, close) {
        $scope.errorMsg = errorMsg;
        $scope.close = function() {
            close({
                errorMsg: errorMsg
            }, 500);
        };
    }
]);
