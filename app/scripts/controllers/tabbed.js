'use strict';

angular.module('emuwebApp')
	.controller('TabbedCtrl', function ($scope, ConfigProviderService, Validationservice) {

		$scope.cps = ConfigProviderService;
		$scope.valid = Validationservice;
		$scope.tabs = [{
				title: 'Level Definitions',
				url: 'views/tabbed/levelDefinition.html'
			}, {
				title: 'Link Definitions',
				url: 'views/tabbed/linkDefinition.html'
			}, {
				title: 'ssff Track Definitions',
				url: 'views/tabbed/ssffDefinition.html'
			}, {
				title: 'EMU-webApp',
				url: 'views/tabbed/emuDefinition.html'
			},{
				title: 'global DB',
				url: 'views/tabbed/globalDefinition.html'
		}];
		$scope.currentTab = 'views/tabbed/levelDefinition.html';
		// holds all possible level type values from config ie ITEM EVENT etc
		$scope.optionsLevelTypes = [];
		// holds all possible attribute values from config ie STRING
		$scope.optionsLevelAttributes = [];
		$scope.levelTypes = [];
		$scope.levelAttributes = [];
		
		$scope.setup = function () {
		    var i = 1;
		    // read db config file for enum types
		    var dbconfigFileSchema = $scope.valid.getSchema('DBconfigFileSchema');
		    // set levelDefinitions.items.properties.type.enum array
			angular.forEach(dbconfigFileSchema.data.properties.levelDefinitions.items.properties.type.enum, function (type) {
				$scope.optionsLevelTypes.push({ label: type, value: i });
				++i;
			});
			// set attributeDefinitions.items.properties.type.enum array
			i = 1
			angular.forEach(dbconfigFileSchema.data.properties.levelDefinitions.items.properties.attributeDefinitions.items.properties.type.enum, function (type) {
				$scope.optionsLevelAttributes.push({ label: type, value: i });
				++i;
			});
			i = 0
			// because of ng-option by reference :
			angular.forEach($scope.cps.curDbConfig.levelDefinitions, function (definition) {
				var j = 0;
				angular.forEach($scope.optionsLevelTypes, function (type) {
				    if(type.label == definition.type) {
				        $scope.levelTypes.push($scope.optionsLevelTypes[j]);
				    }
				    j++;
			    });
				angular.forEach(definition.attributeDefinitions, function (attribute) {
				    j = 0;
				    angular.forEach($scope.optionsLevelAttributes, function (type) {
				        if(type.label == attribute.type) {
				            if($scope.levelAttributes[i] === undefined) {
				                $scope.levelAttributes[i] = [];
				            }
				            $scope.levelAttributes[i].push($scope.optionsLevelAttributes[j]);
				        }
				        j++;
				    });
			    });
			    i++			    
			});
			
		}
		
		$scope.deleteLevelDefinition = function (key) {
		    console.log(key);
		}
		
		$scope.getTypeOfLevel = function (name) {
		    var i = 0;
		    var ret = -1;
			angular.forEach($scope.optionsLevelTypes, function (type) {
				if(type.label == name) {
				    ret = i;
				}
				i++;
			});
		    return ret;
		}
		
		$scope.onClickTab = function (tab) {
			$scope.currentTab = tab.url;
		}
	
		$scope.isActiveTab = function(tabUrl) {
			if(tabUrl == $scope.currentTab) {
				return {
					'background-color': '#FFF',
					'color': '#000'
				}
			}
			return {};
		}
		$scope.setup();
});