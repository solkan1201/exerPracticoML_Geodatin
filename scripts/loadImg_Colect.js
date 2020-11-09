
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
    }
}

var param = {
    assetAl: 'users/DB_ufba/shapes/dashboard_alerts-shapefile',
    assetGrad: 'users/DB_ufba/shapes/grade_sentinel_brasil',
    tile: lsTile['67'],
    orbita: 67,
    start: '2020-02-01',
    end: '2020-07-01',
    ccobert : 70,
    bandasS2: ['B2','B3','B4','B8','B11','B12']
}

var grade = ee.FeatureCollection(param.assetGrad)
print('grade de Brasil', grade)
var imgCol = ee.ImageCollection('COPERNICUS/S2_SR')
                    .filterDate(param.start, param.end)
                    .filter(ee.Filter.eq('SENSING_ORBIT_NUMBER', param.orbita))
                    .filter(ee.Filter.inList('MGRS_TILE', param.tile))
                    .filter(ee.Filter.lt('CLOUDY_PIXEL_PERCENTAGE', param.ccobert))
                    .select(param.bandasS2)

print(imgCol)

var limite = grade.filter(ee.Filter.inList('NAME', param.tile))
var alertas = ee.FeatureCollection(param.assetAl).filterBounds(limite)
                            .filter(ee.Filter.gt('DataDetec', ee.Date(param.start)))


// datasetCloudS2 = ee.ImageCollection('COPERNICUS/S2_CLOUD_PROBABILITY')
//                             .filterDate(param.start, param.end)

var bordaLimit = ee.Image().byte().paint({
    featureCollection: limite,
    color: 1,
    width: 3
  });
var bordaAlerta = ee.Image().byte().paint({
    featureCollection: alertas,
    color: 1,
    width: 3
  });
Map.addLayer(bordaLimit, {palette: 'ffa500'}, 'limit')
Map.addLayer(bordaAlerta, visData.visAl, 'Aletas')