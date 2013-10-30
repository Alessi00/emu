'use strict';

var MainCtrl = angular.module('emulvcApp')
	.controller('MainCtrl', function($scope, $modal, $log, $http, $compile,
		viewState, Iohandlerservice, Soundhandlerservice, ConfigProviderService) {



		$scope.lastkeycode = 'N/A';
		$scope.baseName = undefined;

		// init load of config files
		ConfigProviderService.httpGetConfig();

		// init loading of files for testing
		// Iohandlerservice.httpGetLabelJson('testData/msajc003.json');
		Iohandlerservice.httpGetAudioFile('testData/msajc003.wav');
		Iohandlerservice.httpGetSSFFfile('testData/msajc003.fms');

		// init pure jquery dragbar
		$(".TimelineCtrl").ownDrag(".resizer").ownResize(".resizer");


		/**
		 * listen for configLoaded
		 */
		$scope.$on('configLoaded', function(evt, data) {
			viewState.setspectroSettings(ConfigProviderService.vals.spectrogramSettings.N,
				ConfigProviderService.vals.spectrogramSettings.rangeFrom,
				ConfigProviderService.vals.spectrogramSettings.rangeTo,
				ConfigProviderService.vals.spectrogramSettings.dynamicRange,
				ConfigProviderService.vals.spectrogramSettings.window);

			// $scope.keyMappings = ConfigProviderService.vals.shortcuts;
			if (ConfigProviderService.vals.main.mode == 'standalone') {
				var b = $('<button>').attr({
					'id': 'submenuOpen',
					'data-tooltip': 'Shortcut: O',
					'tooltip-placement': 'bottom',
					'ng-click': 'openFile();',
					'z-index': '9999',
					'class': 'mini-btn'
				}).text('Open File');
				$compile(b)($scope);
				$('#firstButton').after(b);
			} else {
				var b = $('<button>').attr({
					'id': 'submenuOpen',
					'class': 'mini-btn',
					'data-tooltip': 'Shortcut: O',
					'tooltip-placement': 'bottom',
					'z-index': '9999',
					'ng-click': 'openMenu()',
				}).text('Open Menu');
				$compile(b)($scope);
				$('#firstButton').after(b);
			}
		});


		/**
		 * listen for newlyLoadedAudioFile
		 */
		$scope.$on('newlyLoadedAudioFile', function(evt, wavJSO, fileName) {
			viewState.curViewPort.eS = wavJSO.Data.length;
			viewState.curViewPort.bufferLength = wavJSO.length;
			viewState.setscrollOpen(0);
			Soundhandlerservice.wavJSO = wavJSO;
			Soundhandlerservice.setPlayerSrc(wavJSO.origArrBuf);
			Iohandlerservice.httpGetTextGrid('testData/msajc003.TextGrid');
			$scope.baseName = fileName.substr(0,fileName.lastIndexOf("."));
		});
		

				
		
		$scope.renameTier = function() {
		    if(viewState.getcurClickTierName()!==undefined) {
		        $scope.openModal('views/renameTier.html','dialog');
		    }
		    else {
		        $scope.openModal('views/error.html','dialog','Rename Error','Please choose a Tier first !');
		    }
		};
		
		$scope.openModal = function(templatefile, cssStyle, title, content) {
			viewState.setmodalOpen(true);
			var modalInstance = $modal.open({
				backdrop: true,
				keyboard: true,
				backdropClick: true,
				templateUrl: templatefile,
				windowClass: cssStyle,
				controller: 'ModalInstanceCtrl',
				resolve: {
					modalContent: function() {
						return content;
					},
					modalTitle: function() {
						return title;
					},
					windowLength: function() {
						return viewState.spectroSettings.windowLength;
					},
					rangeFrom: function() {
						return viewState.spectroSettings.rangeFrom;
					},
					rangeTo: function() {
						return viewState.spectroSettings.rangeTo;
					},
					dynamicRange: function() {
						return viewState.spectroSettings.dynamicRange;
					},
					window: function() {
						return viewState.spectroSettings.window;
					},
					currentTier: function() {
					    if(viewState.getcurClickTierName()!=='') {
						    return viewState.getcurClickTierName();
						}
						else {
						    return "error";
						}
					}					
				}
			});
		};

		$scope.openSubmenu = function() {
			if (viewState.getsubmenuOpen()) {
				viewState.setsubmenuOpen(false);
				$('#submenuOpen').html('Open Menu');
				$('#menuLeft').removeClass('cbp-spmenu-open');
				$('#TimelineCtrl').removeClass('cbp-spmenu-push-toright');
				$('#HandletiersCtrl').removeClass('cbp-spmenu-push-toright');
				$('#menu').removeClass('cbp-spmenu-push-toright');
				$('#menu-bottom').removeClass('cbp-spmenu-push-toright');
			} else {
				viewState.setsubmenuOpen(true);
				$('#submenuOpen').html('Close Menu');
				$('#menuLeft').addClass('cbp-spmenu-open');
				$('#TimelineCtrl').addClass('cbp-spmenu-push-toright');
				$('#HandletiersCtrl').addClass('cbp-spmenu-push-toright');
				$('#menu').addClass('cbp-spmenu-push-toright');
				$('#menu-bottom').addClass('cbp-spmenu-push-toright');
			}
		};


		$scope.openFile = function() {
			alert('code to open file');
		};

		$scope.setlastkeycode = function(c, shift) {
			$scope.lastkeycode = c;
		};

		$scope.cmd_zoomAll = function() {
			viewState.setViewPort(0, viewState.curViewPort.bufferLength);
		};

		$scope.cmd_zoomSel = function() {
			viewState.setViewPort(viewState.curViewPort.selectS, viewState.curViewPort.selectE);
		};

		$scope.cmd_zoomIn = function() {
			viewState.zoomViewPort(true);
		};

		$scope.cmd_zoomOut = function() {
			viewState.zoomViewPort(false);
		};

		$scope.cmd_zoomLeft = function() {
			viewState.shiftViewPort(false);
		};

		$scope.cmd_zoomRight = function() {
			viewState.shiftViewPort(true);
		};

		$scope.cmd_playView = function() {
			// todo
		};

		$scope.cmd_playSel = function() {
			// todo
		};

		$scope.cmd_playAll = function() {
			// todo
		};

	});