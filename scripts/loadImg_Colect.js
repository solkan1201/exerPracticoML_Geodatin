
//https://code.earthengine.google.com/eef6d7dd79457ba41c04a081c3e94e89
// fluxograma aqui 
//https://lucid.app/lucidchart/e14bedd0-efa4-4a42-a282-0435b0ceb826/edit?beaconFlowId=49DB9E874DF063E1&page=0_0#?folder_id=home&browser=icon
var functExport = function(featCol, name){
    
    var pmtoExpoAsset ={
      collection: featCol,
      description: name,
      assetId: 'users/CartasSol/ROIs/' + name
    }    
    Export.table.toAsset(pmtoExpoAsset)
    
    var pmtoExporDriver ={
      collection: featCol,
      description: name,
      folder: 'CSV'
    }
    Export.table.toDrive(pmtoExporDriver)

    print("Exportando 🚑 " + name )
    
}

var lsTile = {
    124 : [
        '21KZA','21KZU','21KZV','22KBD','22KBE','22KBF'
    ],
    67 : [
        '21KUA','21KUB','21KUR','21KUS','21KUT','21KUU',
        '21KVA','21KVB','21KVR','21KVS','21KVT','21KVU',
        '21KVV','21KWA','21KWB','21KWR','21KWS','21KWT',
        '21KWU','21KWV','21KXA','21KXB','21KXU','21KXV',
        '21LUC','21LUD','21LVC','21LVD','21LVE','21LWC',
        '21LWD','21LWE','21LXC','21LXD','21LXE','21LYD',
        '21LYE'
    ],
    24: [
        '21KVR','21KWA','21KWR','21KWS','21KWT','21KWU',
        '21KWV','21KXA','21KXB','21KXR','21KXS','21KXT',
        '21KXU','21KXV','21KYA','21KYB','21KYS','21KYT',
        '21KYU','21KYV','21KZA','21KZB','21KZU','21KZV',
        '21LXC','21LXD','21LXE','21LYC','21LYD','21LYE',
        '21LZC','22KBD','22KBE','22KBF','22KBG','22LBH'
    ],
    110: [
        '20KRG','20LRH','21KTB','21KUA','21KUB','21KVB',
        '21LTC','21LTD','21LUC','21LUD','21LUE','21LVC',
        '21LVD','21LVE'
    ]    
}

var visData = {
    visS2: {
        min: 20,
        max: 2500,
        bands: ["B4","B3","B2"]
    },
    visAl: {
        min: 0,
        max: 1,
        palette: ['ff6347']
    },
    visCalss:
    {
      min: 0,
      max: 1,
      palette: ['FFFFFF','ff6347']
    }
}

var param = {
    assetAl: 'users/DB_ufba/shapes/dashboard_alerts-shapefile',
    assetGrad: 'users/DB_ufba/shapes/grade_sentinel_brasil',
    assetPan: 'users/diegocosta/BAP_RH_patanal',
    tile: '21KYV',
    orbita: 24,
    start: '2020-02-01',
    dateCort: '2020-06-01',
    end: '2020-08-01',
    ccobert : 70,
    bandasS2: ['B2','B3','B4','B8','B11','B12'],
    bandasS2De: ['B2U','B3U','B4U','B8U','B11U','B12U']
}

var grade = ee.FeatureCollection(param.assetGrad)
var limitPant = ee.FeatureCollection(param.assetPan)
print('grade de Brasil ♻ ', grade)

var imgCol = ee.ImageCollection('COPERNICUS/S2_SR')
                    .filterDate(param.start, param.end)
                    .filter(ee.Filter.eq('SENSING_ORBIT_NUMBER', param.orbita))
                    .filter(ee.Filter.eq('MGRS_TILE', param.tile))
                    .filter(ee.Filter.lt('CLOUDY_PIXEL_PERCENTAGE', param.ccobert))
                    .select(param.bandasS2)

print("Images carregadas ⚑", imgCol)

