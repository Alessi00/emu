import * as angular from 'angular';

angular.module('emuwebApp')
	.service('ConfigProviderService', function ($q, viewState) {

		/**
	 	*
	 	*/
		function onlyUnique(value, index, self) {
			return self.indexOf(value) === index;
		}

		this.vals = {};
		this.design = {};
		this.curDbConfig = {};
		this.initDbConfig = {};

		// embedded values -> if these are set this overrides the normal config
		this.embeddedVals = {
			audioGetUrl: '',
			labelGetUrl: '',
			labelType: '',
			fromUrlParams: false
		};

		this.setDesign = function (data) {
			angular.copy(data, this.design);
		};

		/**
		 * depth of 2 = max
		 */
		this.setVals = function (data) {
			if ($.isEmptyObject(this.vals)) {
				this.vals = data;
			} else {
				Object.keys(data).forEach((key1) => {
					// if array... overwrite entire thing!
					if (angular.isArray(this.vals[key1])) {
						//empty array
						this.vals[key1] = [];
						data[key1].forEach((itm) => {
							this.vals[key1].push(itm);
						});
					} else {
						Object.keys(data[key1]).forEach((key2) => {
							if (this.vals[key1][key2] !== undefined) {
								this.vals[key1][key2] = data[key1][key2];
							} else {
								console.error('BAD ENTRY IN CONFIG! Key1: ' + key1 + ' key2: ' + key2);
							}
						});
					}

				});
			}
		};

		this.getDelta = function (current) {
			var defer = $q.defer();
			var ret = this.getDeltas(current, this.initDbConfig);
			defer.resolve(ret);
			return defer.promise;
		};

		this.getDeltas = function (current, start) {
			var ret = {};
			current.forEach( (value, key) => {
				if (!angular.equals(value, start[key])) {
					if(Array.isArray(value)) {
						ret[key] = [];
						angular.copy(value, ret[key]);
					}
					else if(typeof value === 'object'){
						ret[key] = {};
						ret[key] = this.getDeltas(value, start[key]);
					}
					else {
						if(key !== 'clear' && key !== 'openDemoDB' && key !== 'specSettings') {
							ret[key] = value;
						}

					}
				}
			});
			return ret;
		};

		/**
		 *
		 */
		this.getSsffTrackConfig = function (name) {
			var res;
			if (this.curDbConfig.ssffTrackDefinitions !== undefined) {
				this.curDbConfig.ssffTrackDefinitions.forEach((tr) => {
					if (tr.name === name) {
						res = tr;
					}
				});
			}
			return res;
		};

        /**
         *
         */
        this.getValueLimsOfTrack = function (trackName) {
            var res = {};
            this.vals.perspectives[viewState.curPerspectiveIdx].signalCanvases.minMaxValLims.forEach((vL) => {
                if (vL.ssffTrackName === trackName) {
                    res = vL;
                }
            });

            return res;
        };

		/**
		 *
		 */
		this.getHorizontalLinesOfTrack = function (trackName) {
			var res;
			this.vals.perspectives[viewState.curPerspectiveIdx].signalCanvases.horizontalLines.forEach((vL) => {
				if (vL.ssffTrackName === trackName) {
					res = vL;
				}
			});
			return res;
		};

		/**
		 *
		 */
		this.getContourLimsOfTrack = function (trackName) {
			var res = {};
			this.vals.perspectives[viewState.curPerspectiveIdx].signalCanvases.contourLims.forEach((cL) => {
				if (cL.ssffTrackName === trackName) {
					res = cL;
				}
			});

			return res;
		};


        /**
		 *
		 */
		this.getContourColorsOfTrack = function (trackName) {
			var res;
			this.vals.perspectives[viewState.curPerspectiveIdx].signalCanvases.contourColors.forEach((cC) => {
				if (cC.ssffTrackName === trackName) {
					res = cC;
				}
			});

			return res;
		};

		/**
		 *
		 */
		this.getAssignment = function (signalName) {
			var res = {};
			this.vals.perspectives[viewState.curPerspectiveIdx].signalCanvases.assign.forEach((a) => {
				if (a.signalCanvasName === signalName) {
					res = a;
				}
			});

			return res;
		};

		/**
		 *
		 */
		this.getLevelDefinition = function (levelName) {
			var res = {};
			this.curDbConfig.levelDefinitions.forEach((ld) => {
				if (ld.name === levelName) {
					res = ld;
				}
			});

			return res;
		};

		/**
		 *
		 */
		this.getAttrDefsNames = function (levelName) {
			var res = [];
			this.getLevelDefinition(levelName).attributeDefinitions.forEach((ad) => {
				res.push(ad.name);
			});

			return res;
		};


		/**
		 *
		 */
		this.setPerspectivesOrder = function (curPerspective, levelName) {
			if (this.vals !== undefined) {
				if (this.vals.perspectives !== undefined) {
					if (this.vals.perspectives[curPerspective] !== undefined) {
						if (this.vals.perspectives[curPerspective].levelCanvases !== undefined) {
							this.vals.perspectives[curPerspective].levelCanvases.order = levelName;
						}
					}
				}
			}
		};

		/**
		 *  replace ascii codes from config with strings
		 */
		this.getStrRep = function (code) {
			var str;
			switch (code) {
				case 8:
					str = 'BACKSPACE';
					break;
				case 9:
					str = 'TAB';
					break;
				case 13:
					str = 'ENTER';
					break;
				case 16:
					str = 'SHIFT';
					break;
				case 18:
					str = 'ALT';
					break;
				case 32:
					str = 'SPACE';
					break;
				case 37:
					str = '←';
					break;
				case 39:
					str = '→';
					break;
				case 38:
					str = '↑';
					break;
				case 40:
					str = '↓';
					break;
				case 42:
					str = '+';
					break;
				case 43:
					str = '+';
					break;
				case 45:
					str = '-';
					break;
				case 95:
					str = '-';
					break;
				default:
					str = String.fromCharCode(code);
			}
			return str;
		};


	/**
	 *
	 */
	this.findAllTracksInDBconfigNeededByEMUwebApp = function() {
		var DBconfig = this.curDbConfig;
		var allTracks = [];

	   // anagestConfig ssffTracks
	   DBconfig.levelDefinitions.forEach((ld) => {
		   if (ld.anagestConfig !== undefined) {
			   allTracks.push(ld.anagestConfig.verticalPosSsffTrackName);
			   allTracks.push(ld.anagestConfig.velocitySsffTrackName);
		   }
	   });


	   DBconfig.EMUwebAppConfig.perspectives.forEach((p) => {
		   // tracks in signalCanvases.order
		   p.signalCanvases.order.forEach((sco) => {
			   allTracks.push(sco);
		   });
		   // tracks in signalCanvases.assign
		   if (p.signalCanvases.assign !== undefined) {
			   p.signalCanvases.assign.forEach((sca) => {
				   allTracks.push(sca.ssffTrackName);
			   });
		   }
		   // tracks in twoDimCanvases
		   if (p.twoDimCanvases !== undefined) {
			   if (p.twoDimCanvases.order[0] === 'EPG') {
				   allTracks.push('EPG');
			   }
			   if (p.twoDimCanvases.twoDimDrawingDefinitions !== undefined) {
				   p.twoDimCanvases.twoDimDrawingDefinitions.forEach((tddd) => {
					   tddd.dots.forEach((dot) => {
						   allTracks.push(dot.xSsffTrack);
						   allTracks.push(dot.ySsffTrack);
					   });
				   });
			   }
		   }
	   });
	   // uniq tracks
	   allTracks = allTracks.filter(onlyUnique);
	   // # remove OSCI and SPEC tracks
	   var osciIdx = allTracks.indexOf('OSCI');
	   if (osciIdx > -1) {
		   allTracks.splice(osciIdx, 1);
	   }
	   var specIdx = allTracks.indexOf('SPEC');
	   if (specIdx > -1) {
		   allTracks.splice(specIdx, 1);
	   }

	   // get corresponding ssffTrackDefinitions
	   var allTrackDefs = [];
	   DBconfig.ssffTrackDefinitions.forEach((std) => {
		   if (allTracks.indexOf(std.name) > -1) {
			   allTrackDefs.push(std);
		   }
	   });

	   return (allTrackDefs);

    };

	});
