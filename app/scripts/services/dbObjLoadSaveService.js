'use strict';

/**
 * @ngdoc service
 * @name emuwebApp.dbObjLoadSaveService
 * @description
 * # dbObjLoadSaveService
 * Service in the emuwebApp.
 */
angular.module('emuwebApp')
	.service('dbObjLoadSaveService', function dbObjLoadSaveService($log, $q, DataService, viewState, HistoryService, loadedMetaDataService, Ssffdataservice, Iohandlerservice, Binarydatamaniphelper, Wavparserservice, Soundhandlerservice, Ssffparserservice, Validationservice, LevelService, modalService, ConfigProviderService, appStateService, StandardFuncsService) {
		// shared service object
		var sServObj = {};

		/**
		 * general loadBundle method.
		 * @param bndl object containing name attribute of currently loaded bundle
		 */
		sServObj.loadBundle = function (bndl) {
			// check if bndl has to be saved
			if ((HistoryService.movesAwayFromLastSave !== 0 && ConfigProviderService.vals.main.comMode !== 'DEMO')) {
				var curBndl = loadedMetaDataService.getCurBndl();
				if (bndl !== curBndl) {
					// $scope.lastclickedutt = bndl;
					modalService.open('views/saveChanges.html', curBndl.session + ':' + curBndl.name).then(function (messModal) {
						if (messModal === 'saveChanges') {
							// save current bundle
							sServObj.saveBundle().then(function () {
								// load new bundle
								sServObj.loadBundle(bndl);
							});
						} else if (messModal === 'discardChanges') {
							// reset history
							HistoryService.resetToInitState();
							// load new bundle
							sServObj.loadBundle(bndl);
						}
					});
				}
			} else {
				if (bndl !== loadedMetaDataService.getCurBndl()) {
					// reset history
					HistoryService.resetToInitState();
					// reset hierarchy
					viewState.hierarchyState.reset();
					// set state
                    LevelService.deleteEditArea();
                    viewState.setEditing(false);
					viewState.setState('loadingSaving');

					viewState.somethingInProgress = true;
					viewState.somethingInProgressTxt = 'Loading bundle: ' + bndl.name;
					// empty ssff files
					Ssffdataservice.data = [];
					Iohandlerservice.getBundle(bndl.name, bndl.session, loadedMetaDataService.getDemoDbName()).then(function (bundleData) {
						// check if response from http request
						if (bundleData.status === 200) {
							bundleData = bundleData.data;
						}

						// validate bundle
						var validRes = Validationservice.validateJSO('bundleSchema', bundleData);

						if (validRes === true) {

							var arrBuff;

							// set wav file
							arrBuff = Binarydatamaniphelper.base64ToArrayBuffer(bundleData.mediaFile.data);
							viewState.somethingInProgressTxt = 'Parsing WAV file...';

							Wavparserservice.parseWavArrBuf(arrBuff).then(function (messWavParser) {
								var wavJSO = messWavParser;
								viewState.curViewPort.sS = 0;
								viewState.curViewPort.eS = wavJSO.Data.length;
								viewState.curViewPort.selectS = -1;
								viewState.curViewPort.selectE = -1;
								viewState.curClickSegments = [];
								viewState.curClickLevelName = undefined;
								viewState.curClickLevelType = undefined;

								viewState.resetSelect();
								Soundhandlerservice.wavJSO = wavJSO;

								// set all ssff files
								viewState.somethingInProgressTxt = 'Parsing SSFF files...';
								Ssffparserservice.asyncParseSsffArr(bundleData.ssffFiles).then(function (ssffJso) {
									Ssffdataservice.data = ssffJso.data;
									// set annotation
									DataService.setData(bundleData.annotation);
									loadedMetaDataService.setCurBndl(bndl);
									viewState.setState('labeling');
									viewState.somethingInProgress = false;
									viewState.somethingInProgressTxt = 'Done!';
									// FOR DEVELOPMENT:
									// sServObj.saveBundle(); // for testing save function
									// $scope.menuBundleSaveBtnClick(); // for testing save button
									// $scope.showHierarchyBtnClick(); // for devel of showHierarchy modal
									// $scope.spectSettingsBtnClick(); // for testing spect settings dial
								}, function (errMess) {
									modalService.open('views/error.html', 'Error parsing SSFF file: ' + errMess.status.message).then(function () {
										appStateService.resetToInitState();
									});
								});
							}, function (errMess) {
								modalService.open('views/error.html', 'Error parsing wav file: ' + errMess.status.message).then(function () {
									appStateService.resetToInitState();
								});
							});
						} else {
							modalService.open('views/error.html', 'Error validating annotation file: ' + JSON.stringify(validRes, null, 4)).then(function () {
								appStateService.resetToInitState();
							});
						}


					}, function (errMess) {
						// check for http vs websocket response
						if (errMess.data) {
							modalService.open('views/error.html', 'Error loading bundle: ' + errMess.data).then(function () {
								appStateService.resetToInitState();
							});
						} else {
							modalService.open('views/error.html', 'Error loading bundle: ' + errMess.status.message).then(function () {
								appStateService.resetToInitState();
							});
						}
					});
				}
			}
		};

		/**
		 * general purpose save bundle function.
		 * @return promise that is resolved after completion (rejected on error)
		 */
		sServObj.saveBundle = function () {
			// check if something has changed
			// if (HistoryService.movesAwayFromLastSave !== 0) {
			if (viewState.getPermission('saveBndlBtnClick')) {
				var defer = $q.defer();
				viewState.somethingInProgress = true;
				viewState.setState('loadingSaving');
				//create bundle json
				var bundleData = {};
				viewState.somethingInProgressTxt = 'Creating bundle json...';
				bundleData.ssffFiles = [];
				var formants = {};
				// ssffFiles (only FORMANTS are allowed to be manipulated so only this track is sent back to server)
				var formants = Ssffdataservice.getFile('FORMANTS');

				if (formants !== undefined) {
					Ssffparserservice.asyncJso2ssff(formants).then(function (messParser) {
						bundleData.ssffFiles.push({
							'fileExtension': formants.fileExtension,
							'encoding': 'BASE64',
							'data': Binarydatamaniphelper.arrayBufferToBase64(messParser.data)
						});
						sServObj.getAnnotationAndSaveBndl(bundleData, defer);

					}, function (errMess) {
						modalService.open('views/error.html', 'Error converting javascript object to SSFF file: ' + errMess.status.message);
						defer.reject();
					});
				} else {
					sServObj.getAnnotationAndSaveBndl(bundleData, defer);
				}

				return defer.promise;
				// }
			} else {
				$log.info('Action: menuBundleSaveBtnClick not allowed!');
			}

		};


		/**
		 *
		 */
		sServObj.getAnnotationAndSaveBndl = function (bundleData, defer) {
			
			// Validate bundle before saving
			//
			// FIXME can we validate the whole bundleData against bundleSchema?
			// The required attribute mediaFile seems to be always missing ...

			viewState.somethingInProgressTxt = 'Validating bundle ...';

			var validRes = Validationservice.validateJSO('annotationFileSchema', DataService.getData());
			if (validRes !== true) {
				$log.warn ('PROBLEM: trying to save bundle but bundle is invalid. traverseAndClean() will be called.');
				$log.error (validRes);
			}

			// clean to be safe...
			StandardFuncsService.traverseAndClean(DataService.getData());
		
			// re-validate bundle. if it's still not valid, refuse to save data.
			validRes = Validationservice.validateJSO('annotationFileSchema', DataService.getData());
			if (validRes !== true) {
				$log.error ('GRAVE PROBLEM: trying to save bundle but bundle is invalid. traverseAndClean() HAS ALREADY BEEN CALLED.');
				$log.error (validRes);
				
				modalService.open('views/error.html', 'Somehow the data for this bundle has been corrupted. This is most likely a nasty bug difficult to spot. If you are at the IPS right now, please contact an EMU developer immediately.');
				defer.reject();
				viewState.somethingInProgressTxt = '';
				viewState.somethingInProgress = false;
				// FIXME this setState doesn't appear to be enough. I still have to press escape to use most things in the webapp.
				viewState.setState('labeling');
				return;
			}


			// annotation
			bundleData.annotation = DataService.getData();

			var curBndl = loadedMetaDataService.getCurBndl();

			// add session if available
			if (typeof curBndl.session !== 'undefined') {
				bundleData.session = curBndl.session;
			}
			// add finishedEditing if available
			if (typeof curBndl.finishedEditing !== 'undefined') {
				bundleData.finishedEditing = curBndl.finishedEditing;
			}
			// add comment if available
			if (typeof curBndl.comment !== 'undefined') {
				bundleData.comment = curBndl.comment;
			}

			viewState.somethingInProgressTxt = 'Saving bundle...';
			Iohandlerservice.saveBundle(bundleData).then(function () {
				viewState.somethingInProgressTxt = 'Done!';
				viewState.somethingInProgress = false;
				HistoryService.movesAwayFromLastSave = 0;
				defer.resolve();
				viewState.setState('labeling');
			}, function (errMess) {
				// console.log(mess);
				modalService.open('views/error.html', 'Error saving bundle: ' + errMess.status.message).then(function () {
					appStateService.resetToInitState();
				});
				defer.reject();
			});
		};

		return (sServObj);
	});