var imgAntes = imgCol.filterDate(param.start, '2020-06-01')
                        .sort('CLOUDY_PIXEL_PERCENTAGE')
                        .first()

var imgDepois = imgCol.filterDate(param.dateCort, param.end)
                          .sort('CLOUDY_PIXEL_PERCENTAGE')
                                                  .first()

var alertas = ee.FeatureCollection(param.assetAl)
                                .filterBounds(limitPant)
                                .map(function(feat){
                                  return feat.set('Datadetec', ee.Date(feat.get('DataDetec')));
                                })
                                .filter(ee.Filter.gt('Datadetec', ee.Date(param.dateCort)))

print("alertas ⌚ ", alertas.limit(2))
print(alertas.size())

// datasetCloudS2 = ee.ImageCollection('COPERNICUS/S2_CLOUD_PROBABILITY')
//                             .filterDate(param.start, param.end)

var bordaGrade = ee.Image().byte().paint({
    featureCollection: grade,
    color: 1,
    width: 3
});
var bordaAlerta = ee.Image().byte().paint({
    featureCollection: alertas,
    color: 1,
    width: 3
});
var bordaBiomas = ee.Image().byte().paint({
    featureCollection: limitPant,
    color: 1,
    width: 3
});



Map.addLayer(imgAntes, visData.visS2, 'RGBAntes');
Map.addLayer(imgDepois, visData.visS2, 'RGBDepois');
// Map.addLayer(bordaBiomas, {palette: '00FF00'}, 'Bioma')
// Map.addLayer(bordaGrade, {palette: 'ffa500'}, 'Grade')
Map.addLayer(bordaAlerta, visData.visAl, 'Aletas')


//==============================================================//
//==== Processo de Coleta de amostras para ambas imagens========//
//==============================================================//
// Joins das imagens e coleta de amostras 
imgDepois = imgDepois.rename(param.bandasS2De)
imgDepois = imgDepois.addBands(imgAntes)

print("imagem final", imgDepois)

var areaColeta = ee.FeatureCollection(Alertas).merge(NoAlertas)

var pmtosCol ={
  collection: areaColeta, 
  properties: ['classe'], 
  scale: 10, 
  geometries: true
}
var ROIs = imgDepois.sampleRegions(pmtosCol)

print("Revisar ⌨ coletas de 2 ⌚ ", ROIs.limit(2))
print(ee.String("size of ROIs  ☢ : ").cat(ROIs.size()))
print("Histogram of ROIs 💰 : ", ROIs.aggregate_histogram('classe'))

// Exportando os Pontos
// functExport(ROIs, 'ColetaAlertasPantanal')


//==============================================================//
//==== Porcesso de Classificação de imagens SVM e RF ===========//
//==============================================================//

// http://www.lapix.ufsc.br/ensino/reconhecimento-de-padroes/reconhecimento-de-padroessupport-vector-machines/
// https://www.codigofluente.com.br/aula-16-scikit-learn-treinamento-do-modelo-svm/
// var pmtroSVM ={
//     decisionProcedure: 'Margin', 
//     svmType: 'C_SVC', 
//     kernelType: 'RBF'
// }

// var clasifierSVM = ee.Classifier.libsvm(pmtroSVM).train(ROIs, 'classe')
// var imgClassSVM =  imgDepois.classify(clasifierSVM, "SVM")

// var mascSVM = imgClassSVM.eq(1)
// Map.addLayer(imgClassSVM.updateMask(mascSVM), visData.visCalss , "SVM")

var pmtroRF ={
    numberOfTrees: 30, 
    variablesPerSplit: 7, 
    minLeafPopulation: 3
}
var clasifierRF = ee.Classifier.smileRandomForest(pmtroRF).train(ROIs, 'classe')
var imgClassRF =  imgDepois.classify(clasifierRF, "RF")

var mascRF = imgClassRF.eq(1)
Map.addLayer(imgClassRF.updateMask(mascRF), visData.visCalss , "RF")
  