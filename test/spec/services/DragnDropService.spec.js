'use strict';

describe('Service: DragnDropService', function () {

  // load the controller's module
  beforeEach(module('emuwebApp'));
  
  var item;
  
  var testData = [
      ['test1','wavData1','annotationData1'],
      ['test2','wavData2','annotationData2']
  ];
  
  it('should resetToInitState', inject(function (DragnDropService) {
    // set any data
    DragnDropService.drandropBundles.push('test');
    DragnDropService.bundleList.push('test');
    DragnDropService.resetToInitState();
    expect(DragnDropService.drandropBundles.length).toBe(0);
    expect(DragnDropService.bundleList.length).toBe(0);
  }));
  

  it('should setData', inject(function ($rootScope, $q, DragnDropService, loadedMetaDataService) {
    // set according data
    var scope = $rootScope.$new();
    var def = $q.defer(); 
    spyOn(loadedMetaDataService, 'setBundleList');
    spyOn(loadedMetaDataService, 'setCurBndlName');
    spyOn(loadedMetaDataService, 'setDemoDbName');
    spyOn(DragnDropService, 'handleLocalFiles');
    spyOn(DragnDropService, 'setDragnDropData');
    spyOn(DragnDropService, 'convertDragnDropData').and.returnValue(def.promise);
    DragnDropService.setData(testData);
    expect(DragnDropService.setDragnDropData).toHaveBeenCalled();
    expect(DragnDropService.convertDragnDropData).toHaveBeenCalledWith([  ], 0);
    def.resolve();
    scope.$apply();
    expect(loadedMetaDataService.setBundleList).toHaveBeenCalled();
    expect(loadedMetaDataService.setCurBndlName).toHaveBeenCalled();
    expect(loadedMetaDataService.setDemoDbName).toHaveBeenCalled();
    expect(DragnDropService.handleLocalFiles).toHaveBeenCalled();
  }));
  
  it('should getBlob', inject(function (DragnDropService) {
     expect(DragnDropService.getBlob().toString()).toBe('[object Blob]');
  })); 
  
  it('should generateDrop', inject(function (DragnDropService) {
     expect(DragnDropService.generateDrop().toString().substr(0, 12)).toBe('blob:http://');
  }));   
  
  it('should setDragnDropData', inject(function (DragnDropService, DragnDropDataService) {
    spyOn(DragnDropDataService, 'setDefaultSession');
    var pak1 = 0;
    var pak2 = 1;
    DragnDropService.setDragnDropData(testData[pak1][0], pak1, 'wav', testData[pak1][1]);
    DragnDropService.setDragnDropData(testData[pak1][0], pak1, 'annotation', testData[pak1][2]);
    DragnDropService.setDragnDropData(testData[pak2][0], pak2, 'wav', testData[pak2][1]);
    DragnDropService.setDragnDropData(testData[pak2][0], pak2, 'annotation', testData[pak2][2]);
    expect(DragnDropDataService.convertedBundles.length).toBe(2);
    expect(DragnDropDataService.setDefaultSession).toHaveBeenCalled();
  }));    
  
  it('should getDragnDropData', inject(function (DragnDropService, DragnDropDataService) {
    spyOn(DragnDropDataService, 'setDefaultSession');
    var pak1 = 0;
    var pak2 = 1;
    DragnDropService.setDragnDropData(testData[pak1][0], pak1, 'wav', testData[pak1][1]);
    DragnDropService.setDragnDropData(testData[pak1][0], pak1, 'annotation', testData[pak1][2]);
    DragnDropService.setDragnDropData(testData[pak2][0], pak2, 'wav', testData[pak2][1]);
    DragnDropService.setDragnDropData(testData[pak2][0], pak2, 'annotation', testData[pak2][2]);
    expect(DragnDropService.getDragnDropData(pak1, 'wav')).toEqual(testData[pak1][1]);
    expect(DragnDropService.getDragnDropData(pak1, 'annotation')).toEqual(testData[pak1][2]);
    expect(DragnDropService.getDragnDropData(pak2, 'wav')).toEqual(testData[pak2][1]);
    expect(DragnDropService.getDragnDropData(pak2, 'annotation')).toEqual(testData[pak2][2]);
  }));
  
});